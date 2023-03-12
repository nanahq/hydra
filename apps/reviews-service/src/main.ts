import { NestFactory } from '@nestjs/core'
import { ReviewsServiceModule } from './reviews-service.module'
import { QUEUE_SERVICE, RmqService } from '@app/common'
import { RmqOptions } from '@nestjs/microservices'

async function bootstrap (): Promise<void> {
  const app = await NestFactory.create(ReviewsServiceModule)
  const rmq = app.get<RmqService>(RmqService)

  app.connectMicroservice<RmqOptions>(
    rmq.getOption(QUEUE_SERVICE.REVIEW_SERVICE)
  )

  await app.startAllMicroservices()
}
void bootstrap()
