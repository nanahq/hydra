import {
  FleetPayout,
  QUEUE_MESSAGE,
  RmqService

} from '@app/common'
import { Controller } from '@nestjs/common'
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
  RpcException
} from '@nestjs/microservices'
import { FleetPayoutService } from './fleets-payout.service'

@Controller()
export class FleetPayoutController {
  constructor (
    private readonly fleetPayoutService: FleetPayoutService,
    private readonly rmqService: RmqService
  ) {}

  @MessagePattern(QUEUE_MESSAGE.FLEET_GET_PAYOUT_DRIVER)
  async getDrivePayout (
    @Payload() { driverId }: { driverId: string },
      @Ctx() context: RmqContext
  ): Promise<FleetPayout[]> {
    try {
      return await this.fleetPayoutService.getDriverPayout(driverId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.FLEET_GET_ALL_PAYOUTS)
  async getAllDriversPayout (
    @Payload() { organization }: { organization: string },
      @Ctx() context: RmqContext
  ): Promise<FleetPayout[]> {
    try {
      return await this.fleetPayoutService.getAllDriversPayout(organization)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }
}
