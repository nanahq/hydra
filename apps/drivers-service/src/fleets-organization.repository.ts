import { Injectable, Logger } from '@nestjs/common'
import { AbstractRepository, FleetOrganization } from '@app/common'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Connection, Model } from 'mongoose'

@Injectable()
export class FleetOrgRepository extends AbstractRepository<FleetOrganization> {
  protected readonly logger = new Logger(FleetOrgRepository.name)

  constructor (
  @InjectModel(FleetOrganization.name) orderModel: Model<FleetOrganization>,
    @InjectConnection() connection: Connection
  ) {
    super(orderModel, connection)
  }
}
