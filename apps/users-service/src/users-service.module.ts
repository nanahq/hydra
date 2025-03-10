import { ScheduleModule } from '@nestjs/schedule'
import { ConfigModule } from '@nestjs/config'
import { Module } from '@nestjs/common'

import * as Joi from 'joi'

import {
  QUEUE_SERVICE,
  RmqModule,
  User,
  UserSchema,
  DatabaseModule,
  AddressBook,
  AddressBookSchema,
  AddressBookLabel,
  AddressBookLabelSchema,
  Coupon,
  CouponSchema, BrevoClient, Order, OrderSchema
} from '@app/common'
import { UsersServiceController } from './users-service.controller'
import { UsersService } from './users-service.service'
import { MongooseModule } from '@nestjs/mongoose'
import { UserRepository } from './users.repository'
import { AddressBookServiceController } from './address-book-service.controller'
import { AddressBookRepository } from './address.book.repository'
import { AddressBookService } from './address-book-service.service'
import { HttpModule } from '@nestjs/axios'
import { UserWalletRepository } from 'apps/payment-service/src/wallet/user/wallet.repository'
import { UserWallet, UserWalletSchema } from '@app/common/database/schemas/user-wallet.schema'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        RMQ_USERS_QUEUE: Joi.string(),
        RMQ_URI: Joi.string()
      }),
      envFilePath: './apps/users-service/.env'
    }),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema
      },
      {
        name: AddressBook.name,
        schema: AddressBookSchema
      },
      {
        name: AddressBookLabel.name,
        schema: AddressBookLabelSchema
      },
      {
        name: Coupon.name,
        schema: CouponSchema
      },
      {
        name: Order.name,
        schema: OrderSchema
      },
      {
        name: UserWallet.name,
        schema: UserWalletSchema
      }
    ]),
    DatabaseModule,
    RmqModule.register({ name: QUEUE_SERVICE.NOTIFICATION_SERVICE }),
    RmqModule.register({ name: QUEUE_SERVICE.PAYMENT_SERVICE }),
    RmqModule,
    HttpModule
  ],
  controllers: [UsersServiceController, AddressBookServiceController],

  providers: [
    UsersService,
    UserRepository,
    AddressBookRepository,
    UserWalletRepository,
    AddressBookService,
    BrevoClient
  ]
})
export class UsersServiceModule {}
