import { AbstractRepository } from '@app/common/database/abstract.repository'
import { Injectable } from '@nestjs/common'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Connection, Model } from 'mongoose'
import { User } from './schema'

@Injectable()
export class UsersRepository extends AbstractRepository<User> {
  constructor (
  @InjectModel(User.name) userModel: Model<User>,
    @InjectConnection() connection: Connection
  ) {
    super(userModel, connection)
  }
}
