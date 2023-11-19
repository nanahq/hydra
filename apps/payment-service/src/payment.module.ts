import { Module } from '@nestjs/common'
import { VendorPayoutService } from './payout/payout.service'
import { VendorPayoutRepository } from './payout/payout.repository'
import { VendorPayoutController } from './payout/payout.controller'
import { ConfigModule, ConfigService } from '@nestjs/config'
import * as Joi from 'joi'
import { MongooseModule } from '@nestjs/mongoose'
import {
  Order,
  OrderSchema,
  Payment,
  PaymentHistorySchema,
  QUEUE_SERVICE,
  RmqModule,
  User,
  UserSchema,
  Vendor,
  VendorPayout,
  VendorPayoutSchema,
  VendorSchema,
  DatabaseModule
} from '@app/common'
import { ScheduleModule } from '@nestjs/schedule'
import { PaymentRepository } from './charge/charge.repository'
import { PaymentService } from './charge/charge.service'
import { HttpModule } from '@nestjs/axios'
import { FlutterwaveService } from './providers/flutterwave'
import { PaymentController } from './charge/charge.controller'
import { PaystackService } from './providers/paystack'

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
    MongooseModule.forFeature([
      {
        name: VendorPayout.name,
        schema: VendorPayoutSchema
      }
    ]),
    MongooseModule.forFeature([
      {
        name: Vendor.name,
        schema: VendorSchema
      }
    ]),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema
      }
    ]),
    MongooseModule.forFeature([
      {
        name: Order.name,
        schema: OrderSchema
      }
    ]),
    MongooseModule.forFeature([
      {
        name: Payment.name,
        schema: PaymentHistorySchema
      }
    ]),
    RmqModule.register({ name: QUEUE_SERVICE.VENDORS_SERVICE }),
    RmqModule.register({ name: QUEUE_SERVICE.ORDERS_SERVICE }),
    RmqModule.register({ name: QUEUE_SERVICE.NOTIFICATION_SERVICE }),
    RmqModule.register({ name: QUEUE_SERVICE.LISTINGS_SERVICE }),
    RmqModule.register({ name: QUEUE_SERVICE.ADMINS_API }),
    RmqModule.register({ name: QUEUE_SERVICE.DRIVER_SERVICE }),
    DatabaseModule,
    HttpModule
  ],
  controllers: [VendorPayoutController, PaymentController],
  providers: [
    VendorPayoutService,
    VendorPayoutRepository,
    ConfigService,
    PaymentRepository,
    PaymentService,
    FlutterwaveService,
    PaystackService
  ]
})
export class PaymentServiceModule {}
