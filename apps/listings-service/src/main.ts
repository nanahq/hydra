import { NestFactory } from '@nestjs/core';
import { ListingsServiceModule } from './listings-service.module';
import { RmqService } from '@app/common';
import { RmqOptions } from '@nestjs/microservices';
import { QUEUE_SERVICE } from '@app/common/typings/QUEUE_MESSAGE';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(ListingsServiceModule);
  const rmq = app.get<RmqService>(RmqService);
  app.connectMicroservice<RmqOptions>(
    rmq.getOption(QUEUE_SERVICE.LISTINGS_SERVICE),
  );
  await app.startAllMicroservices();
}

void bootstrap();
