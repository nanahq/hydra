import { NestFactory } from '@nestjs/core'
import { AdminServiceModule } from './admin-service.module'
import { QUEUE_SERVICE, RmqService } from '@app/common'
import { RmqOptions } from '@nestjs/microservices'
import { ConfigService } from '@nestjs/config'
async function bootstrap (): Promise<void> {
  const app = await NestFactory.create(AdminServiceModule)
  const port = app.get(ConfigService).get<string>('PORT') as string
  const rmq = app.get<RmqService>(RmqService)
  app.connectMicroservice<RmqOptions>(
    rmq.getOption(QUEUE_SERVICE.ADMINS_SERVICE)
  )
  await app.startAllMicroservices()
  await app.listen(port)

  app.enableShutdownHooks()

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
