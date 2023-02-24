import { Injectable, Logger } from '@nestjs/common'
import {
  AbstractRepository,
  Order
} from '@app/common'
import { InjectModel, InjectConnection } from '@nestjs/mongoose'
import { Model, Connection } from 'mongoose'

@Injectable()
export class OrderRepository extends AbstractRepository<Order> {
  protected readonly logger = new Logger(ListingMenuRepository.name)

  constructor (
  @InjectModel(Order.name) orderModel: Model<Order>,
    @InjectConnection() connection: Connection
  ) {
    super(orderModel, connection)
  }
}
