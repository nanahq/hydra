import { NestFactory } from '@nestjs/core'
import { NotificationServiceModule } from './notification-service.module'

import { RmqService, QUEUE_SERVICE } from '@app/common'
import '@app/common/sentry/instrument'
async function bootstrap (): Promise<void> {
  const app = await NestFactory.create(NotificationServiceModule)
  const rmq = app.get<RmqService>(RmqService)
  app.connectMicroservice(rmq.getOption(QUEUE_SERVICE.NOTIFICATION_SERVICE))
  await app.startAllMicroservices()
}
void bootstrap()
