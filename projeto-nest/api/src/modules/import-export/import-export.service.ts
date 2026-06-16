import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Product } from '@modules/products/entities/product.entity';
import { Supplier } from '@modules/suppliers/entities/supplier.entity';
import { ProductImage } from '@modules/products/entities/product-image.entity';
import { Workbook } from 'exceljs';
import { Response } from 'express';
import slugify from 'slugify';

@Injectable()
export class ImportExportService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
  ) {}

  async exportProducts(res: Response): Promise<void> {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Produtos');

    // Cabeçalhos
    worksheet.columns = [
      { header: 'Nome', key: 'name', width: 30 },
      { header: 'SKU', key: 'sku', width: 15 },
      { header: 'Slug', key: 'slug', width: 20 },
      { header: 'Quantidade', key: 'quantity', width: 12 },
      { header: 'Preço de Custo', key: 'purchasePrice', width: 15 },
      { header: 'Preço de Venda ML', key: 'mlSellingPrice', width: 18 },
      { header: 'Preço de Venda Direta', key: 'directSellingPrice', width: 18 },
      { header: 'Anunciado ML (Sim/Não)', key: 'isListedOnML', width: 22 },
      { header: 'Fornecedor (Nome ou ID)', key: 'supplier', width: 25 },
      { header: 'Imagens (URLs separadas por vírgula)', key: 'images', width: 40 },
    ];

    // Estilizar o cabeçalho
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFECECEC' },
    };

    const products = await this.productRepository.find({
      relations: ['supplier', 'images'],
      order: { name: 'ASC' },
    });

    for (const product of products) {
      worksheet.addRow({
        name: product.name,
        sku: product.sku,
        slug: product.slug,
        quantity: product.quantity,
        purchasePrice: Number(product.purchasePrice),
        mlSellingPrice: Number(product.mlSellingPrice),
        directSellingPrice: Number(product.directSellingPrice),
        isListedOnML: product.isListedOnML ? 'Sim' : 'Não',
        supplier: product.supplier ? product.supplier.name : '',
        images: product.images ? product.images.map((img) => img.url).join(', ') : '',
      });
    }

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=produtos_estoque.xlsx',
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  async importProducts(fileBuffer: any, username: string): Promise<{ success: boolean; count: number }> {
    const workbook = new Workbook();
    try {
      await workbook.xlsx.load(fileBuffer);
    } catch (err) {
      throw new BadRequestException('Arquivo Excel inválido ou corrompido.');
    }

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new BadRequestException('Planilha vazia ou aba não encontrada.');
    }

    const rows: any[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        rows.push(row);
      }
    });

    let importCount = 0;

    for (const row of rows) {
      const name = row.getCell(1).value?.toString()?.trim();
      const sku = row.getCell(2).value?.toString()?.trim();
      const slug = row.getCell(3).value?.toString()?.trim() || null;
      const quantityVal = row.getCell(4).value;
      const purchasePriceVal = row.getCell(5).value;
      const mlSellingPriceVal = row.getCell(6).value;
      const directSellingPriceVal = row.getCell(7).value;
      const isListedOnMLStr = row.getCell(8).value?.toString()?.trim()?.toLowerCase();
      const supplierNameOrId = row.getCell(9).value?.toString()?.trim();
      const imagesStr = row.getCell(10).value?.toString()?.trim();

      if (!name || !sku) {
        continue; // Ignora linhas em branco ou sem SKU/Nome obrigatórios
      }

      const hasQuantity = quantityVal !== null && quantityVal !== undefined && quantityVal !== '';
      const hasPurchasePrice = purchasePriceVal !== null && purchasePriceVal !== undefined && purchasePriceVal !== '';
      const hasMlSellingPrice = mlSellingPriceVal !== null && mlSellingPriceVal !== undefined && mlSellingPriceVal !== '';
      const hasDirectSellingPrice = directSellingPriceVal !== null && directSellingPriceVal !== undefined && directSellingPriceVal !== '';
      const hasIsListed = isListedOnMLStr !== undefined && isListedOnMLStr !== null && isListedOnMLStr !== '';

      const quantity = hasQuantity ? (typeof quantityVal === 'number' ? quantityVal : parseInt(quantityVal?.toString() || '0', 10) || 0) : 0;
      const purchasePrice = hasPurchasePrice ? (typeof purchasePriceVal === 'number' ? purchasePriceVal : parseFloat(purchasePriceVal?.toString() || '0') || 0) : 0;
      const mlSellingPrice = hasMlSellingPrice ? (typeof mlSellingPriceVal === 'number' ? mlSellingPriceVal : parseFloat(mlSellingPriceVal?.toString() || '0') || 0) : 0;
      const directSellingPrice = hasDirectSellingPrice ? (typeof directSellingPriceVal === 'number' ? directSellingPriceVal : parseFloat(directSellingPriceVal?.toString() || '0') || 0) : 0;
      
      const isListedOnML = hasIsListed ? (isListedOnMLStr === 'sim' || isListedOnMLStr === 'true' || isListedOnMLStr === '1') : false;

      // Resolver Fornecedor
      let supplierId: string | null = null;
      const hasSupplier = supplierNameOrId !== undefined && supplierNameOrId !== null && supplierNameOrId !== '';
      if (hasSupplier) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(supplierNameOrId)) {
          supplierId = supplierNameOrId;
        } else {
          const normalizedName = supplierNameOrId.trim().replace(/\s+/g, ' ');
          const supplier = await this.supplierRepository.findOne({
            where: { name: ILike(normalizedName) },
          });
          if (supplier) {
            supplierId = supplier.id;
          }
        }
      }

      // Upsert do Produto por SKU
      let product = await this.productRepository.findOne({
        where: { sku },
      });

      const finalSlug = slug || slugify(name, { lower: true });

      if (product) {
        // Atualiza campos
        product.name = name;
        product.slug = finalSlug;
        if (hasQuantity) product.quantity = quantity;
        if (hasPurchasePrice) product.purchasePrice = purchasePrice;
        if (hasMlSellingPrice) product.mlSellingPrice = mlSellingPrice;
        if (hasDirectSellingPrice) product.directSellingPrice = directSellingPrice;
        if (hasIsListed) product.isListedOnML = isListedOnML;
        if (hasSupplier) product.supplierId = supplierId;
        product.updatedBy = username;
      } else {
        // Cria novo
        product = this.productRepository.create({
          name,
          sku,
          slug: finalSlug,
          quantity,
          purchasePrice,
          mlSellingPrice,
          directSellingPrice,
          isListedOnML,
          supplierId: hasSupplier ? supplierId : null,
          createdBy: username,
          updatedBy: username,
        });
      }

      const savedProduct = await this.productRepository.save(product);
      importCount++;

      // Atualiza Imagens se especificadas
      if (imagesStr !== undefined) {
        await this.productImageRepository.delete({ productId: savedProduct.id });

        const urls = imagesStr
          .split(',')
          .map((url) => url.trim())
          .filter((url) => url.length > 0);

        const imagesToCreate = urls.map((url, index) =>
          this.productImageRepository.create({
            url,
            productId: savedProduct.id,
            index,
          }),
        );

        if (imagesToCreate.length > 0) {
          await this.productImageRepository.save(imagesToCreate);
        }
      }
    }

    return { success: true, count: importCount };
  }
}
