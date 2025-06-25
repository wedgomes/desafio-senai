import { Injectable, NotFoundException, ConflictException, UnprocessableEntityException, BadRequestException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateProductDto } from './dto/update-product.dto';
import { $Enums, Prisma } from '@prisma/client';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) {}

    private normalizeName(name: string): string {
        return name.trim().toLowerCase().replace(/\s+/g, ' ');
    }

    async create(createProductDto: CreateProductDto) {
        const normalizedName = this.normalizeName(createProductDto.name);

        try {
            return await this.prisma.product.create({
                data: {
                    ...createProductDto,
                    normalizedName: normalizedName, // Salva o nome normalizado
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictException('A product with this name already exists.');
            }
            throw error;
        }
    }

    async update(id: number, updateProductDto: UpdateProductDto) {
        await this.findOne(id);

        const data: Prisma.ProductUpdateInput = { ...updateProductDto };

        if (updateProductDto.name) {
            data.normalizedName = this.normalizeName(updateProductDto.name);
        }

        try {
            return await this.prisma.product.update({ where: { id }, data });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictException('A product with this name already exists.');
            }
            throw error;
        }
    }

  async findAll(query: PaginationQueryDto) {
      const {
        page,
        limit,
        search,
        minPrice,
        maxPrice,
        hasDiscount,
        sortBy,
        sortOrder,
        includeDeleted,
        onlyOutOfStock,
        withCouponApplied,
      } = query;

      // 1. Construir a cláusula WHERE dinamicamente
      const where: Prisma.ProductWhereInput = {};
      if (!includeDeleted) {
        where.deletedAt = null; // Condição base: apenas produtos ativos
      }
      if (search) {
        where.OR = [
          { name: { contains: search} },
          { description: { contains: search } },
        ];
      }
      if (minPrice || maxPrice) {
        where.price = { gte: minPrice, lte: maxPrice };
      }
      if (onlyOutOfStock) {
        where.stock = 0;
      }
      
      if (hasDiscount === true || withCouponApplied === true) {
        where.couponApplications = { some: { removedAt: null } };
      } else if (hasDiscount === false) {
        where.couponApplications = { none: { removedAt: null } };
      }
      
      // 2. Construir a cláusula ORDER BY
      const orderBy: Prisma.ProductOrderByWithRelationInput = {
        [sortBy || 'createdAt']: sortOrder || 'desc',
      };

      // 3. Executar as queries para obter os itens e a contagem total
      const [totalItems, products] = await this.prisma.$transaction([
        this.prisma.product.count({ where }),
        this.prisma.product.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
          include: { // Incluímos o cupom ativo para calcular o preço final
            couponApplications: {
              where: { removedAt: null },
              include: { coupon: true },
            },
          },
        }),
      ]);
      
      // 4. Calcular o preço final e formatar a resposta
      const formattedProducts = products.map((product) => {
        const activeApplication = product.couponApplications[0];
        let finalPrice = product.price;
        let discount: {
          type: $Enums.CouponType;
          value: Prisma.Decimal;
          applied_at: Date;
          } | null = null;

        if (activeApplication) {
          const coupon = activeApplication.coupon;
          if (coupon.type === 'percent') {
            finalPrice = new Prisma.Decimal((Number(product.price) * (1 - Number(coupon.value) / 100)).toFixed(2));
          } else if (coupon.type === 'fixed') {
            finalPrice = new Prisma.Decimal((Number(product.price) - Number(coupon.value)).toFixed(2));
          }
          discount = {
            type: coupon.type,
            value: coupon.value,
            applied_at: activeApplication.appliedAt,
          };
        }
        
        delete (product as any).couponApplications;

        return {
          ...product,
          price: Number(product.price), // Garante que o preço seja número
          finalPrice: finalPrice.toNumber() < 0.01 ? Number(product.price) : Number(finalPrice),
          is_out_of_stock: product.stock === 0,
          hasCouponApplied: !!activeApplication,
          discount,
        };
      });

      // 5. Construir o objeto de metadados da paginação
      const totalPages = Math.ceil(totalItems / limit);
      const meta = { page, limit, totalItems, totalPages };

      return { data: formattedProducts, meta };
  }


  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: id, deletedAt: null },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID #${id} not found`);
    }

    return product;
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.product.update({
        where: { id },
        data: { deletedAt: new Date() }, 
    });
  }

  async restore(id: number) {
    const product = await this.prisma.product.findUnique({
        where: { id, deletedAt: { not: null } },
    });

    if (!product) {
        throw new NotFoundException(`Inactive product with ID #${id} not found.`);
    }

    return this.prisma.product.update({
        where: { id },
        data: { deletedAt: null },
    });
  }

  async applyCoupon(productId: number, applyCouponDto: ApplyCouponDto) {
    const { code } = applyCouponDto;
    const normalizedCouponCode = code.trim().toLowerCase();

    return this.prisma.$transaction(async (tx) => {
        // 1. Validar produto
        const product = await tx.product.findUniqueOrThrow({
            where: { id: productId, deletedAt: null },
        });

        // 2. Checar se já existe um desconto ativo
        const existingApplication = await tx.productCouponApplication.findFirst({
            where: { productId: product.id, removedAt: null },
        });
        if (existingApplication) {
            throw new ConflictException('Product already has an active discount.');
        }

        // 3. Validar cupom
        const coupon = await tx.coupon.findUniqueOrThrow({
            where: { code: normalizedCouponCode, deletedAt: null },
        });
        const now = new Date();
        if (now < coupon.validFrom || now > coupon.validUntil) {
            throw new BadRequestException('Coupon is not valid at this time.');
        }

        // 4. Validar preço final
        let finalPrice = Number(product.price);
        if (coupon.type === 'percent') {
            finalPrice *= 1 - Number(coupon.value) / 100;
        } else {
            finalPrice -= Number(coupon.value);
        }
        if (finalPrice < 0.01) {
            throw new UnprocessableEntityException('Discount results in a price below the minimum of R$0.01.');
        }

        // 5. Aplicar o cupom
        await tx.productCouponApplication.create({
            data: {
                productId: product.id,
                couponId: coupon.id,
            },
        });

        // Retorna o produto com o novo estado (reutilizando nosso findOne)
        return this.findOne(productId); 
    });
  }


  async removeDiscount(productId: number) {
    const activeApplication = await this.prisma.productCouponApplication.findFirst({
        where: {
            productId: productId,
            removedAt: null,
        },
    });

    if (activeApplication) {
        await this.prisma.productCouponApplication.update({
            where: { id: activeApplication.id },
            data: { removedAt: new Date() },
        });
    }
    // Se não houver desconto, não há nada a fazer, a operação é um sucesso.
  }
}