import { MiddlewareConsumer, NestModule } from '@nestjs/common'
import * as cookieParser from 'cookie-parser'

export class AuthModule implements NestModule {
  configure (consumer: MiddlewareConsumer): void {
    consumer.apply(cookieParser()).forRoutes('*')
  }
}
