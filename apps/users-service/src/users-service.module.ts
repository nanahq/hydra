import { ConfigModule } from '@nestjs/config'
import { Module } from '@nestjs/common'

import * as Joi from 'joi'

import { RmqModule, User, UserSchema, QUEUE_SERVICE } from '@app/common'
import { UsersServiceController } from './users-service.controller'
import { UsersService } from './users-service.service'
import { DatabaseModule } from '@app/common/database/database.module'
import { MongooseModule } from '@nestjs/mongoose'
import { UserRepository } from './users.repository'

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
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    DatabaseModule,
    RmqModule.register({ name: QUEUE_SERVICE.NOTIFICATION_SERVICE }),
    RmqModule
  ],
  controllers: [UsersServiceController],

  providers: [UsersService, UserRepository]
})
export class UsersServiceModule {}
