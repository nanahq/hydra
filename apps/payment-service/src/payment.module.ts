import { Module } from '@nestjs/common'
import { VendorPayoutService } from './payout/payout.service'
import { VendorPayoutRepository } from './payout/payout.repository'
import { VendorPayoutController } from './payout/payout.controller'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'
import { MongooseModule } from '@nestjs/mongoose'
import { QUEUE_SERVICE, RmqModule, VendorPayout, VendorPayoutSchema } from '@app/common'
import { DatabaseModule } from '@app/common/database/database.module'
import { ScheduleModule } from '@nestjs/schedule'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        RMQ_VENDORS_QUEUE: Joi.string(),
        RMQ_VENDORS_API_QUEUE: Joi.string(),
        RMQ_PAYMENT_QUEUE: Joi.string(),
        RMQ_URI: Joi.string()
      }),
      envFilePath: './apps/payment-service/.env'
    }),
    MongooseModule.forFeature([{ name: VendorPayout.name, schema: VendorPayoutSchema }]),
    RmqModule.register({ name: QUEUE_SERVICE.VENDORS_SERVICE }),
    RmqModule.register({ name: QUEUE_SERVICE.ORDERS_SERVICE }),
    RmqModule.register({ name: QUEUE_SERVICE.NOTIFICATION_SERVICE }),
    RmqModule.register({ name: QUEUE_SERVICE.ADMIN_API }),
    DatabaseModule
  ],
  controllers: [VendorPayoutController],
  providers: [VendorPayoutService, VendorPayoutRepository]
})
export class PaymentServiceModule {}
