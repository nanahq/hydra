import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'

import { AdminServiceService } from './admin-service.service'
import { AdminServiceController } from './admin-service.controller'
import { Admin, AdminSchema, RmqModule } from '@app/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AdminRepository } from './admin.repository'
import { DatabaseModule } from '@app/common/database/database.module'
import { AddressBookLabelService } from './address-book-label/address-book-label-service.service'
import { AddressBookLabelRepository } from './address-book-label/address.book.label.repository'
import { AddressBookLabel, AddressBookLabelSchema } from '@app/common/database/schemas/address.book.label.schema'
import { AddressBookLabelServiceController } from './address-book-label/address-book-label-service.controller'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        RMQ_ADMINS_QUEUE: Joi.string().required(),
        RMQ_ADMINS_API_QUEUE: Joi.string().required(),
        RMQ_URI: Joi.string()
      }),
      envFilePath: './apps/admin-service/.env'
    }),
    MongooseModule.forFeature([
      {
        name: Admin.name,
        schema: AdminSchema
      },
      {
        name: AddressBookLabel.name,
        schema: AddressBookLabelSchema
      }
    ]),
    DatabaseModule,
    RmqModule
  ],
  controllers: [AdminServiceController, AddressBookLabelServiceController],
  providers: [AdminServiceService, AdminRepository, AddressBookLabelService, AddressBookLabelRepository]
})
export class AdminServiceModule {
}
