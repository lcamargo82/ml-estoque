import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Teclado Mecânico RGB', description: 'Nome do produto' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'SKU-12345', description: 'SKU único do produto' })
  @IsNotEmpty()
  @IsString()
  sku: string;

  @ApiProperty({ example: 'teclado-mecanico-rgb', description: 'Slug único (opcional na criação)', required: false })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ example: 'uuid-fornecedor', description: 'ID do fornecedor', required: false })
  @IsOptional()
  @IsString()
  supplierId?: string;

  @ApiProperty({ example: 10, description: 'Quantidade em estoque' })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({ example: 150.5, description: 'Preço de compra' })
  @IsNumber()
  @Min(0)
  purchasePrice: number;

  @ApiProperty({ example: 299.9, description: 'Preço de venda ML' })
  @IsNumber()
  @Min(0)
  mlSellingPrice: number;

  @ApiProperty({ example: 280.0, description: 'Preço de venda direta' })
  @IsNumber()
  @Min(0)
  directSellingPrice: number;

  @ApiProperty({ example: false, description: 'Se já está listado no ML' })
  @IsOptional()
  @IsBoolean()
  isListedOnML?: boolean;

  @ApiProperty({ example: ['http://api.com/uploads/img1.jpg'], description: 'Lista de URLs das imagens', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
