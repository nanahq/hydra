import { Module } from '@nestjs/common'
import { OrdersServiceController } from './orders-service.controller'
import { OrdersServiceService } from './orders-service.service'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'
import {
  ListingMenu,
  ListingMenuSchema,
  DatabaseModule,
  Order,
  OrderSchema,
  QUEUE_SERVICE,
  RmqModule,
  User,
  UserSchema,
  Vendor,
  VendorSchema, ExportPushNotificationClient
} from '@app/common'
import { MongooseModule } from '@nestjs/mongoose'
import { OrderRepository } from './order.repository'
import { ScheduleModule } from '@nestjs/schedule'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        RMQ_VENDORS_QUEUE: Joi.string(),
        RMQ_VENDORS_API_QUEUE: Joi.string(),
        RMQ_URI: Joi.string()
      }),
      envFilePath: './apps/orders-service/.env'
    }),
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    MongooseModule.forFeature([
      { name: Vendor.name, schema: VendorSchema },
      { name: User.name, schema: UserSchema },
      { name: ListingMenu.name, schema: ListingMenuSchema }
    ]),
    DatabaseModule,
    RmqModule.register({ name: QUEUE_SERVICE.NOTIFICATION_SERVICE }),
    RmqModule.register({ name: QUEUE_SERVICE.USERS_SERVICE }),
    RmqModule.register({ name: QUEUE_SERVICE.DRIVER_SERVICE }),
    RmqModule.register({ name: QUEUE_SERVICE.LISTINGS_SERVICE }),
    RmqModule.register({ name: QUEUE_SERVICE.PAYMENT_SERVICE }),
    RmqModule
  ],
  controllers: [OrdersServiceController],
  providers: [OrdersServiceService, OrderRepository, ExportPushNotificationClient]
})
export class OrdersServiceModule {}
