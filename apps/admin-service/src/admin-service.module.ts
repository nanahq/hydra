import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'

import { AdminServiceService } from './admin-service.service'
import { AdminServiceController } from './admin-service.controller'
import { Admin, AdminSchema, RmqModule } from '@app/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AdminRepository } from './admin.repository'
import { DatabaseModule } from '@app/common/database/database.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        RMQ_VENDORS_QUEUE: Joi.string(),
        RMQ_VENDORS_API_QUEUE: Joi.string(),
        RMQ_URI: Joi.string()
      }),
      envFilePath: './apps/admin-service/.env'
    }),
    MongooseModule.forFeature([{
      name: Admin.name,
      schema: AdminSchema
    }]),
    DatabaseModule,
    RmqModule
  ],
  controllers: [AdminServiceController],
  providers: [AdminServiceService, AdminRepository]
})
export class AdminServiceModule {
}
