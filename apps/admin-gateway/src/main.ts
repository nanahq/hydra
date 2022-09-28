import { RmqService } from '@app/common'
import { QUEUE_SERVICE } from '@app/common/typings/QUEUE_MESSAGE'
import { ConfigService } from '@nestjs/config'
import { RmqOptions } from '@nestjs/microservices'
import { AppModule } from './app.module'

async function bootstrap (): Promise<void> {
  const app = await AppModule.create()
  const port = app.get(ConfigService).get<string>('PORT') as string
  const rmqService = app.get<RmqService>(RmqService)
  app.connectMicroservice<RmqOptions>(
    rmqService.getOption(QUEUE_SERVICE.ADMIN_API, true)
  )
  await app.startAllMicroservices()
  await app.listen(port)
}
void bootstrap()
