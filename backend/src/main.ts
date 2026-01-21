import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 📝 Logging
  app.use(morgan('combined'));

  // 🔐 Security headers - Configure helmet for CORS compatibility
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: false, // Disable CORP - let CORS handle it
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
      crossOriginEmbedderPolicy: false,
    }),
  );

  // 🌍 CORS - Configure BEFORE static assets
  app.enableCors({
    origin: [
      'http://localhost:8080',
      'http://localhost:5000',
      'http://localhost:3000',
      'https://marexisitaly.com',
      'https://www.marexisitaly.com',
      'https://relaxation-standards-nashville-flexible.trycloudflare.com',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Origin',
      'Accept',
      'X-Requested-With',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
    ],
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
    maxAge: 86400,
  });

  // Handle OPTIONS preflight requests
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    );
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, Accept, Origin, X-Requested-With',
    );

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

  // 📂 Serve static files with CORS headers
  const uploadsPath = join(__dirname, '..', 'uploads');

  // Middleware specifically for uploads to add CORS headers
  app.use('/uploads', (req: Request, res: Response, next: NextFunction) => {
    // Allow all origins for static files, or be specific:
    const allowedOrigins = [
      'http://localhost:8080',
      'http://localhost:5000',
      'https://marexisitaly.com',
      'https://relaxation-standards-nashville-flexible.trycloudflare.com',
    ];

    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    } else {
      res.header('Access-Control-Allow-Origin', '*');
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

  // Serve static assets with setHeaders function
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads',
    setHeaders: (res) => {
      // Additional headers for static files
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Application is running on: ${await app.getUrl()}`);
  console.log(`📁 Static files served from: ${uploadsPath}`);
  console.log(
    `🌐 CORS enabled for: http://localhost:8080, https://marexisitaly.com`,
  );
}

bootstrap().catch((error) => {
  console.error('Error during app bootstrap:', error);
  process.exit(1);
});
