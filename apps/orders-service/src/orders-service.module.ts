import { Module } from '@nestjs/common';
import { OrdersServiceController } from './orders-service.controller';
import { OrdersServiceService } from './orders-service.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity, QUEUE_SERVICE, RmqModule } from '@app/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        RMQ_VENDORS_QUEUE: Joi.string(),
        RMQ_VENDORS_API_QUEUE: Joi.string(),
        RMQ_URI: Joi.string(),
      }),
      envFilePath: './apps/orders-service/.env',
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
        entities: [OrderEntity],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([OrderEntity]),
    RmqModule.register({ name: QUEUE_SERVICE.NOTIFICATION_SERVICE }),
    RmqModule,
  ],
  controllers: [OrdersServiceController],
  providers: [OrdersServiceService],
})
export class OrdersServiceModule {}
