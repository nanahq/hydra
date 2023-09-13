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
  ListingOptionGroupSchema, ScheduledListing, ScheduledListingSchema
} from '@app/common'

import { MongooseModule } from '@nestjs/mongoose'
import {
  ListingMenuRepository,
  ListingCategoryRepository,
  ListingOptionGroupRepository, ScheduledListingRepository
} from './listings.repository'

@Module({
  imports: [
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
      { name: ScheduledListing.name, schema: ScheduledListingSchema }
    ]),
    MongooseModule.forFeature([{ name: Vendor.name, schema: VendorSchema }]),
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
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
