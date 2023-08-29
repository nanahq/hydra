import { Injectable, Logger } from '@nestjs/common'
import { AbstractRepository, Payment } from '@app/common'
import { InjectModel, InjectConnection } from '@nestjs/mongoose'
import { Model, Connection } from 'mongoose'

@Injectable()
export class PaymentRepository extends AbstractRepository<Payment> {
  protected readonly logger = new Logger(Payment.name)

  constructor (
  @InjectModel(Payment.name) payoutModel: Model<Payment>,
    @InjectConnection() connection: Connection
  ) {
    super(payoutModel, connection)
  }
}
