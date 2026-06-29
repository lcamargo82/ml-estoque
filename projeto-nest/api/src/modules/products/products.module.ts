import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '@modules/products/entities/product.entity';
import { ProductImage } from '@modules/products/entities/product-image.entity';
import { ProductsService } from '@modules/products/products.service';
import { ProductsController } from '@modules/products/products.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductImage])],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
