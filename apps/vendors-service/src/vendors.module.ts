import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import * as Joi from 'joi'

import {
  RmqModule,
  Vendor,
  VendorSchema,
  VendorSettings,
  VendorSettingsSchema,
  DatabaseModule
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
      validationSchema: Joi.object({
        RMQ_VENDORS_QUEUE: Joi.string(),
        RMQ_VENDORS_API_QUEUE: Joi.string(),
        RMQ_URI: Joi.string(),
        MONGODB_URI: Joi.string().required()
      }),
      envFilePath: './apps/vendors-service/.env'
    }),
    MongooseModule.forFeature([
      { name: Vendor.name, schema: VendorSchema },
      { name: VendorSettings.name, schema: VendorSettingsSchema }
    ]),
    DatabaseModule,
    RmqModule
  ],
  controllers: [VendorsController],
  providers: [VendorsService, VendorRepository, VendorSettingsRepository]
})
export class VendorsModule {}
