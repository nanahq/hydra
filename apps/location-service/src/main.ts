import { NestFactory } from '@nestjs/core'
import { RmqOptions } from '@nestjs/microservices'

import { LocationModule } from './location-service.module'
import { RmqService, QUEUE_SERVICE } from '@app/common'
async function bootstrap (): Promise<void> {
  const app = await NestFactory.create(LocationModule)
  const rmq = app.get<RmqService>(RmqService)
  app.connectMicroservice<RmqOptions>(
    rmq.getOption(QUEUE_SERVICE.LOCATION_SERVICE)
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
