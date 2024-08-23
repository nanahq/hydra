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
  DatabaseModule,
  PaystackService,
  Coupon,
  CouponSchema,
  ListingMenu,
  ListingMenuSchema
} from '@app/common'
import { ScheduleModule } from '@nestjs/schedule'
import { PaymentRepository } from './charge/charge.repository'
import { PaymentService } from './charge/charge.service'
import { HttpModule } from '@nestjs/axios'
import { PaymentController } from './charge/charge.controller'
import {
  DriverWallet,
  DriverWalletSchema
} from '@app/common/database/schemas/driver-wallet.schema'
import {
  DriverWalletTransaction,
  DriverWalletTransactionSchema
} from '@app/common/database/schemas/driver-wallet-transactions.schema'
import {
  DriverWalletRepository,
  DriverWalletTransactionRepository
} from './wallet/driver/wallet.repository'
import { DriverWalletService } from './wallet/driver/wallet.service'
import { DriverWalletController } from './wallet/driver/wallet.controller'
import { CouponService } from './coupons/coupon.service'
import { CouponRepository } from './coupons/coupon.repository'
import { CouponController } from './coupons/coupon.controller'
import { UserWalletController } from './wallet/user/wallet.controller'
import { UserWalletService } from './wallet/user/wallet.service'
import { UserWallet, UserWalletSchema } from '@app/common/database/schemas/user-wallet.schema'
import { UserWalletRepository } from './wallet/user/wallet.repository'

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
        name: ListingMenu.name,
        schema: ListingMenuSchema
      }
    ]),
    MongooseModule.forFeature([
      {
        name: Payment.name,
        schema: PaymentHistorySchema
      },
      {
        name: DriverWallet.name,
        schema: DriverWalletSchema
      },
      {
        name: DriverWalletTransaction.name,
        schema: DriverWalletTransactionSchema
      },
      {
        name: Coupon.name,
        schema: CouponSchema
      },
      {
        name: UserWallet.name,
        schema: UserWalletSchema
      }
    ]),
    RmqModule.register({ name: QUEUE_SERVICE.VENDORS_SERVICE }),
    RmqModule.register({ name: QUEUE_SERVICE.USERS_SERVICE }),
    RmqModule.register({ name: QUEUE_SERVICE.ORDERS_SERVICE }),
    RmqModule.register({ name: QUEUE_SERVICE.NOTIFICATION_SERVICE }),
    RmqModule.register({ name: QUEUE_SERVICE.LISTINGS_SERVICE }),
    RmqModule.register({ name: QUEUE_SERVICE.ADMINS_API }),
    RmqModule.register({ name: QUEUE_SERVICE.DRIVER_SERVICE }),
    DatabaseModule,
    HttpModule
  ],
  controllers: [
    VendorPayoutController,
    PaymentController,
    DriverWalletController,
    UserWalletController,
    CouponController
  ],
  providers: [
    VendorPayoutService,
    VendorPayoutRepository,
    ConfigService,
    PaymentRepository,
    PaymentService,
    PaystackService,
    DriverWalletRepository,
    DriverWalletTransactionRepository,
    DriverWalletService,
    CouponService,
    CouponRepository,
    UserWalletService,
    UserWalletRepository
  ]
})
export class PaymentServiceModule {}
