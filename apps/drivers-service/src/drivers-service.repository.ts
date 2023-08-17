import { Injectable, Logger } from '@nestjs/common'
import {
  AbstractRepository, Driver
} from '@app/common'
import { InjectModel, InjectConnection } from '@nestjs/mongoose'
import { Model, Connection } from 'mongoose'

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
