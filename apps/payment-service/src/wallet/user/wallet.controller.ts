import { Controller, UseFilters } from '@nestjs/common'
import { ExceptionFilterRpc, QUEUE_MESSAGE, registerUserRequest, RmqService } from '@app/common'
import { UserWalletService } from './wallet.service'
import { Ctx, EventPattern, Payload, RmqContext, RpcException } from '@nestjs/microservices'

@UseFilters(new ExceptionFilterRpc())
@Controller()
export class UserWalletController {
  constructor (
    private readonly rmqService: RmqService,
    private readonly userWalletService: UserWalletService
  ) {}

  @EventPattern(QUEUE_MESSAGE.USER_WALLET_ACCOUNT_CREATED)
  public async createPaystackInstances (
    @Payload() data: Omit<registerUserRequest, 'password'>,
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
}
