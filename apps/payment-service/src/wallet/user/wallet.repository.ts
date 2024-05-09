import { Injectable, Logger } from '@nestjs/common'
import { AbstractRepository } from '@app/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { UserWallet } from '@app/common/database/schemas/user-wallet.schema'

@Injectable()
export class UserWalletRepository extends AbstractRepository<UserWallet> {
  protected readonly logger = new Logger(UserWallet.name)

  constructor (
  @InjectModel(UserWallet.name) userWalletModel: Model<UserWallet>
  ) {
    super(userWalletModel)
  }
}
