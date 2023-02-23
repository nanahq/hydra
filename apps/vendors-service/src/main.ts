import { NestFactory } from '@nestjs/core';
import { RmqOptions } from '@nestjs/microservices';

import { RmqService, QUEUE_SERVICE } from '@app/common';
import { VendorsModule } from './vendors.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(VendorsModule);
  const rmq = app.get<RmqService>(RmqService);
  app.connectMicroservice<RmqOptions>(
    rmq.getOption(QUEUE_SERVICE.VENDORS_SERVICE),
  );
  await app.startAllMicroservices();
}

void bootstrap();
