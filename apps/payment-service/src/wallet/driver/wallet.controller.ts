import { Controller, UseFilters } from '@nestjs/common'
import {
  DriverWalletI,
  DriverWalletTransactionI,
  ExceptionFilterRpc,
  QUEUE_MESSAGE,
  ResponseWithStatus,
  RmqService
} from '@app/common'
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
  RpcException
} from '@nestjs/microservices'
import {
  createTransaction,
  CreditWallet,
  DebitWallet,
  UpdateTransaction
} from '@app/common/dto/General.dto'
import { DriverWalletService } from './wallet.service'
import { FilterQuery } from 'mongoose'
import { DriverWalletTransaction } from '@app/common/database/schemas/driver-wallet-transactions.schema'

@UseFilters(new ExceptionFilterRpc())
@Controller()
export class DriverWalletController {
  constructor (
    private readonly rmqService: RmqService,
    private readonly walletService: DriverWalletService
  ) {}

  @MessagePattern(QUEUE_MESSAGE.DRIVER_WALLET_ADD_BALANCE)
  public async creditBalance (
    @Payload() data: CreditWallet,
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return await this.walletService.creditWallet(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.DRIVER_WALLET_DEDUCT_BALANCE)
  public async debitBalance (
    @Payload() data: DebitWallet,
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return await this.walletService.debitWallet(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.DRIVER_WALLET_FETCH)
  public async fetchWallet (
    @Payload() { driverId }: { driverId: string },
      @Ctx() context: RmqContext
  ): Promise<DriverWalletI> {
    try {
      return await this.walletService.fetchWallet(driverId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.DRIVER_WALLET_FETCH_TRANSACTIONS)
  public async fetchAllTransactions (
    @Payload() filter: FilterQuery<DriverWalletTransaction>,
      @Ctx() context: RmqContext
  ): Promise<DriverWalletTransactionI[]> {
    try {
      return await this.walletService.fetchAllTransactions(filter)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.DRIVER_WALLET_FETCH_SINGLE_TRANSACTION)
  public async fetchSingleTransaction (
    @Payload() { txId }: { txId: string },
      @Ctx() context: RmqContext
  ): Promise<DriverWalletTransactionI> {
    try {
      return await this.walletService.fetchSingleTransaction(txId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.DRIVER_WALLET_CREATE_TRANSACTION)
  public async createTransaction (
    @Payload() data: createTransaction,
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return await this.walletService.createTransaction(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @EventPattern(QUEUE_MESSAGE.DRIVER_WALLET_CREATE_WALLET)
  public async createWallet (
    @Payload() { driverId }: { driverId: string },
      @Ctx() context: RmqContext
  ): Promise<void> {
    try {
      return await this.walletService.createWallet(driverId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.DRIVER_WALLET_UPDATE_TRANSACTION)
  public async updateTransaction (
    @Payload() data: UpdateTransaction,
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return await this.walletService.updateTransactionStatus(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }
}
