import { Injectable, Logger } from '@nestjs/common'
import { AbstractRepository } from '@app/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { DriverWallet } from '@app/common/database/schemas/driver-wallet.schema'
import { DriverWalletTransaction } from '@app/common/database/schemas/driver-wallet-transactions.schema'

@Injectable()
export class DriverWalletRepository extends AbstractRepository<DriverWallet> {
  protected readonly logger = new Logger(DriverWallet.name)

  constructor (
  @InjectModel(DriverWallet.name) payoutModel: Model<DriverWallet>
  ) {
    super(payoutModel)
  }
}

@Injectable()
export class DriverWalletTransactionRepository extends AbstractRepository<DriverWalletTransaction> {
  protected readonly logger = new Logger(DriverWalletTransaction.name)

  constructor (
  @InjectModel(DriverWalletTransaction.name)
    payoutModel: Model<DriverWalletTransaction>
  ) {
    super(payoutModel)
  }
}
