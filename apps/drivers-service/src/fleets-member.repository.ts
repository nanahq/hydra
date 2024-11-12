import { Injectable, Logger } from '@nestjs/common'
import { AbstractRepository, FleetMember } from '@app/common'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Connection, Model } from 'mongoose'

@Injectable()
export class FleetMemberRepository extends AbstractRepository<FleetMember> {
  protected readonly logger = new Logger(FleetMemberRepository.name)

  constructor (
  @InjectModel(FleetMember.name) orderModel: Model<FleetMember>,
    @InjectConnection() connection: Connection
  ) {
    super(orderModel, connection)
  }
}
