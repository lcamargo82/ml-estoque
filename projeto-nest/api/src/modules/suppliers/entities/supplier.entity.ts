import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';

@Entity('suppliers')
export class Supplier extends BaseEntity {
  @Column()
  name: string;

  @Column({ name: 'tax_id', nullable: true })
  taxId: string;

  @Column({ name: 'contact_info', nullable: true })
  contactInfo: string;
}
