import { Controller } from '@nestjs/common'
import { DriversServiceService } from '../drivers-service.service'
import { ODSA } from './odsa.service'
import { Ctx, MessagePattern, Payload, RmqContext, RpcException } from '@nestjs/microservices'
import { QUEUE_MESSAGE, RmqService } from '@app/common'

/**
 * Order Delivery Sorting and Assignation (ODSA) Service.
 * This handles delivery assignation and sorting for both pre and on-demand orders.
 */
@Controller()
export class OdsaController {
  constructor (
    private readonly driversService: DriversServiceService,
    private readonly odsa: ODSA,

    private readonly rmqService: RmqService
  ) {}

  @MessagePattern(QUEUE_MESSAGE.ODSA_PROCESS_ORDER)
  async processIncomingOrder (
    @Payload() { orderId }: { orderId: string },
      @Ctx() context: RmqContext
  ): Promise<any> {
    try {
      return await this.odsa.handleProcessOrder(orderId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }
}
