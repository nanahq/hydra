import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'

import { ListingsController } from './listings.controller'
import { ListingsService } from './listings.service'
import {
  Review,
  ReviewSchema,
  RmqModule,
  Vendor,
  VendorSchema,
  DatabaseModule,
  ListingCategory,
  ListingCategorySchema,
  ListingMenu,
  ListingMenuSchema,
  ListingOptionGroup,
  ListingOptionGroupSchema,
  ScheduledListing,
  ScheduledListingSchema,
  QUEUE_SERVICE
} from '@app/common'

import { MongooseModule } from '@nestjs/mongoose'
import {
  ListingMenuRepository,
  ListingCategoryRepository,
  ListingOptionGroupRepository,
  ScheduledListingRepository
} from './listings.repository'
import { ScheduleModule } from '@nestjs/schedule'
import { CacheModule } from '@nestjs/cache-manager'

@Module({
  imports: [
    CacheModule.register(),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        RMQ_LISTING_QUEUE: Joi.string(),
        RMQ_VENDORS_API_QUEUE: Joi.string(),
        RMQ_URI: Joi.string(),
        MONGODB_URI: Joi.string().required()
      }),
      envFilePath: './apps/listings-service/.env'
    }),
    MongooseModule.forFeature([
      { name: ListingCategory.name, schema: ListingCategorySchema },
      { name: ListingMenu.name, schema: ListingMenuSchema },
      { name: ListingOptionGroup.name, schema: ListingOptionGroupSchema },
      { name: ScheduledListing.name, schema: ScheduledListingSchema },
      { name: Vendor.name, schema: VendorSchema }
    ]),
    MongooseModule.forFeature([{ name: Vendor.name, schema: VendorSchema }]),
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
    RmqModule.register({ name: QUEUE_SERVICE.NOTIFICATION_SERVICE }),
    RmqModule.register({ name: QUEUE_SERVICE.VENDORS_SERVICE }),
    RmqModule.register({ name: QUEUE_SERVICE.REVIEW_SERVICE }),
    DatabaseModule,
    RmqModule
  ],
  controllers: [ListingsController],
  providers: [
    ListingsService,
    ListingMenuRepository,
    ListingCategoryRepository,
    ListingOptionGroupRepository,
    ScheduledListingRepository
  ]
})
export class ListingsModule {}
