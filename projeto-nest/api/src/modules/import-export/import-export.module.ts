import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '@modules/products/entities/product.entity';
import { Supplier } from '@modules/suppliers/entities/supplier.entity';
import { ProductImage } from '@modules/products/entities/product-image.entity';
import { ImportExportService } from './import-export.service';
import { ImportExportController } from './import-export.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Supplier, ProductImage])],
  controllers: [ImportExportController],
  providers: [ImportExportService],
  exports: [ImportExportService],
})
export class ImportExportModule {}
