import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from './shared/environments/load-env';
import { Database } from 'lib-database/src/shared/config/database';

async function bootstrap() {
  const { port, corsOrigin } = config.server;

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: false,
  });

  app.setGlobalPrefix('ms-security');

  await app.listen(port);
  await Database.connect();

  console.info(`MS-SECURITY iniciado en el puerto: ${port}`);
}
bootstrap();
