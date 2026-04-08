import { DataSource } from 'typeorm';
import { Product } from '@modules/products/entities/product.entity';
import { User, UserRole } from '@modules/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  username: process.env.DATABASE_USER || 'user',
  password: process.env.DATABASE_PASSWORD || 'password',
  database: process.env.DATABASE_NAME || 'nest_db',
  entities: [Product, User],
});

async function runSeed() {
  await dataSource.initialize();
  console.log('🌱 Bancos de dados inicializados para Seeding...');

  const userRepository = dataSource.getRepository(User);
  const productRepository = dataSource.getRepository(Product);

  // 1. Criar Usuário Admin Específico
  const adminEmail = 'le.camargo81@gmail.com';
  const existingAdmin = await userRepository.findOne({ where: { email: adminEmail } });
  
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('@ML_070426', 10);
    const admin = userRepository.create({
      name: 'Leandro Camargo',
      email: adminEmail,
      password: hashedPassword,
      role: UserRole.ADMIN,
    });
    await userRepository.save(admin);
    console.log(`✅ Usuário ADMIN criado: ${adminEmail} / @ML_070426`);
  }

  // 2. Criar Produtos de Exemplo
  const products = [
    {
      name: 'iPhone 15 Pro Max',
      slug: 'iphone-15-pro-max',
      quantity: 50,
      costPrice: 6000.0,
      sellingPrice: 9500.0,
      updatedBy: adminEmail,
    },
    {
      name: 'MacBook Air M2',
      slug: 'macbook-air-m2',
      quantity: 20,
      costPrice: 5000.0,
      sellingPrice: 8200.0,
      updatedBy: adminEmail,
    },
  ];

  for (const p of products) {
    const existing = await productRepository.findOne({ where: { slug: p.slug } });
    if (!existing) {
      await productRepository.save(productRepository.create(p));
      console.log(`📦 Produto criado: ${p.name}`);
    }
  }

  console.log('🌲 Seeding concluído com sucesso!');
  await dataSource.destroy();
}

runSeed().catch((error) => console.log('❌ Erro no Seeding:', error));
