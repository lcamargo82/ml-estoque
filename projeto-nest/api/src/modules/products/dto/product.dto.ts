import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Teclado Mecânico RGB', description: 'Nome do produto' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'teclado-mecanico-rgb', description: 'Slug único do produto' })
  @IsNotEmpty()
  @IsString()
  slug: string;

  @ApiProperty({ example: 10, description: 'Quantidade em estoque' })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({ example: 150.5, description: 'Preço de custo' })
  @IsNumber()
  @Min(0)
  costPrice: number;

  @ApiProperty({ example: 299.9, description: 'Preço de venda' })
  @IsNumber()
  @Min(0)
  sellingPrice: number;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
