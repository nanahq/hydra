import { Injectable, Logger } from '@nestjs/common'
import { AbstractRepository, VendorPayout } from '@app/common'
import { InjectModel, InjectConnection } from '@nestjs/mongoose'
import { Model, Connection } from 'mongoose'

@Injectable()
export class VendorPayoutRepository extends AbstractRepository<VendorPayout> {
  protected readonly logger = new Logger(VendorPayout.name)

  constructor (
  @InjectModel(VendorPayout.name) payoutModel: Model<VendorPayout>,
    @InjectConnection() connection: Connection
  ) {
    super(payoutModel, connection)
  }
}
