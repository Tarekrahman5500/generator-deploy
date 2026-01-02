import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
import helmet from 'helmet';
// import rateLimit from 'express-rate-limit';
// import * as xss from 'xss-clean';
// import * as hpp from 'hpp';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 📝 Logging
  app.use(morgan('combined'));

  // 🔐 Security headers
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );

  // // 🚦 Global rate limit (no Redis)
  // app.use(
  //   rateLimit({
  //     windowMs: 15 * 60 * 1000, // 15 minutes
  //     max: 100, // 100 requests per IP
  //     standardHeaders: true,
  //     legacyHeaders: false,
  //   }),
  // );

  // 🧼 XSS protection
  // app.use(xss());

  // 🧯 HTTP Parameter Pollution protection
  // app.use(hpp());

  // 📂 Static uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // 🌍 CORS
  app.enableCors({
    origin: [
      'http://localhost:8080',
      'http://localhost:5000',
      'https://marexisitaly.com',
      'https://www.marexisitaly.com',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: [
      'Content-Type',
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Headers',
      'Authorization',
      'Content-Type',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    exposedHeaders: ['Authorization'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
