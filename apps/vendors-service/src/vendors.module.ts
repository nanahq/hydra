import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import {
  RmqModule,
  Vendor,
  VendorSchema,
  VendorSettings,
  VendorSettingsSchema,
  DatabaseModule,
  ScheduledListingNotification,
  ScheduledListingNotificationSchema,
  QUEUE_SERVICE, Review, ReviewSchema, BrevoClient
} from '@app/common'
import { VendorsController } from './vendors.controller'
import { VendorsService } from './vendors.service'

import { MongooseModule } from '@nestjs/mongoose'

import {
  VendorSettingsRepository,
  VendorRepository
} from './vendors.repository'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/vendors-service/.env'
    }),
    MongooseModule.forFeature([
      { name: Vendor.name, schema: VendorSchema },
      { name: VendorSettings.name, schema: VendorSettingsSchema },
      { name: Review.name, schema: ReviewSchema },
      {
        name: ScheduledListingNotification.name,
        schema: ScheduledListingNotificationSchema
      }
    ]),
    RmqModule.register({ name: QUEUE_SERVICE.NOTIFICATION_SERVICE }),
    RmqModule.register({ name: QUEUE_SERVICE.LISTINGS_SERVICE }),
    DatabaseModule,
    RmqModule,
    HttpModule
  ],
  controllers: [VendorsController],
  providers: [VendorsService, VendorRepository, VendorSettingsRepository, BrevoClient]
})
export class VendorsModule {}
