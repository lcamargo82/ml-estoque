import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '@modules/products/entities/product.entity';
import { ProductImage } from '@modules/products/entities/product-image.entity';
import { CreateProductDto, UpdateProductDto } from '@modules/products/dto/product.dto';
import slugify from 'slugify';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto, username: string): Promise<Product> {
    const { images, ...productData } = createProductDto;

    const slug = productData.slug || slugify(productData.name, { lower: true });

    const product = this.productRepository.create({
      ...productData,
      slug,
      createdBy: username,
      updatedBy: username,
      images: images?.map((url, index) => ({ url, index } as any)) || [],
    });

    return this.productRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({
      relations: ['supplier', 'images'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['supplier', 'images'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, username: string): Promise<Product> {
    const product = await this.findOne(id);
    const { images, ...productData } = updateProductDto;

    // Handle slug auto-generation if name changes and slug is not provided
    if (productData.name && !productData.slug) {
      productData.slug = slugify(productData.name, { lower: true });
    }

    Object.assign(product, {
      ...productData,
      updatedBy: username,
    });

    if (images) {
      // For simplicity, we replace images. 
      // A more robust solution would diff them, but cascaded replace works for MVP.
      product.images = images.map((url, index) => ({ url, index } as any));
    }

    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.softRemove(product);
  }
}
