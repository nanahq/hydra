import { Injectable, Logger } from '@nestjs/common'
import { AbstractRepository, Delivery } from '@app/common'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Connection, Model } from 'mongoose'

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
