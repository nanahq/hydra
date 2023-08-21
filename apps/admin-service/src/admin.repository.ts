import { Injectable, Logger } from '@nestjs/common'
import { AbstractRepository } from '@app/common'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Connection, Model } from 'mongoose'
import { Admin } from '@app/common/database/schemas/admin.schema'

@Injectable()
export class AdminRepository extends AbstractRepository<Admin> {
  protected readonly logger = new Logger(AdminRepository.name)

  constructor (
  @InjectModel(Admin.name) adminModel: Model<Admin>,
    @InjectConnection() connection: Connection
  ) {
    super(adminModel, connection)
  }
}
