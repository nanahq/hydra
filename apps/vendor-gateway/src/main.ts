import { ConfigService } from '@nestjs/config'
import { RmqOptions } from '@nestjs/microservices'
import { RmqService, QUEUE_SERVICE } from '@app/common'
import { AppModule } from './app.module'

async function bootstrap (): Promise<void> {
  const app = await AppModule.create()
  const port = app.get(ConfigService).get<string>('VENDOR_PORT', '3001')
  const rmqService = app.get<RmqService>(RmqService)
  app.connectMicroservice<RmqOptions>(
    rmqService.getOption(QUEUE_SERVICE.VENDORS_API, true)
  )
  await app.startAllMicroservices()
  await app.listen(port, () => {
    console.log(`Vendors Gateway listing on Port ${port}`)
  })

  void app.enableShutdownHooks()

  process.on('SIGTERM', async (): Promise<void> => {
    console.log('SIGTERM signal received: closing RabbitMQ connections gracefully.')
    await app.close()
    process.exit(0)
  })

  process.on('SIGINT', async (): Promise<void> => {
    console.log('SIGINT signal received: closing RabbitMQ connections gracefully.')
    await app.close()
    process.exit(0)
  })
}
void bootstrap()
