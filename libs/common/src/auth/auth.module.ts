import { MiddlewareConsumer, NestModule } from '@nestjs/common'
import {} from '@nestjs/common'
import * as cookieParser from 'cookie-parser'


export class AuthModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(cookieParser()).forRoutes('*')
    }
}