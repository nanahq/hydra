import { NestFactory } from '@nestjs/core'
import { ListingServiceModule } from './listing-service.module'
import { RmqService } from '@app/common'
import { RmqOptions } from '@nestjs/microservices'
import { QUEUE_SERVICE } from '@app/common/typings/QUEUE_MESSAGE'

async function bootstrap (): Promise<void> {
  const app = await NestFactory.create(ListingServiceModule)
  const rmq = app.get<RmqService>(RmqService)
  app.connectMicroservice<RmqOptions>(
    rmq.getOption(QUEUE_SERVICE.LISTING_SERVICE)
  )
  await app.startAllMicroservices()
}

void bootstrap()
