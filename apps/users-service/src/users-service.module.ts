import { RmqModule } from '@app/common'
import { DatabaseModule } from '@app/common/database/database.module'
import { QUEUE_SERVICE } from '@app/common/typings/QUEUE_MESSAGE'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import * as Joi from 'joi'
import { User, UserSchema } from './schema'
import { UsersServiceController } from './users-service.controller'
import { UsersServiceService } from './users-service.service'
import { UsersRepository } from './users.repository'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        RMQ_USERS_QUEUE: Joi.string(),
        RMQ_URI: Joi.string()
      }),
      envFilePath: '.../.env'
    }),
    DatabaseModule,
    RmqModule.register({ name: QUEUE_SERVICE.NOTIFICATION_SERVICE }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
  ],
  controllers: [UsersServiceController],
  providers: [
    UsersServiceService, 
    UsersRepository
  ]
})
export class UsersServiceModule {}
