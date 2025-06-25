import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Query
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Delete, HttpCode } from '@nestjs/common';
import { Patch } from '@nestjs/common';
import { PaginationQueryDto } from './dto/pagination-query.dto'; // Importe nosso novo DTO
import { ApplyCouponDto } from './dto/apply-coupon.dto';

@Controller('products') // prefixo da rota para /products
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.productsService.findAll(paginationQuery);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateProductDto: UpdateProductDto,
  ) {
      return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(204) 
  remove(@Param('id', ParseIntPipe) id: number) {
      return this.productsService.remove(id);
  }

  @Post(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
      return this.productsService.restore(id);
  }

  @Post(':id/discount/coupon')
  applyCoupon(
      @Param('id', ParseIntPipe) id: number,
      @Body() applyCouponDto: ApplyCouponDto,
  ) {
      return this.productsService.applyCoupon(id, applyCouponDto);
  }

  @Delete(':id/discount')
  @HttpCode(204)
  removeDiscount(@Param('id', ParseIntPipe) id: number) {
      return this.productsService.removeDiscount(id);
  }
}