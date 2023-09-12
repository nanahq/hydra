import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'
import {
  Review,
  ReviewSchema,
  RmqModule,
  DatabaseModule,
  Vendor,
  VendorSchema,
  ListingMenuSchema,
  ListingMenu, Order, OrderSchema, ExportPushNotificationClient, QUEUE_SERVICE
} from '@app/common'
import { ReviewsServiceController } from './reviews-service.controller'
import { ReviewsService } from './reviews-service.service'
import { MongooseModule } from '@nestjs/mongoose'
import { ReviewRepository } from './review.repositoty'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        RMQ_REVIEWS_QUEUE: Joi.string(),
        RMQ_VENDORS_API_QUEUE: Joi.string(),
        RMQ_URI: Joi.string()
      }),
      envFilePath: './apps/reviews-service/.env'
    }),
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
    MongooseModule.forFeature([{ name: Vendor.name, schema: VendorSchema }]),
    MongooseModule.forFeature([{ name: ListingMenu.name, schema: ListingMenuSchema }]),
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    RmqModule.register({ name: QUEUE_SERVICE.VENDORS_SERVICE }),
    DatabaseModule,
    RmqModule
  ],
  controllers: [ReviewsServiceController],
  providers: [ReviewsService, ReviewRepository, ExportPushNotificationClient]
})
export class ReviewsServiceModule {}
