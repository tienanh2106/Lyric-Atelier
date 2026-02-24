import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import express from 'express';
import type { Request, Response } from 'express';
import { AppModule } from '../src/app.module';

const expressServer = express();
let isReady = false;

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressServer),
  );

  const configService = app.get(ConfigService);
  const apiPrefix = configService.get<string>('apiPrefix') ?? 'api';

  // Security headers — allow CDN assets needed by Swagger UI
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://cdnjs.cloudflare.com',
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://cdnjs.cloudflare.com',
          ],
          imgSrc: ["'self'", 'data:', 'https://cdnjs.cloudflare.com'],
          connectSrc: ["'self'"],
        },
      },
    }),
  );

  app.setGlobalPrefix(apiPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // CORS — restrict to allowed origins
  const allowedOrigins = configService.get<string>('allowedOrigins');
  app.enableCors({
    origin: allowedOrigins
      ? allowedOrigins.split(',').map((o) => o.trim())
      : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Swagger with CDN assets (required for Vercel serverless)
  const config = new DocumentBuilder()
    .setTitle('Lyric Atelier API')
    .setDescription('API for Lyric Atelier - AI-powered lyric generation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
    customCssUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-standalone-preset.min.js',
    ],
  });

  app.enableShutdownHooks();
  await app.init();
  isReady = true;
}

const appReady = bootstrap();

export default async (req: Request, res: Response) => {
  if (!isReady) await appReady;
  expressServer(req, res);
};
