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
}

void bootstrap()
