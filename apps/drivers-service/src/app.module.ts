import {
  DynamicModule,
  INestApplication,
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe
} from '@nestjs/common'
import { DriversServiceController } from './drivers-service.controller'
import { DriversServiceService } from './drivers-service.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import {
  Delivery,
  DeliverySchema,
  Driver,
  DriverSchema,
  FitHttpException,

  ListingMenu,
  ListingMenuSchema,
  Order,
  OrderSchema,
  RmqModule,
  User,
  UserSchema,
  Vendor,
  VendorSchema,
  DatabaseModule,
  FleetOrganization,
  FleetOrganizationSchema,
  FleetMember,
  FleetMemberSchema,
  QUEUE_SERVICE
} from '@app/common'
import * as cookieParser from 'cookie-parser'
import { APP_FILTER, APP_GUARD, NestFactory } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { ThrottlerModule } from '@nestjs/throttler'
import helmet from 'helmet'
import { AppMetadata } from '../../../app.config'
import { DriverRepository } from './drivers-service.repository'
import { FleetLocalStrategy, LocalStrategy } from './auth/strategy/local.strategy'
import { FleetJwtStrategy, JwtStrategy } from './auth/strategy/jwt.strategy'
import { DriversAuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { ODSA } from './ODSA/odsa.service'
import { OdsaController } from './ODSA/odsa.controller'
import { ScheduleModule } from '@nestjs/schedule'
import { OdsaRepository } from './ODSA/odsa.repository'
import { EventsGateway } from './websockets/events.gateway'
import { EventsService } from './websockets/events.service'
import * as Joi from 'joi'
import { TacoService } from './ODSA/taco.service'
import { FleetMemberRepository } from './fleet/fleets-member.repository'
import { FleetOrgRepository } from './fleet/fleets-organization.repository'
import { FleetController } from './fleet/fleet.controller'
import { FleetService } from './fleet/fleet.service'
import { FleetLocalGuard } from './auth/guards/local.guard'
import { FleetJwtAuthGuard } from './auth/guards/jwt.guard'
import { AwsService } from 'apps/vendor-gateway/src/aws.service'

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
        ScheduleModule.forRoot(),
        ConfigModule.forRoot({
          isGlobal: true,
          validationSchema: Joi.object({
            DRIVER_PORT: Joi.string().required()
          }),
          envFilePath: './apps/drivers-service/.env'
        }),
        JwtModule.registerAsync({
          useFactory: (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET'),
            signOptions: {
              expiresIn: `${
                configService.get<string>('DRIVER_JWT_EXPIRATION', '100000') ?? ''
              }s`
            }
          }),
          inject: [ConfigService]
        }),
        MongooseModule.forFeature([
          {
            name: Vendor.name,
            schema: VendorSchema
          },
          {
            name: User.name,
            schema: UserSchema
          },
          {
            name: ListingMenu.name,
            schema: ListingMenuSchema
          },
          {
            name: Driver.name,
            schema: DriverSchema
          },
          {
            name: Order.name,
            schema: OrderSchema
          },
          {
            name: Delivery.name,
            schema: DeliverySchema
          },
          {
            name: FleetOrganization.name,
            schema: FleetOrganizationSchema
          },
          {
            name: FleetMember.name,
            schema: FleetMemberSchema
          }
        ]),
        DatabaseModule,
        RmqModule.register({ name: QUEUE_SERVICE.NOTIFICATION_SERVICE }),
        RmqModule.register({ name: QUEUE_SERVICE.USERS_SERVICE }),
        RmqModule.register({ name: QUEUE_SERVICE.ORDERS_SERVICE }),
        RmqModule.register({ name: QUEUE_SERVICE.NOTIFICATION_SERVICE }),
        RmqModule.register({ name: QUEUE_SERVICE.LOCATION_SERVICE }),
        RmqModule.register({ name: QUEUE_SERVICE.PAYMENT_SERVICE }),
        RmqModule,
        AppModule
      ],
      controllers: [
        DriversServiceController,
        DriversAuthController,
        OdsaController,
        FleetController
      ],
      providers: [
        DriversServiceService,
        DriverRepository,
        FleetMemberRepository,
        FleetOrgRepository,
        JwtStrategy,
        LocalStrategy,
        AuthService,
        AwsService,
        ODSA,
        TacoService,
        OdsaRepository,
        EventsGateway,
        EventsService,
        FleetService,
        FleetLocalGuard,
        FleetJwtAuthGuard,
        FleetJwtStrategy,
        FleetLocalStrategy,
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
    app.setGlobalPrefix(`driver-gateway/${version}`)
  }

  // TODO(@siradji) improve versioning
  static getVersion (): string {
    const { API_VERSION } = AppMetadata
    return API_VERSION
  }

  /*
      Get the version info from App meta data  file or environmental variable
      @returns string
      */

  configure (consumer: MiddlewareConsumer): void {
    consumer.apply(cookieParser() as any).forRoutes('*')
  }
}
