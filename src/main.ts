import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {

  const logger = new Logger('Payments-ms');

  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );
  app.connectMicroservice(
    {
      transport: Transport.NATS,
      options: {
        servers: envs.NATS_SERVERS,
      }
    },
    {
      inheritAppConfig: true,
    }
  );
  app.startAllMicroservices();
  app.setGlobalPrefix('api/v1');
  await app.listen(envs.PORT);
  logger.log(`Payments microservice is running on port ${envs.PORT}`);
}
bootstrap();
