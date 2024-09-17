import { NestFactory } from '@nestjs/core'
import { QUEUE_SERVICE, RmqService } from '@app/common'
import { RmqOptions } from '@nestjs/microservices'
import { PaymentServiceModule } from './payment.module'
async function bootstrap (): Promise<void> {
  const app = await NestFactory.create(PaymentServiceModule)
  const rmq = app.get<RmqService>(RmqService)

  app.connectMicroservice<RmqOptions>(
    rmq.getOption(QUEUE_SERVICE.PAYMENT_SERVICE)
  )

  await app.startAllMicroservices()

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
