import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // <--- habilita CORS

  // Adiciona o prefixo /api/v1 para todas as rotas
  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades que não estão no DTO
      forbidNonWhitelisted: true, // Lança erro se propriedades extras forem enviadas
      transform: true, // Transforma os dados para o tipo do DTO (ex: string de URL para number)
    }),
  );

  await app.listen(3001); // Porta 3001 para o backend
}
bootstrap();