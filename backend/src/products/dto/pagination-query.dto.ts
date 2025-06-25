import { Type, Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  Max,
  IsNumber,
  IsIn,
  IsBoolean,
} from 'class-validator';

// Helper para transformar strings 'true'/'false' em booleanos
const toBoolean = (value: string) => value === 'true';

export class PaginationQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50) // Conforme especificado, o limite é entre 1 e 50
  @Type(() => Number)
  limit: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  hasDiscount?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['name', 'price', 'createdAt', 'stock']) // Campos permitidos para ordenação
  sortBy?: 'name' | 'price' | 'createdAt' | 'stock';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc']) // Direções permitidas
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  includeDeleted?: boolean = false;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  onlyOutOfStock?: boolean = false;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  withCouponApplied?: boolean = false; // Similar a hasDiscount
}