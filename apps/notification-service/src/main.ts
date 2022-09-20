import { RmqService } from '@app/common'
import { QUEUE_SERVICE } from '@app/common/typings/QUEUE_MESSAGE'
import { NestFactory } from '@nestjs/core'
import { NotificationServiceModule } from './notification-service.module'

async function bootstrap (): Promise<void> {
  const app = await NestFactory.create(NotificationServiceModule)
  const rmq = app.get<RmqService>(RmqService)
  app.connectMicroservice(rmq.getOption(QUEUE_SERVICE.NOTIFICATION_SERVICE))
  await app.startAllMicroservices()
}
void bootstrap()
