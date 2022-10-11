import { RmqService } from '@app/common'
import { QUEUE_MESSAGE } from '@app/common/typings/QUEUE_MESSAGE'
import { Controller, UseFilters } from '@nestjs/common'
import { Ctx, MessagePattern, Payload, RmqContext, RpcException } from '@nestjs/microservices'
import { ListingsServiceService } from './listings-service.service'

import { ExceptionFilterRpc } from '@app/common/filters/rpc.expection'
import { ListingEntity } from '@app/common/database/entities/Listing'

@UseFilters(new ExceptionFilterRpc())
@Controller()
export class ListingsServiceController {
  constructor (
    private readonly listingService: ListingsServiceService,
    private readonly rmqService: RmqService
  ) {
  }

  @MessagePattern(QUEUE_MESSAGE.GET_ALL_LISTINGS)
  async getAllListings (@Ctx() context: RmqContext): Promise<ListingEntity[]> {
    try {
      return await this.listingService.getAllListings()
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
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
