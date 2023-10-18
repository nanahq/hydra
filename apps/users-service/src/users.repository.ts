import { Injectable, Logger } from '@nestjs/common'
import { AbstractRepository, User } from '@app/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

@Injectable()
export class UserRepository extends AbstractRepository<User> {
  protected readonly logger = new Logger(UserRepository.name)

  constructor (@InjectModel(User.name) UserModel: Model<User>) {
    super(UserModel)
  }
}
