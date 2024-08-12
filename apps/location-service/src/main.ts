import { NestFactory } from '@nestjs/core'
import { RmqOptions } from '@nestjs/microservices'

import { LocationModule } from './location-service.module'
import { RmqService, QUEUE_SERVICE } from '@app/common'
import '@app/common/sentry/instrument'
async function bootstrap (): Promise<void> {
  const app = await NestFactory.create(LocationModule)
  const rmq = app.get<RmqService>(RmqService)
  app.connectMicroservice<RmqOptions>(
    rmq.getOption(QUEUE_SERVICE.LOCATION_SERVICE)
  )
  await app.startAllMicroservices()
}

void bootstrap()
