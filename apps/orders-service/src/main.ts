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

  console.log('Hell owrld')
  await app.init()

  void app.enableShutdownHooks()

  process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing RabbitMQ connections gracefully.')
    await app.close()
    process.exit(0)
  })

  process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing RabbitMQ connections gracefully.')
    await app.close()
    process.exit(0)
  })
}
void bootstrap()
