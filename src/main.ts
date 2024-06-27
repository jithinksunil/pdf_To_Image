import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './exception.filter';
import * as cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(`/api`);

  app.enableCors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
  });

  app.use(cookieParser());
  app.use(json());
  app.use(urlencoded({ extended: true }));

  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(process.env.PORT || 8000);
}
bootstrap();
