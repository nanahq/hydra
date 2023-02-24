import {
  DynamicModule,
  INestApplication,
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe
} from '@nestjs/common'
import { ThrottlerModule } from '@nestjs/throttler'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_FILTER, APP_GUARD, NestFactory } from '@nestjs/core'

import * as Joi from 'joi'
import * as cookieParser from 'cookie-parser'
import helmet from 'helmet'

import { JwtModule } from '@nestjs/jwt'
import { AppMetadata } from 'app.config'
import { AdminController } from './module.api/admin.controller'
import { AuthController } from './module.api/auth.controller'
import { AuthService } from './module.api/auth.service'
import { LocalStrategy } from './auth/strategy/local.strategy'
import { JwtStrategy } from './auth/strategy/jwt.strategy'
import { FitHttpException, QUEUE_SERVICE, RmqModule } from '@app/common'
import { VendorController } from './module.api/vendor.controller'
import { ListingController } from './module.api/listing.controller'
import { OrdersController } from './module.api/orders.controller'
import { ReviewsController } from './module.api/reviews.controller'

@Module({})
export class AppModule implements NestModule {
  configure (consumer: MiddlewareConsumer): void {
    consumer.apply(cookieParser() as any).forRoutes('*')
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
            JWT_EXPIRATION: Joi.string().required(),
            PORT: Joi.string().required()
          }),
          envFilePath: './apps/admin-gateway/.env'
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
        RmqModule.register({ name: QUEUE_SERVICE.ADMIN_SERVICE }),
        RmqModule.register({ name: QUEUE_SERVICE.VENDORS_SERVICE }),
        RmqModule.register({ name: QUEUE_SERVICE.LISTINGS_SERVICE }),
        RmqModule.register({ name: QUEUE_SERVICE.ORDERS_SERVICE }),
        RmqModule.register({ name: QUEUE_SERVICE.REVIEWS_SERVICE }),
        AppModule
      ],
      controllers: [
        AdminController,
        AuthController,
        VendorController,
        ListingController,
        OrdersController,
        ReviewsController
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
    app.setGlobalPrefix(`admin-gateway/${version}`)
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
