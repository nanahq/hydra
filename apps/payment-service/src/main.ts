import { NestFactory } from '@nestjs/core'
import { QUEUE_SERVICE, RmqService } from '@app/common'
import { RmqOptions } from '@nestjs/microservices'
import { PaymentServiceModule } from './payment.module'
import '@app/common/sentry/instrument'
async function bootstrap (): Promise<void> {
  const app = await NestFactory.create(PaymentServiceModule)
  const rmq = app.get<RmqService>(RmqService)

  app.connectMicroservice<RmqOptions>(
    rmq.getOption(QUEUE_SERVICE.PAYMENT_SERVICE)
  )

  await app.startAllMicroservices()
  await app.init()
}
void bootstrap()
