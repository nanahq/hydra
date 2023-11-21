import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TwilioModule } from 'nestjs-twilio'
import * as Joi from 'joi'
import {
  RmqModule,
  QUEUE_SERVICE,
  ScheduledListingNotification,
  ScheduledListingNotificationSchema,
  Vendor, User, UserSchema, VendorSchema, ExportPushNotificationClient
} from '@app/common'
import { NotificationServiceController } from './notification-service.controller'
import { NotificationServiceService } from './notification-service.service'
import { TransactionEmails } from './email/transactional.service'
import { MongooseModule } from '@nestjs/mongoose'
import { SubscriptionController } from './subscription.controller'
import { SubscriptionService } from './subscription.service'
import { SubscriptionRepository } from './subscription.repository'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        RMQ_NOTIFICATION_QUEUE: Joi.string(),
        RMQ_URI: Joi.string(),
        TWILIO_ACCOUNT_SID: Joi.string(),
        TWILIO_AUTH_TOKEN: Joi.string(),
        TWILIO_SERVICE_NAME: Joi.string(),
        SEND_IN_BLUE_API: Joi.string().required()
      }),
      envFilePath: '.../.env'
    }),
    TwilioModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        accountSid: 'ACec965067efbc4019dd61a5aaf0c42369',
        authToken: configService.get('TWILIO_AUTH_TOKEN')
      }),
      inject: [ConfigService]
    }),
    MongooseModule.forFeature([
      { name: ScheduledListingNotification.name, schema: ScheduledListingNotificationSchema },
      { name: User.name, schema: UserSchema },
      { name: Vendor.name, schema: VendorSchema }
    ]),
    RmqModule.register({ name: QUEUE_SERVICE.USERS_SERVICE }),
    RmqModule.register({ name: QUEUE_SERVICE.PAYMENT_SERVICE }),
    RmqModule.register({ name: QUEUE_SERVICE.LISTINGS_SERVICE })
  ],
  controllers: [NotificationServiceController, SubscriptionController],
  providers: [NotificationServiceService, ConfigService, SubscriptionService, ExportPushNotificationClient, SubscriptionRepository, TransactionEmails]
})
export class NotificationServiceModule {}
