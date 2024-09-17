import { NestFactory } from '@nestjs/core'
import { RmqOptions } from '@nestjs/microservices'
import { RmqService, QUEUE_SERVICE } from '@app/common'
import { VendorsModule } from './vendors.module'

async function bootstrap (): Promise<void> {
  const app = await NestFactory.create(VendorsModule)
  const rmq = app.get<RmqService>(RmqService)
  app.connectMicroservice<RmqOptions>(
    rmq.getOption(QUEUE_SERVICE.VENDORS_SERVICE)
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
