import { Entity, Column, Index, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Supplier } from '@modules/suppliers/entities/supplier.entity';
import { ProductImage } from './product-image.entity';

@Entity('products')
@Index(['slug'], { unique: true })
@Index(['sku'], { unique: true })
export class Product extends BaseEntity {
  @Column()
  name: string;

  @Column()
  sku: string;

  @Column()
  slug: string;

  @Column({ name: 'supplier_id', nullable: true })
  supplierId: string;

  @ManyToOne(() => Supplier, { nullable: true })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ name: 'purchase_price', type: 'decimal', precision: 10, scale: 2, default: 0 })
  purchasePrice: number;

  @Column({ name: 'ml_selling_price', type: 'decimal', precision: 10, scale: 2, default: 0 })
  mlSellingPrice: number;

  @Column({ name: 'direct_selling_price', type: 'decimal', precision: 10, scale: 2, default: 0 })
  directSellingPrice: number;

  @Column({ name: 'is_listed_on_ml', default: false })
  isListedOnML: boolean;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true })
  images: ProductImage[];
}
