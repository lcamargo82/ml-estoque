import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '@modules/products/entities/product.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getStats() {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .select('COUNT(product.id)', 'totalProducts')
      .addSelect('COALESCE(SUM(product.quantity), 0)', 'totalQuantity')
      .addSelect('COALESCE(SUM(product.quantity * product.purchase_price), 0)', 'totalCostValue')
      .addSelect('COUNT(CASE WHEN product.is_listed_on_ml = true THEN 1 END)', 'totalListed')
      .addSelect('COUNT(CASE WHEN product.is_listed_on_ml = false THEN 1 END)', 'totalUnlisted')
      .getRawOne();

    return {
      totalProducts: parseInt(result.totalProducts, 10) || 0,
      totalQuantity: parseInt(result.totalQuantity, 10) || 0,
      totalCostValue: parseFloat(result.totalCostValue) || 0,
      totalListed: parseInt(result.totalListed, 10) || 0,
      totalUnlisted: parseInt(result.totalUnlisted, 10) || 0,
    };
  }
}
