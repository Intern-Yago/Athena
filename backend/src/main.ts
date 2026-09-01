import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global API Prefix
  app.setGlobalPrefix('api');

  // Enable CORS for React Frontend
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`NestJS Backend Athena rodando com sucesso na porta ${port}: http://localhost:${port}/api`);
}
bootstrap();
