import { NestFactory } from '@nestjs/core'
import { OrdersServiceModule } from './orders-service.module'
import { QUEUE_SERVICE, RmqService } from '@app/common'
import { RmqOptions } from '@nestjs/microservices'
async function bootstrap (): Promise<void> {
  const app = await NestFactory.create(OrdersServiceModule)
  const rmq = app.get<RmqService>(RmqService)

  app.connectMicroservice<RmqOptions>(
    rmq.getOption(QUEUE_SERVICE.ORDERS_SERVICE)
  )

  await app.startAllMicroservices()
}
void bootstrap()
