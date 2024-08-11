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
}

void bootstrap()
