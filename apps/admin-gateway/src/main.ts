import { ConfigService } from '@nestjs/config'
import { RmqOptions } from '@nestjs/microservices'

import { AppModule } from './app.module'
import { QUEUE_SERVICE, RmqService } from '@app/common'

async function bootstrap (): Promise<void> {
  const app = await AppModule.create()
  const port = app.get(ConfigService).get<string>('ADMIN_PORT') as string
  const rmqService = app.get<RmqService>(RmqService)
  app.connectMicroservice<RmqOptions>(
    rmqService.getOption(QUEUE_SERVICE.ADMINS_API, true)
  )
  await app.startAllMicroservices()
  await app.listen(port)

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
