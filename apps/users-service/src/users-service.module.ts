import { RmqModule, UserEntity } from '@app/common'
import { QUEUE_SERVICE } from '@app/common/typings/QUEUE_MESSAGE'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import * as Joi from 'joi'
import { UsersServiceController } from './users-service.controller'
import { UsersService } from './users-service.service'
import { UsersRepository } from './users.repository'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        RMQ_USERS_QUEUE: Joi.string(),
        RMQ_URI: Joi.string()
      }),
      envFilePath: './apps/users-service/.env'
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
        entities: [UserEntity],
        synchronize: true
      }),
      inject: [ConfigService]
    }),
    RmqModule.register({ name: QUEUE_SERVICE.NOTIFICATION_SERVICE }),
    TypeOrmModule.forFeature([UserEntity])
  ],
  controllers: [UsersServiceController],
  providers: [UsersService, UsersRepository]
})
export class UsersServiceModule {}
