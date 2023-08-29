import { ConfigModule } from '@nestjs/config'
import { Module } from '@nestjs/common'

import * as Joi from 'joi'

import {
  QUEUE_SERVICE,
  RmqModule,
  User,
  UserSchema,
  DatabaseModule,
  AddressBook,
  AddressBookSchema
} from '@app/common'
import { UsersServiceController } from './user/users-service.controller'
import { UsersService } from './user/users-service.service'
import { MongooseModule } from '@nestjs/mongoose'
import { UserRepository } from './user/users.repository'
import { AddressBookServiceController } from './address-book/address-book-service.controller'
import { AddressBookRepository } from './address-book/address.book.repository'
import { AddressBookService } from './address-book/address-book-service.service'

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
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema
      },
      {
        name: AddressBook.name,
        schema: AddressBookSchema
      }
    ]),
    DatabaseModule,
    RmqModule.register({ name: QUEUE_SERVICE.NOTIFICATION_SERVICE }),
    RmqModule
  ],
  controllers: [UsersServiceController, AddressBookServiceController],

  providers: [
    UsersService,
    UserRepository,
    AddressBookRepository,
    AddressBookService
  ]
})
export class UsersServiceModule {}
