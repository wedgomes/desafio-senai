import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  private normalizeCode(code: string): string {
    return code.trim().toLowerCase();
  }

  async create(createCouponDto: CreateCouponDto) {
    // Validações de negócio complexas
    if (createCouponDto.validUntil <= createCouponDto.validFrom) {
      throw new BadRequestException('validUntil must be after validFrom.');
    }
    if (createCouponDto.type === 'percent' && (createCouponDto.value < 1 || createCouponDto.value > 80)) {
      throw new BadRequestException('Percentage value must be between 1 and 80.');
    }
    if (createCouponDto.type === 'fixed' && createCouponDto.value <= 0) {
      throw new BadRequestException('Fixed value must be positive.');
    }

    const normalizedCode = this.normalizeCode(createCouponDto.code);

    try {
      return await this.prisma.coupon.create({
        data: { ...createCouponDto, code: normalizedCode }, // Salva o código já normalizado
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('A coupon with this code already exists.');
      }
      throw error;
    }
  }

  async findOneByCode(code: string) {
    const normalizedCode = this.normalizeCode(code);
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: normalizedCode, deletedAt: null },
    });
    if (!coupon) {
      throw new NotFoundException(`Coupon with code "${code}" not found.`);
    }
    return coupon;
  }

}