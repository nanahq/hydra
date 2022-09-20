import { NestFactory } from '@nestjs/core'
import { UsersServiceModule } from './users-service.module'
import { RmqService } from '@app/common'
import { QUEUE_SERVICE } from '@app/common/typings/QUEUE_MESSAGE'
async function bootstrap (): Promise<void> {
  const app = await NestFactory.create(UsersServiceModule)
  const rmq = app.get<RmqService>(RmqService)
  app.connectMicroservice(rmq.getOption(QUEUE_SERVICE.USERS_SERVICE))
  await app.startAllMicroservices()
}

void bootstrap()
