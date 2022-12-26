import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import * as Joi from 'joi'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ReviewEntity, RmqModule } from '@app/common'
import { ReviewsServiceController } from './reviews-service.controller'
import { ReviewsService } from './reviews-service.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        RMQ_REVIEWS_QUEUE: Joi.string(),
        RMQ_VENDORS_API_QUEUE: Joi.string(),
        RMQ_URI: Joi.string()
      }),
      envFilePath: './apps/reviews-service/.env'
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
        entities: [ReviewEntity],
        synchronize: true
      }),
      inject: [ConfigService]
    }),
    TypeOrmModule.forFeature([ReviewEntity]),
    RmqModule
  ],
  controllers: [ReviewsServiceController],
  providers: [ReviewsService]
})
export class ReviewsServiceModule {}
