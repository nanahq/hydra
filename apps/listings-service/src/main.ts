import { NestFactory } from '@nestjs/core'
import { RmqOptions } from '@nestjs/microservices'

import { ListingsServiceModule } from './listings-service.module'
import { RmqService, QUEUE_SERVICE } from '@app/common'

async function bootstrap (): Promise<void> {
  const app = await NestFactory.create(ListingsServiceModule)
  const rmq = app.get<RmqService>(RmqService)
  app.connectMicroservice<RmqOptions>(
    rmq.getOption(QUEUE_SERVICE.LISTINGS_SERVICE)
  )
  await app.startAllMicroservices()
}

void bootstrap()
