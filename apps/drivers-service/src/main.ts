import { QUEUE_SERVICE, RmqService } from '@app/common'
import { RmqOptions } from '@nestjs/microservices'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
async function bootstrap (): Promise<void> {
  const app = await AppModule.create()
  const rmqService = app.get<RmqService>(RmqService)
  const port = app.get(ConfigService).get<string>('DRIVER_PORT', '3003')
  app.connectMicroservice<RmqOptions>(
    rmqService.getOption(QUEUE_SERVICE.DRIVER_SERVICE)
  )
  await app.startAllMicroservices()
  await app.listen(port, () => {
    console.log(`Drivers Service is listening on ${port}`)
  })

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
