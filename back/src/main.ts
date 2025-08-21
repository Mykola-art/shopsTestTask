import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ValidationPipe, VersioningType} from "@nestjs/common";
import * as cookieParser from 'cookie-parser';
import * as csurf from 'csurf';
import * as fs from 'fs';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/filters';
import { SanitizePipe } from './pipes';
import { join } from 'path';

async function bootstrap():Promise<void> {
  const isProd = process.env.NODE_ENV === 'production';

  let app;

  if (isProd) {
    const httpsOptions = {
      key: fs.readFileSync(join(__dirname, '..', 'certs', 'server.key')),
      cert: fs.readFileSync(join(__dirname, '..', 'certs', 'server.crt')),
    };

    app = await NestFactory.create(AppModule, { httpsOptions });
  } else {
    app = await NestFactory.create(AppModule);
  }


  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, X-CSRF-Token',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(new SanitizePipe());

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      frameguard: { action: 'deny' }, 
      hsts: {
        maxAge: 31536000, 
        includeSubDomains: true,
      },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.use(cookieParser());

  app.use(
    csurf({
      cookie: {
        httpOnly: true,
        sameSite: 'strict',
        secure: true,
      },
    }),
  );


  const config = new DocumentBuilder()
    .setTitle('STORES API')
    .setDescription('Documentation of api for Per Diem Test task')
    .setVersion('v1')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
