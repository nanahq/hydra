import { RmqModule } from '@app/common'
import { QUEUE_SERVICE } from '@app/common/typings/QUEUE_MESSAGE'
import {
  DynamicModule,
  INestApplication,
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_FILTER, APP_GUARD, NestFactory } from '@nestjs/core'
import { AppMetadata } from 'app.config'
import { UsersController } from './module.api/users.controller'
import * as Joi from 'joi'
import { JwtModule } from '@nestjs/jwt'
import { AuthController } from './module.api/auth.controller'
import { AuthService } from './module.api/auth.service'
import { LocalStrategy } from './auth/strategy/local.strategy'
import { JwtStrategy } from './auth/strategy/jwt.strategy'
import { FitHttpException } from '@app/common/filters/rpc.expection'
import helmet from 'helmet'
import { ThrottlerModule } from '@nestjs/throttler'
import * as cookieParser from 'cookie-parser'

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
        RmqModule.register({ name: QUEUE_SERVICE.USERS_SERVICE }),
        RmqModule.register({ name: QUEUE_SERVICE.NOTIFICATION_SERVICE }),
        ThrottlerModule.forRootAsync({
          useFactory: () => ({
            ttl: 60,
            limit: 10
          })
        }),
        AppModule
      ],
      controllers: [UsersController, AuthController],
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
    app.setGlobalPrefix(`api/${version}`)
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
