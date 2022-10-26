import { Controller, UseFilters } from '@nestjs/common'
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
  RpcException
} from '@nestjs/microservices'

import { ListingsService } from './listings-service.service'
import {
  ResponseWithStatus,
  RmqService,
  ServicePayload,
  QUEUE_MESSAGE,
  ExceptionFilterRpc,
  ListingEntity,
  ListingDto
} from '@app/common'

@UseFilters(new ExceptionFilterRpc())
@Controller()
export class ListingsServiceController {
  constructor (
    private readonly listingService: ListingsService,
    private readonly rmqService: RmqService
  ) {}

  @MessagePattern(QUEUE_MESSAGE.GET_ALL_LISTINGS)
  async getAllListings (
    @Ctx() context: RmqContext,
      @Payload() { userId }: ServicePayload<null>
  ): Promise<ListingEntity[]> {
    try {
      return await this.listingService.getAllListings(userId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_ALL_LISTING_ADMIN)
  async getAllListingInDB (
    @Ctx() context: RmqContext
  ): Promise<ListingEntity[]> {
    try {
      return await this.listingService.getAllDbListing()
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_LISTING_INFO)
  async getListingInfo (
    @Payload()
      { userId, data: { listingId } }: ServicePayload<{ listingId: string }>,
      @Ctx() context: RmqContext
  ): Promise<ListingEntity> {
    try {
      return await this.listingService.getListing({
        listingId
      })
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.DELETE_LISTING)
  async deleteListing (
    @Payload() payload: ServicePayload<{ listingId: string }>,
      @Ctx() context: RmqContext
  ): Promise<{ status: number }> {
    try {
      return await this.listingService.deleteListing(payload)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.CREATE_LISTING)
  async createListing (
    @Payload() payload: ServicePayload<ListingDto>,
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return await this.listingService.create(payload)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.UPDATE_LISTING)
  async updateListing (
    @Payload() data: ServicePayload<Partial<ListingEntity>>,
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return await this.listingService.update(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }
}
