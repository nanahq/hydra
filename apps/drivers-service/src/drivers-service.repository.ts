import { Injectable, Logger } from '@nestjs/common'
import { AbstractRepository, Driver } from '@app/common'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Connection, Model } from 'mongoose'

@Injectable()
export class DriverRepository extends AbstractRepository<Driver> {
  protected readonly logger = new Logger(DriverRepository.name)

  constructor (
  @InjectModel(Driver.name) orderModel: Model<Driver>,
    @InjectConnection() connection: Connection
  ) {
    super(orderModel, connection)
  }
}
