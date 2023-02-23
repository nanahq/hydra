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
  ListingMenu,
  ListingCategory,
  ListingOptionGroup
} from '@app/common'
import { CreateListingCategoryDto, CreateListingMenuDto, CreateOptionGroupDto, UpdateListingCategoryDto, UpdateOptionGroupDto } from '@app/common/database/dto/listing.dto'

@UseFilters(new ExceptionFilterRpc())
@Controller()
export class ListingsServiceController {
  constructor (
    private readonly listingService: ListingsService,
    private readonly rmqService: RmqService
  ) {}

  @MessagePattern(QUEUE_MESSAGE.GET__ALL_LISTING_MENU)
  async getAllListings (
    @Ctx() context: RmqContext,
      @Payload() { userId }: ServicePayload<null>
  ): Promise<ListingMenu[]> {
    try {
      return await this.listingService.getAllListingMenu(userId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.CREATE_LISTING)
  async createListing (
    @Payload() payload: ServicePayload<CreateListingMenuDto>,
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return await this.listingService.createListingMenu(payload)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_LISTING_MENU)
  async getListingMenu (
    @Payload() data: ServicePayload<string>,
      @Ctx() context: RmqContext
  ): Promise<ListingMenu> {
    try {
      return await this.listingService.getSingleListingMenu(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.CREATE_LISTING_CAT)
  async createListingCategory (
    @Payload() data: ServicePayload<CreateListingCategoryDto>,
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return await this.listingService.createListingCategory(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_LISTING_CAT)
  async getSingleListingCat (
    @Payload() data: ServicePayload<string>,
      @Ctx() context: RmqContext
  ): Promise<ListingCategory> {
    try {
      return await this.listingService.getSingleListingCat(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_ALL_LISTING_CAT)
  async getAllCatVendor (
    @Payload() data: ServicePayload<null>,
      @Ctx() context: RmqContext
  ): Promise<ListingCategory[]> {
    try {
      return await this.listingService.getAllCatVendor(data.userId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.UPDATE_LISTING_CAT)
  async updateListingCategory (
    @Payload() { data }: ServicePayload<UpdateListingCategoryDto>,
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return await this.listingService.updateListingCat(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.CREATE_LISTING_OP)
  async createListingOption (
    @Payload() data: ServicePayload<CreateOptionGroupDto>,
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return await this.listingService.createListingOptionGroup(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_LISTING_OP)
  async getSingleListingOption (
    @Payload() data: ServicePayload<string>,
      @Ctx() context: RmqContext
  ): Promise<ListingOptionGroup> {
    try {
      return await this.listingService.getSingleListingOption(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_ALL_LISTING_OP)
  async getAllOptionVendor (
    @Payload() data: ServicePayload<null>,
      @Ctx() context: RmqContext
  ): Promise<ListingOptionGroup[]> {
    try {
      return await this.listingService.getAllListingOptionsVendor(data.userId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.UPDATE_LISTING_OP)
  async updateListingOption (
    @Payload() { data }: ServicePayload<UpdateOptionGroupDto>,
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return await this.listingService.updateListingOption(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.CREATE_LISTING_MENU)
  async createListingMenu (
    @Payload() data: ServicePayload<any>,
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      console.log('Hello world')
      return await this.listingService.createListingMenu(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }
}
