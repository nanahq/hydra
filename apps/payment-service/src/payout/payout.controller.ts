import { PayoutOverview, QUEUE_MESSAGE, ResponseWithStatus, RmqService, ServicePayload, VendorPayout } from '@app/common'
import { Controller } from '@nestjs/common'
import { VendorPayoutService } from './payout.service'
import { Ctx, MessagePattern, Payload, RmqContext, RpcException } from '@nestjs/microservices'

@Controller('wallet/vendor')
export class VendorPayoutController {
  constructor (
    private readonly payoutService: VendorPayoutService,
    private readonly rmqService: RmqService

  ) {}

  @MessagePattern(QUEUE_MESSAGE.WALLET_GET_PAYOUT_VENDOR)
  async getVendorPayout (
    @Payload() { vendorId }: { vendorId: string },
      @Ctx() context: RmqContext
  ): Promise<VendorPayout[]> {
    try {
      return await this.payoutService.getVendorPayout(vendorId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.WALLET_GET_PAYOUT_ALL)
  async getAllPayout (
    @Ctx() context: RmqContext
  ): Promise<VendorPayout[]> {
    try {
      return await this.payoutService.getAllPayout()
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.WALLET_UPDATE_PAYOUT)
  async updatePayoutStatus (
    @Payload() { refId }: { refId: number },
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return await this.payoutService.updatePayoutStatus(refId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.WALLET_CREATE_PAYOUT)
  async createPayout (
    @Payload() { userId, data }: ServicePayload<Partial<VendorPayout>>,
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    const payload = {
      ...data,
      vendor: userId
    }
    try {
      return await this.payoutService.createPayout(payload)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.WALLET_PAYOUT_OVERVIEW)
  async payoutOverview (
    @Payload() { vendorId }: { vendorId: string },
      @Ctx() context: RmqContext
  ): Promise<PayoutOverview> {
    console.log(vendorId)
    try {
      return await this.payoutService.payoutOverview(vendorId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }
}
