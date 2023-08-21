import { Injectable, Logger } from '@nestjs/common'
import {
  AbstractRepository, Delivery
} from '@app/common'
import { InjectModel, InjectConnection } from '@nestjs/mongoose'
import { Model, Connection } from 'mongoose'

@Injectable()
export class OdsaRepository extends AbstractRepository<Delivery> {
  protected readonly logger = new Logger(OdsaRepository.name)

  constructor (
  @InjectModel(Delivery.name) orderModel: Model<Delivery>,
    @InjectConnection() connection: Connection
  ) {
    super(orderModel, connection)
  }
}
