import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import * as Joi from 'joi'
import { ListingServiceController } from './listing-service.controller'
import { ListingServiceService } from './listing-service.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RmqModule } from '@app/common'
import { ListingEntity } from '@app/common/database/entities/Listing'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        RMQ_LISTING_QUEUE: Joi.string(),
        RMQ_LISTING_API_QUEUE: Joi.string(),
        RMQ_URI: Joi.string()
      }),
      envFilePath: './apps/listing-service/.env'
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
        entities: [ListingEntity],
        synchronize: true
      }),
      inject: [ConfigService]
    }),
    TypeOrmModule.forFeature([ListingEntity]),
    RmqModule
  ],
  controllers: [ListingServiceController],
  providers: [ListingServiceService]
})
export class ListingServiceModule {
}
