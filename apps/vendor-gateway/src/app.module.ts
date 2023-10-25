import { JwtModule } from '@nestjs/jwt'
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
import { ThrottlerModule } from '@nestjs/throttler'

import helmet from 'helmet'
import * as cookieParser from 'cookie-parser'
import * as Joi from 'joi'

import { AppMetadata } from 'app.config'
import { FitHttpException, QUEUE_SERVICE, RmqModule } from '@app/common'
import { VendorController } from './module.api/vendor.controller'
import { AuthController } from './module.api/auth.controller'
import { AuthService } from './module.api/auth.service'
import { LocalStrategy } from './auth/strategy/local.strategy'
import { JwtStrategy } from './auth/strategy/jwt.strategy'
import { ListingsController } from './module.api/listings.controller'
import { OrdersController } from './module.api/orders.controller'
import { ReviewController } from './module.api/review.controller'
import { WalletController } from './module.api/wallet.controller'
import { AwsService } from './aws.service'
import { DriversController } from './module.api/drivers.controller'

@Module({})
export class AppModule implements NestModule {
  configure (consumer: MiddlewareConsumer): void {
    consumer.apply(cookieParser()).forRoutes('*')
  }

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
          envFilePath: './apps/vendor-gateway/.env'
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
        RmqModule.register({ name: QUEUE_SERVICE.VENDORS_SERVICE }),
        RmqModule.register({ name: QUEUE_SERVICE.LISTINGS_SERVICE }),
        RmqModule.register({ name: QUEUE_SERVICE.ORDERS_SERVICE }),
        RmqModule.register({ name: QUEUE_SERVICE.REVIEW_SERVICE }),
        RmqModule.register({ name: QUEUE_SERVICE.PAYMENT_SERVICE }),
        RmqModule.register({ name: QUEUE_SERVICE.DRIVER_SERVICE }),
        ThrottlerModule.forRootAsync({
          useFactory: () => ({
            ttl: 60,
            limit: 10
          })
        }),
        AppModule
      ],
      controllers: [
        VendorController,
        AuthController,
        ListingsController,
        OrdersController,
        ReviewController,
        WalletController,
        DriversController
      ],
      providers: [
        AuthService,
        LocalStrategy,
        JwtStrategy,
        AwsService,
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
    app.setGlobalPrefix(`vendor-gateway/${version}`)
    app.enableCors({
      allowedHeaders: ['content-type'],
      origin: '*'
    })
  }

  /*
      Get the version info from App meta data  file or enviromental variable
      @returns string
      */

  // TODO(@siradji) improve versioning
  static getVersion (): string {
    const { API_VERSION } = AppMetadata
    return API_VERSION
  }
}
