import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import {
  DriverWalletRepository,
  DriverWalletTransactionRepository
} from './wallet.repository'
import {
  DriverWalletI,
  DriverWalletTransactionI,
  FitRpcException,
  RandomGen,
  ResponseWithStatus,
  WalletTransactionStatus,
  WalletTransactionType
} from '@app/common'
import {
  createTransaction,
  CreditWallet,
  DebitWallet,
  UpdateTransaction
} from '@app/common/dto/General.dto'
import { DriverWallet } from '@app/common/database/schemas/driver-wallet.schema'
import { DriverWalletTransaction } from '@app/common/database/schemas/driver-wallet-transactions.schema'
import { FilterQuery } from 'mongoose'

@Injectable()
export class DriverWalletService {
  private readonly logger = new Logger(DriverWalletService.name)
  constructor (
    private readonly driverWalletRepository: DriverWalletRepository,
    private readonly driverWalletTransactionRepository: DriverWalletTransactionRepository
  ) {}

  private async createTransactionCommon (
    payload: createTransaction,
    txType: WalletTransactionType,
    createTransaction: boolean
  ): Promise<DriverWallet> {
    const wallet = await this.driverWalletRepository.findOne({
      driver: payload.driver
    })
    if (wallet == null) {
      throw new FitRpcException(
        'Driver does not have a wallet',
        HttpStatus.BAD_REQUEST
      )
    }

    if (!createTransaction) {
      return wallet
    }

    const canTransact = this.balanceCheck(
      wallet.balance,
      payload.amount,
      payload.type
    )

    if (!canTransact) {
      throw new FitRpcException('Insufficient balance!', HttpStatus.FORBIDDEN)
    }
    const transaction = await this.driverWalletTransactionRepository.create({
      driver: payload.driver,
      transaction: payload.transaction,
      wallet: wallet._id.toString(),
      amount: payload.amount,
      refid: RandomGen.genRandomNum(),
      txType,
      status: payload.status ?? WalletTransactionStatus.PENDING
    })

    const txId = transaction._id.toString()
    const txIds = [...wallet.transactions, txId]

    await this.driverWalletRepository.findOneAndUpdate(
      { driver: payload.driver },
      { transactions: txIds }
    )

    return wallet
  }

  public async creditWallet (
    payload: CreditWallet
  ): Promise<ResponseWithStatus> {
    try {
      const wallet = (await this.createTransactionCommon(
        payload as any,
        'CREDIT',
        payload.withTransaction
      )) as any

      const amountToCredit = Number(wallet.balance) + payload.amount

      await this.driverWalletRepository.findOneAndUpdate(
        { driver: payload.driver },
        { balance: amountToCredit }
      )

      return { status: 1 }
    } catch (error) {
      this.logger.error(JSON.stringify(error))
      throw new FitRpcException(error, HttpStatus.BAD_REQUEST)
    }
  }

  public async debitWallet (payload: DebitWallet): Promise<ResponseWithStatus> {
    try {
      const wallet = (await this.createTransactionCommon(
        payload as any,
        'DEBIT',
        payload.withTransaction
      )) as any
      const amountToDebit = Number(wallet.balance) - payload.amount

      await this.driverWalletRepository.findOneAndUpdate(
        { driver: payload.driver },
        { balance: amountToDebit }
      )

      return { status: 1 }
    } catch (error) {
      throw new FitRpcException(error, HttpStatus.BAD_REQUEST)
    }
  }

  public async fetchWallet (driver: string): Promise<DriverWalletI> {
    try {
      return await this.driverWalletRepository.findOneAndPopulate<DriverWalletI>(
        { driver },
        ['transactions']
      )
    } catch (error) {
      throw new FitRpcException(
        'failed to fetch wallet',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async fetchSingleTransaction (
    txId: string
  ): Promise<DriverWalletTransactionI> {
    try {
      return await this.driverWalletTransactionRepository.findOneAndPopulate<DriverWalletTransactionI>(
        { _id: txId },
        ['wallet', 'driver']
      )
    } catch (error) {
      throw new FitRpcException(
        'failed to fetch transaction',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async fetchAllTransactions (
    filter: FilterQuery<DriverWalletTransaction>
  ): Promise<DriverWalletTransactionI[]> {
    try {
      return await this.driverWalletTransactionRepository.findAndPopulate<DriverWalletTransactionI>(
        filter,
        ['wallet', 'driver']
      )
    } catch (error) {
      console.log(error)
      throw new FitRpcException(
        'failed to fetch transactions',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async createTransaction (
    payload: createTransaction
  ): Promise<ResponseWithStatus> {
    try {
      const wallet = await this.driverWalletRepository.findOne({
        driver: payload.driver
      })

      if (wallet == null) {
        throw new Error('Can not find wallet with that ID')
      }

      const transaction = await this.driverWalletTransactionRepository.create({
        driver: payload.driver.toString(),
        transaction: payload.transaction,
        wallet: wallet._id.toString(),
        amount: payload.amount,
        refid: RandomGen.genRandomNum(),
        txType: payload.type,
        status: payload.status ?? WalletTransactionStatus.PENDING
      })

      let newBalance = wallet.balance as number

      if (payload.type === 'CREDIT') {
        newBalance = newBalance + payload.amount
      } else {
        newBalance = newBalance - payload.amount
      }

      const txIds = [...wallet.transactions, transaction._id.toString()]

      await this.driverWalletRepository.findOneAndUpdate(
        {
          driver: payload.driver.toString()
        },
        {
          transactions: txIds,
          balance: newBalance
        }
      )

      return { status: 1 }
    } catch (error) {
      throw new FitRpcException(
        'failed to create transactions',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async createWallet (driverId: string): Promise<void> {
    try {
      await this.driverWalletRepository.create({
        driver: driverId,
        balance: 0,
        transactions: [],
        logs: []
      })
    } catch (error) {
      throw new FitRpcException(
        'failed to create wallet',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async updateTransactionStatus (
    payload: UpdateTransaction
  ): Promise<ResponseWithStatus> {
    await this.driverWalletTransactionRepository.findOneAndUpdate(
      { _id: payload.txId },
      { status: payload.status }
    )

    return { status: 1 }
  }

  private balanceCheck (
    balance: number,
    amount: number,
    txType: WalletTransactionType
  ): boolean {
    if (txType === 'CREDIT') {
      return true
    }

    return balance >= amount
  }

  async ping (): Promise<string> {
    return 'PONG'
  }
}
