import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';

import { AdminServiceService } from './admin-service.service';
import { AdminServiceController } from './admin-service.controller';
import { RmqModule, AdminEntity } from '@app/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        RMQ_VENDORS_QUEUE: Joi.string(),
        RMQ_VENDORS_API_QUEUE: Joi.string(),
        RMQ_URI: Joi.string(),
      }),
      envFilePath: './apps/admin-service/.env',
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
        entities: [AdminEntity],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([AdminEntity]),
    RmqModule,
  ],
  controllers: [AdminServiceController],
  providers: [AdminServiceService],
})
export class AdminServiceModule {}
