import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
import * as dotenv from 'dotenv';
dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(morgan('combined'));
  // Serve uploaded files statically
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  app.enableCors({
    origin: [
      'http://localhost:8080',
      'http://localhost:5000',
      'http://localhost:3000',
      'http://server-frontend:3000',
      'https://localhost',
      'https://165.232.76.157',
    ],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Allow-Origin',
    ],
    credentials: true,
    exposedHeaders: ['set-cookie', 'Authorization'],
  });
  await app.listen(process.env.PORT ?? 8000, '0.0.0.0');
}
void bootstrap();
