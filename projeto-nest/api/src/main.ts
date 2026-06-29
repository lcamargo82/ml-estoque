import './instrumentation';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { winstonLoggerConfig } from '@common/logger/winston.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonLoggerConfig,
  });

  // Habilitar CORS
  app.enableCors();

  // Aumentar limite de payload para imagens
  const express = require('express');
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Prefixo Global da API
  app.setGlobalPrefix('api/v1');

  // Validação Global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // Configuração Swagger/Scalar
  const config = new DocumentBuilder()
    .setTitle('ML_ESTOQUE API')
    .setDescription('Serviços modernos de controle de estoque com JWT, Metrics e Logs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Interface Scalar Moderna
  app.use(
    '/reference',
    apiReference({
      spec: {
        content: document,
      },
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  
  Logger.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
  Logger.log(`📚 Documentation (Scalar) available at: http://localhost:${port}/reference`);
}
bootstrap();