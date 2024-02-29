import { Injectable, Logger } from '@nestjs/common'
import { AbstractRepository, Payment } from '@app/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

@Injectable()
export class PaymentRepository extends AbstractRepository<Payment> {
  protected readonly logger = new Logger(Payment.name)

  constructor (@InjectModel(Payment.name) payoutModel: Model<Payment>) {
    super(payoutModel)
  }
}
