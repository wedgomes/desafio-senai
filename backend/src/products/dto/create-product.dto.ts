import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(300)
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(0)
  @Max(999999)
  @IsNotEmpty()
  @Type(() => Number) // Garante que o valor seja transformado em número
  stock: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(1000000.0)
  @IsNotEmpty()
  @Type(() => Number) // Garante que o valor seja transformado em número
  price: number;
}