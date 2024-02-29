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
  QUEUE_SERVICE
} from '@app/common'
import { VendorsController } from './vendors.controller'
import { VendorsService } from './vendors.service'

import { MongooseModule } from '@nestjs/mongoose'

import {
  VendorSettingsRepository,
  VendorRepository
} from './vendors.repository'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/vendors-service/.env'
    }),
    MongooseModule.forFeature([
      { name: Vendor.name, schema: VendorSchema },
      { name: VendorSettings.name, schema: VendorSettingsSchema },
      {
        name: ScheduledListingNotification.name,
        schema: ScheduledListingNotificationSchema
      }
    ]),
    RmqModule.register({ name: QUEUE_SERVICE.NOTIFICATION_SERVICE }),
    DatabaseModule,
    RmqModule
  ],
  controllers: [VendorsController],
  providers: [VendorsService, VendorRepository, VendorSettingsRepository]
})
export class VendorsModule {}
