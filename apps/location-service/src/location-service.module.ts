import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { QUEUE_SERVICE, RmqModule } from '@app/common'
import { ScheduleModule } from '@nestjs/schedule'
import { HttpModule } from '@nestjs/axios'
import { LocationController } from './location-service.controller'
import { LocationService } from './location-service.service'
import { CacheModule } from '@nestjs/cache-manager'
import { SentryModule } from '@sentry/nestjs/setup'

@Module({
  imports: [
    SentryModule.forRoot(),
    CacheModule.register(),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/location-service/.env'
    }),
    RmqModule.register({ name: QUEUE_SERVICE.API_SERVICE }),
    RmqModule.register({ name: QUEUE_SERVICE.ORDERS_SERVICE }),
    RmqModule.register({ name: QUEUE_SERVICE.DRIVER_SERVICE }),
    RmqModule,
    HttpModule
  ],
  controllers: [LocationController],
  providers: [LocationService]
})
export class LocationModule {}
