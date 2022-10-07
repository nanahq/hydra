import { NestFactory } from '@nestjs/core'
import { AdminServiceModule } from './admin-service.module'
import { QUEUE_SERVICE, RmqService } from '@app/common'
import { RmqOptions } from '@nestjs/microservices'

async function bootstrap (): Promise<void> {
  const app = await NestFactory.create(AdminServiceModule)
  const rmq = app.get<RmqService>(RmqService)
  app.connectMicroservice<RmqOptions>(
      rmq.getOption(QUEUE_SERVICE.ADMIN_SERVICE)
  )
  await app.startAllMicroservices()
}
void bootstrap()
