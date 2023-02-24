import { Injectable, Logger } from '@nestjs/common'
import { AbstractRepository } from '@app/common'
import { InjectModel, InjectConnection } from '@nestjs/mongoose'
import { Model, Connection } from 'mongoose'
import { Admin } from '@app/common/database/schemas/vendor.schema'

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