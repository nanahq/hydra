import { Injectable, Logger } from '@nestjs/common'
import { AbstractRepository } from '@app/common'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Connection, Model } from 'mongoose'
import { AddressBookLabel } from '@app/common/database/schemas/address.book.label.schema'

@Injectable()
export class AddressBookLabelRepository extends AbstractRepository<AddressBookLabel> {
  protected readonly logger = new Logger(AddressBookLabelRepository.name)

  constructor (
  @InjectModel(AddressBookLabel.name) AddressBookLabelModel: Model<AddressBookLabel>,
    @InjectConnection() connection: Connection
  ) {
    super(AddressBookLabelModel, connection)
  }
}
