import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import {
  isProduction,
  maskDatabaseUrl,
  resolveAppEnv,
} from './common/config/environment';

/**
 * Origens aceitas pelo CORS.
 *
 * `FRONTEND_URL` aceita múltiplas URLs separadas por vírgula. Fora de produção,
 * previews da Vercel (subdomínios dinâmicos) também são liberados.
 */
function buildCorsOrigin() {
  const configured = (process.env.FRONTEND_URL ?? 'http://localhost:3000')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);

  if (isProduction()) return configured;

  return [...configured, /^https:\/\/[a-z0-9-]+\.vercel\.app$/];
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: buildCorsOrigin(),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Filmin API')
    .setDescription('Documentação da API do projeto Filmin')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  // Banner de boot: deixa explícito contra qual banco a API está rodando,
  // evitando testar uma feature achando que está em dev e estar em produção.
  const logger = new Logger('Bootstrap');
  logger.log(`Ambiente: ${resolveAppEnv()}`);
  logger.log(`Banco: ${maskDatabaseUrl()}`);
  logger.log(`Supabase: ${process.env.SUPABASE_URL ?? '(não definido)'}`);
  logger.log(`API ouvindo na porta ${port}`);
}
bootstrap();
