import { Transform, Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsDate,
  Matches,
} from 'class-validator';
import { CouponType } from '@prisma/client';

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'Code must be alphanumeric and contain no spaces',
  })
  @Transform(({ value }) => value.toLowerCase())
  code: string;

  @IsEnum(CouponType)
  @IsNotEmpty()
  type: CouponType;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  value: number;

  @IsBoolean()
  @IsOptional()
  oneShot: boolean = false;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  validFrom: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  validUntil: Date;
}