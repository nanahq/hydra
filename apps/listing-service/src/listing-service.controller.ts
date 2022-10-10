import { RmqService } from '@app/common'
import { QUEUE_MESSAGE } from '@app/common/typings/QUEUE_MESSAGE'
import { Controller, UseFilters } from '@nestjs/common'
import { Ctx, MessagePattern, Payload, RmqContext, RpcException } from '@nestjs/microservices'
import { ListingServiceService } from './listing-service.service'

import { ExceptionFilterRpc } from '@app/common/filters/rpc.expection'

@UseFilters(new ExceptionFilterRpc())
@Controller()
export class ListingServiceController {
  constructor (
    private readonly listingService: ListingServiceService,
    private readonly rmqService: RmqService
  ) {
  }

  @MessagePattern(QUEUE_MESSAGE.GET_LISTINGS)
  async getListings (
    @Payload() data: any,
      @Ctx() context: RmqContext
  ): Promise<Object> {
    return { name: 'Ahmard' }
  }

  @MessagePattern(QUEUE_MESSAGE.CREATE_LISTING)
  async createListing (
    @Payload() data: any,
      @Ctx() context: RmqContext
  ): Promise<string> {
    try {
      return await this.listingService.create(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }
}
