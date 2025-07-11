import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { CouponsModule } from './coupons/coupons.module';

@Module({
  imports: [PrismaModule, ProductsModule, CouponsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
