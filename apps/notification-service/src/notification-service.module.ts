import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TwilioModule } from 'nestjs-twilio'
import * as Joi from 'joi'
import {
  RmqModule,
  QUEUE_SERVICE,
  ScheduledListingNotification,
  ScheduledListingNotificationSchema,
  Vendor,
  User,
  UserSchema,
  VendorSchema,
  ExportPushNotificationClient,
  DatabaseModule, BrevoClient
} from '@app/common'
import { NotificationServiceController } from './notification-service.controller'
import { NotificationServiceService } from './notification-service.service'
import { TransactionEmails } from './email/transactional.service'
import { MongooseModule } from '@nestjs/mongoose'
import { SubscriptionController } from './subscription.controller'
import { SubscriptionService } from './subscription.service'
import { SubscriptionRepository } from './subscription.repository'
import { HttpModule } from '@nestjs/axios'
import { TermiiService } from '@app/common/termii/termii'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        RMQ_NOTIFICATION_QUEUE: Joi.string().required(),
        RMQ_URI: Joi.string().required(),
        TWILIO_ACCOUNT_SID: Joi.string().required(),
        TWILIO_AUTH_TOKEN: Joi.string().required(),
        TWILIO_SERVICE_NAME: Joi.string().required(),
        SLACK_WEBHOOK_URL: Joi.string().required(),
        BREVO_API_KEY: Joi.string().required(),
        TERMII_API_KEY: Joi.string().required(),
        TERMII_SERVICE_NAME: Joi.string().required()
      }),
      envFilePath: './apps/notification-service/.env'
    }),
    TwilioModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        accountSid: configService.get('TWILIO_ACCOUNT_SID'),
        authToken: configService.get('TWILIO_AUTH_TOKEN')
      }),
      inject: [ConfigService]
    }),
    MongooseModule.forFeature([
      {
        name: ScheduledListingNotification.name,
        schema: ScheduledListingNotificationSchema
      },
      { name: User.name, schema: UserSchema },
      { name: Vendor.name, schema: VendorSchema }
    ]),
    RmqModule.register({ name: QUEUE_SERVICE.USERS_SERVICE }),
    RmqModule.register({ name: QUEUE_SERVICE.PAYMENT_SERVICE }),
    RmqModule.register({ name: QUEUE_SERVICE.LISTINGS_SERVICE }),
    DatabaseModule,
    RmqModule,
    HttpModule
  ],
  controllers: [NotificationServiceController, SubscriptionController],
  providers: [
    NotificationServiceService,
    ConfigService,
    SubscriptionService,
    ExportPushNotificationClient,
    SubscriptionRepository,
    BrevoClient,
    TransactionEmails,
    TermiiService
  ]
})
export class NotificationServiceModule {}
