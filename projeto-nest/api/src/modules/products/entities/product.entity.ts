import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';

@Entity('products')
@Index(['slug'], { unique: true })
export class Product extends BaseEntity {
  @Column()
  name: string;

  @Column()
  slug: string;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ name: 'cost_price', type: 'decimal', precision: 10, scale: 2 })
  costPrice: number;

  @Column({ name: 'selling_price', type: 'decimal', precision: 10, scale: 2 })
  sellingPrice: number;
}
