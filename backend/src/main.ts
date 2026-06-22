import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(
    '/api/webhook', // 👈 Must match your controller's route
    express.raw({ type: 'application/json' }),
  );
  app.useStaticAssets(path.join(__dirname, '../public'));
  app.use(
    '/uploads',
    express.static(path.join(__dirname, '../public/uploads')),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: ['http://localhost:5173', 'https://dev.voiceperi.com'],
    methods: 'GET,POST,PUT,DELETE,PATCH',
    credentials: true,
  });

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();
