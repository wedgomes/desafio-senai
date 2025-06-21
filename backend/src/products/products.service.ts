import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) {}

    // Função helper privada para normalizar nomes
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
            // Captura o erro de constraint única do Prisma (P2002)
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictException('A product with this name already exists.');
            }
            throw error;
        }
    }

    async update(id: number, updateProductDto: UpdateProductDto) {
        await this.findOne(id);

        const data: Prisma.ProductUpdateInput = { ...updateProductDto };

        // Se o nome está sendo atualizado, precisamos atualizar o nome normalizado também
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

  async findAll() {
    return this.prisma.product.findMany({
      where: { deletedAt: null },
    });
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
}