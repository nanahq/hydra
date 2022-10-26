import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import * as Joi from 'joi'
import { TypeOrmModule } from '@nestjs/typeorm'

import { ListingsServiceController } from './listings-service.controller'
import { ListingsService } from './listings-service.service'
import { RmqModule, ListingEntity, ListingOptionEntity } from '@app/common'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        RMQ_LISTING_QUEUE: Joi.string(),
        RMQ_VENDORS_API_QUEUE: Joi.string(),
        RMQ_URI: Joi.string()
      }),
      envFilePath: './apps/listings-service/.env'
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): any => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST') as string,
        port: configService.get<string>('DB_PORT') ?? 5432,
        username: configService.get<string>('DB_USERNAME') as string,
        password: configService.get<string>('DB_PASSWORD') as string,
        database: configService.get<string>('DB_NAME') as string,
        entities: [ListingEntity, ListingOptionEntity],
        synchronize: true
      }),
      inject: [ConfigService]
    }),
    TypeOrmModule.forFeature([ListingEntity, ListingOptionEntity]),
    RmqModule
  ],
  controllers: [ListingsServiceController],
  providers: [ListingsService]
})
export class ListingsServiceModule {}
