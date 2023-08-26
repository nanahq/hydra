import { Injectable, Logger } from '@nestjs/common'
import { AbstractRepository } from '@app/common'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Connection, Model } from 'mongoose'
import { AddressBook } from '@app/common/database/schemas/address.book.schema'

@Injectable()
export class AddressBookRepository extends AbstractRepository<AddressBook> {
  protected readonly logger = new Logger(AddressBookRepository.name)

  constructor (
  @InjectModel(AddressBook.name) AddressBookModel: Model<AddressBook>,
    @InjectConnection() connection: Connection
  ) {
    super(AddressBookModel, connection)
  }
}
