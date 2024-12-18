import { Injectable, Logger } from '@nestjs/common'
import { AbstractRepository, FleetPayout } from '@app/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

@Injectable()
export class FleetPayoutRepository extends AbstractRepository<FleetPayout> {
  protected readonly logger = new Logger(FleetPayout.name)

  constructor (
  @InjectModel(FleetPayout.name) payoutModel: Model<FleetPayout>
  ) {
    super(payoutModel)
  }
}
