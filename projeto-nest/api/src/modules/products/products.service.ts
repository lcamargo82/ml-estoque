import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '@modules/products/entities/product.entity';
import { ProductImage } from '@modules/products/entities/product-image.entity';
import { CreateProductDto, UpdateProductDto } from '@modules/products/dto/product.dto';
import slugify from 'slugify';
import { saveBase64Image } from '@common/utils/file-upload.utils';
import { join } from 'path';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
  ) {}

  private async processImages(images: string[]): Promise<any[]> {
    if (!images || images.length === 0) return [];

    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const baseUrl = process.env.API_URL || 'http://192.168.15.13:3000';

    const processed = [];
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (img.startsWith('data:image')) {
        try {
          const fileName = await saveBase64Image(img, uploadDir);
          processed.push({ url: `${baseUrl}/uploads/${fileName}`, index: i });
        } catch (err) {
          console.error('Failed to save image', err);
          processed.push({ url: img, index: i });
        }
      } else {
        processed.push({ url: img, index: i });
      }
    }
    return processed;
  }

  async create(createProductDto: CreateProductDto, username: string): Promise<Product> {
    const { images, ...productData } = createProductDto;
    
    // Normalize empty strings to null for UUID fields
    if (productData.supplierId === '') {
      productData.supplierId = null;
    }

    const slug = productData.slug || slugify(productData.name, { lower: true });
    const processedImages = await this.processImages(images || []);

    const product = this.productRepository.create({
      ...productData,
      slug,
      createdBy: username,
      updatedBy: username,
      images: processedImages as any,
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
    
    // Normalize empty strings to null for UUID fields
    if (productData.supplierId === '') {
      productData.supplierId = null;
    }

    // Handle slug auto-generation if name changes and slug is not provided
    if (productData.name && !productData.slug) {
      productData.slug = slugify(productData.name, { lower: true });
    }

    Object.assign(product, {
      ...productData,
      updatedBy: username,
    });

    if (images) {
      // Deletar imagens antigas explicitamente para evitar erro 500 (órfãos com restrição NOT NULL)
      await this.productImageRepository.delete({ productId: id });

      // Processa as novas imagens (converte Base64 se necessário)
      const processedImages = await this.processImages(images);
      product.images = processedImages as any;
    }

    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.softRemove(product);
  }
}
