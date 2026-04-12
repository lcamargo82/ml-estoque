import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { ProductsModule } from '@modules/products/products.module';
import { SuppliersModule } from '@modules/suppliers/suppliers.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { validationSchema } from '@config/env.validation';
import { getTypeOrmConfig } from '@config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: validationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => getTypeOrmConfig(configService),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    SuppliersModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public', 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        setHeaders: (res) => {
          res.set('Access-Control-Allow-Origin', '*');
        },
      },
    }),
  ],
})
export class AppModule {}