import { Controller, UseFilters } from '@nestjs/common'
import {
  ExceptionFilterRpc,
  MultiPurposeServicePayload,
  QUEUE_MESSAGE,
  registerUserRequest,
  RmqService
} from '@app/common'
import { UserWalletService } from './wallet.service'
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
  RpcException
} from '@nestjs/microservices'
import { DebitUserWallet } from '@app/common/dto/General.dto'

@UseFilters(new ExceptionFilterRpc())
@Controller()
export class UserWalletController {
  constructor (
    private readonly rmqService: RmqService,
    private readonly userWalletService: UserWalletService
  ) {}

  @EventPattern(QUEUE_MESSAGE.USER_WALLET_ACCOUNT_CREATED)
  public async createPaystackInstances (
    @Payload() data: MultiPurposeServicePayload<Omit<registerUserRequest, 'password'>>,
      @Ctx() context: RmqContext
  ): Promise<void> {
    try {
      return this.userWalletService.createPaystackInstances(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.USER_WALLET_DEDUCT_BALANCE)
  public async debitBalance (
    @Payload() { data }: MultiPurposeServicePayload<DebitUserWallet>,
      @Ctx() context: RmqContext
  ): Promise<{ status: number, reminder: number }> {
    try {
      return await this.userWalletService.debitUserWallet(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }
}
