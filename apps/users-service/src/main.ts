import { NestFactory } from '@nestjs/core'

import { RmqService, QUEUE_SERVICE } from '@app/common'
import { UsersServiceModule } from './users-service.module'
import '@app/common/sentry/instrument'
async function bootstrap (): Promise<void> {
  const app = await NestFactory.create(UsersServiceModule)
  const rmq = app.get<RmqService>(RmqService)
  app.connectMicroservice(rmq.getOption(QUEUE_SERVICE.USERS_SERVICE))
  await app.startAllMicroservices()
}

void bootstrap()
