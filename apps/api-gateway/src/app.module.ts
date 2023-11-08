import {
  DynamicModule,
  INestApplication,
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe
} from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_FILTER, APP_GUARD, NestFactory } from '@nestjs/core'
import { AppMetadata } from 'app.config'
import { JwtModule } from '@nestjs/jwt'
import { ThrottlerModule } from '@nestjs/throttler'

import * as cookieParser from 'cookie-parser'
import * as Joi from 'joi'
import helmet from 'helmet'

import { FitHttpException, QUEUE_SERVICE, RmqModule } from '@app/common'
import { UsersController } from './module.api/users.controller'
import { AuthController } from './module.api/auth.controller'
import { AuthService } from './module.api/auth.service'
import { LocalStrategy } from './auth/strategy/local.strategy'
import { JwtStrategy } from './auth/strategy/jwt.strategy'
import { VendorsController } from './module.api/vendors.controller'
import { ListingsController } from './module.api/listing.controller'
import { OrderController } from './module.api/order.controller'
import { ReviewController } from './module.api/review.controller'
import { PaymentController } from './module.api/payment.controller'
import { AddressBookController } from './module.api/address-book.controller'
import { LocationController } from './module.api/location.controller'
import { GeneralController } from './module.api/general.controller'

@Module({})
export class AppModule implements NestModule {
  static async create (): Promise<INestApplication> {
    const app = await NestFactory.create(this.forRoot())
    this.configure(app)
    return app
  }

  static forRoot (): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          validationSchema: Joi.object({
            JWT_SECRET: Joi.string().required(),
            JWT_EXPIRATION: Joi.string().required()
          }),
          envFilePath: './apps/api-gateway/.env'
        }),
        JwtModule.registerAsync({
          useFactory: (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET'),
            signOptions: {
              expiresIn: `${
                configService.get<string>('JWT_EXPIRATION') ?? ''
              }s`
            }
          }),
          inject: [ConfigService]
        }),
        RmqModule.register({ name: QUEUE_SERVICE.ADMINS_SERVICE }),
        RmqModule.register({ name: QUEUE_SERVICE.USERS_SERVICE }),
        RmqModule.register({ name: QUEUE_SERVICE.NOTIFICATION_SERVICE }),
        RmqModule.register({ name: QUEUE_SERVICE.VENDORS_SERVICE }),
        RmqModule.register({ name: QUEUE_SERVICE.LISTINGS_SERVICE }),
        RmqModule.register({ name: QUEUE_SERVICE.ORDERS_SERVICE }),
        RmqModule.register({ name: QUEUE_SERVICE.REVIEW_SERVICE }),
        RmqModule.register({ name: QUEUE_SERVICE.PAYMENT_SERVICE }),
        RmqModule.register({ name: QUEUE_SERVICE.LOCATION_SERVICE }),
        ThrottlerModule.forRootAsync({
          useFactory: () => ({
            ttl: 60,
            limit: 10
          })
        }),
        AppModule
      ],
      controllers: [
        UsersController,
        AuthController,
        VendorsController,
        ListingsController,
        OrderController,
        ReviewController,
        PaymentController,
        AddressBookController,
        LocationController,
        GeneralController
      ],
      providers: [
        AuthService,
        LocalStrategy,
        JwtStrategy,
        {
          provide: APP_FILTER,
          useClass: FitHttpException
        },
        {
          provide: APP_GUARD,
          useClass: ThrottlerModule
        }
      ]
    }
  }

  /**
   *  Set Apps configurations
   * @param app INestApplication
   * @returns  void
   */
  static configure (app: INestApplication): void {
    const version = this.getVersion()
    app.use(helmet())
    app.useGlobalPipes(new ValidationPipe())
    app.setGlobalPrefix(`api-gateway/${version}`)
  }

  // TODO(@siradji) improve versioning
  static getVersion (): string {
    const { API_VERSION } = AppMetadata
    return API_VERSION
  }

  /*
        Get the version info from App meta data  file or enviromental variable
        @returns string
        */

  configure (consumer: MiddlewareConsumer): void {
    consumer.apply(cookieParser()).forRoutes('*')
  }
}
