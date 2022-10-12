import { ResponseWithStatus, RmqService } from '@app/common'
import { QUEUE_MESSAGE } from '@app/common/typings/QUEUE_MESSAGE'
import { Controller, UseFilters } from '@nestjs/common'
import { Ctx, MessagePattern, Payload, RmqContext, RpcException } from '@nestjs/microservices'
import { ListingsServiceService } from './listings-service.service'

import { ExceptionFilterRpc } from '@app/common/filters/rpc.expection'
import { ListingEntity } from '@app/common/database/entities/Listing'
import { ListingDto } from '@app/common/database/dto/listing.dto'

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

  @MessagePattern(QUEUE_MESSAGE.GET_LISTING_INFO)
  async getListingInfo (
    @Payload() { listingId }: { listingId: string },
      @Ctx() context: RmqContext
  ): Promise<ListingEntity> {
    try {
      return await this.listingService.getListing({ listingId })
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.DELETE_LISTING)
  async deleteListing (
    @Payload() { listingId }: { listingId: string },
      @Ctx() context: RmqContext
  ): Promise<{ status: number }> {
    try {
      return await this.listingService.deleteListing(listingId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.CREATE_LISTING)
  async createListing (
    @Payload() data: ListingDto,
      @Ctx() context: RmqContext
  ): Promise<string> {
    try {
      return await this.listingService.create('2', data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.UPDATE_LISTING)
  async updateListing (
    @Payload() data: Partial<ListingEntity>,
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
