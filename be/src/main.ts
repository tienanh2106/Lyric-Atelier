import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('nodeEnv');
  const apiPrefix = configService.get<string>('apiPrefix') ?? 'api';

  // Security headers
  app.use(helmet());

  // Global prefix
  app.setGlobalPrefix(apiPrefix);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // CORS — restrict to allowed origins in production
  const allowedOrigins = configService.get<string>('allowedOrigins');
  app.enableCors({
    origin: allowedOrigins
      ? allowedOrigins.split(',').map((o) => o.trim())
      : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Swagger — only in non-production
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Lyric Atelier API')
      .setDescription('API for Lyric Atelier - AI-powered lyric generation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
  }

  // Graceful shutdown
  app.enableShutdownHooks();

  const port = configService.get<number>('port') ?? process.env.PORT ?? 3000;
  await app.listen(port);

  const appUrl = await app.getUrl();
  console.log(`Application is running on: ${appUrl}`);
  if (nodeEnv !== 'production') {
    console.log(`Swagger docs available at: ${appUrl}/${apiPrefix}/docs`);
  }
}

void bootstrap();
