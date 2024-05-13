import {
  Ctx, EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
  RpcException
} from '@nestjs/microservices'
import { Controller, UseFilters } from '@nestjs/common'

import {
  CreateVendorDto,
  ExceptionFilterRpc,
  LocationCoordinates,
  LoginVendorRequest,
  MultiPurposeServicePayload,
  QUEUE_MESSAGE,
  ResponseWithStatus,
  RmqService,
  ServicePayload,
  UpdateVendorStatus,
  VendorI,
  VendorServiceHomePageResult,
  VendorStatI,
  VendorWithListingsI
} from '@app/common'
import { VendorsService } from './vendors.service'
import { Vendor } from '@app/common/database/schemas/vendor.schema'
import { UpdateVendorSettingsDto } from '@app/common/database/dto/vendor.dto'
import { VendorSettings } from '@app/common/database/schemas/vendor-settings.schema'
import { ReasonDto } from '@app/common/database/dto/reason.dto'
import { UpdateVendorReviewDto } from '@app/common/dto/General.dto'

@UseFilters(new ExceptionFilterRpc())
@Controller()
export class VendorsController {
  constructor (
    private readonly vendorsService: VendorsService,
    private readonly rmqService: RmqService
  ) {}

  @MessagePattern(QUEUE_MESSAGE.CREATE_VENDOR)
  async registerNewVendor (
    @Payload() data: CreateVendorDto,
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return await this.vendorsService.register(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.UPDATE_VENDOR_STATUS)
  async updateVendorStatus (
    @Payload() data: UpdateVendorStatus,
      @Ctx() ctx: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return await this.vendorsService.updateVendorStatus(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(ctx)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_VENDOR_LOCAL)
  async getVendorByEmail (
    @Payload() data: LoginVendorRequest,
      @Ctx() context: RmqContext
  ): Promise<Vendor> {
    try {
      return await this.vendorsService.validateVendor(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_VENDOR_JWT)
  async getVendorById (
    @Payload() data: string,
      @Ctx() context: RmqContext
  ): Promise<Vendor> {
    try {
      this.rmqService.ack(context)
      return await this.vendorsService.getVendor(data)
    } catch (error) {
      throw new RpcException(error)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.UPDATE_VENDOR_PROFILE)
  async updateVendorProfile (
    @Payload() data: ServicePayload<Partial<Vendor>>,
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return await this.vendorsService.updateVendorProfile(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.DELETE_VENDOR_PROFILE)
  async deleteVendorProfile (
    @Payload() data: ServicePayload<null>,
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return await this.vendorsService.deleteVendorProfile(data.userId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.VENDOR_APPROVE)
  async approve (
    @Payload() data: ServicePayload<null>,
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return await this.vendorsService.approve(data.userId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.VENDOR_DISAPPROVE)
  async disapprove (
    @Payload() data: ServicePayload<ReasonDto>,
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return await this.vendorsService.disapprove(
        data.userId,
        data.data.reason
      )
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_VENDOR)
  async getSingleVendor (
    @Payload() { data }: ServicePayload<string>,
      @Ctx() context: RmqContext
  ): Promise<Vendor> {
    try {
      return await this.vendorsService.getVendor(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_ALL_VENDORS)
  async getAllVendors (@Ctx() context: RmqContext): Promise<VendorI[]> {
    try {
      return await this.vendorsService.getAllVendors()
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.ADMIN_DASHBOARD_VENDOR_METRICS)
  async adminAggregates (@Ctx() context: RmqContext): Promise<VendorStatI> {
    try {
      return await this.vendorsService.adminMetrics()
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_ALL_VENDORS_USERS)
  async getAllVendorsUser (@Ctx() context: RmqContext): Promise<VendorI[]> {
    try {
      return await this.vendorsService.getAllVendorsUser()
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.UPDATE_VENDOR_SETTING)
  async updateVendorSettings (
    @Payload() data: ServicePayload<UpdateVendorSettingsDto>,
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return await this.vendorsService.updateSettings(data.data, data.userId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_VENDOR_SETTINGS)
  async getVendorSettings (
    @Payload() data: ServicePayload<null>,
      @Ctx() context: RmqContext
  ): Promise<VendorSettings> {
    try {
      return await this.vendorsService.getVendorSettings(data.userId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.CREATE_VENDOR_SETTINGS)
  async createVendorSettings (
    @Payload() data: ServicePayload<UpdateVendorSettingsDto>,
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return await this.vendorsService.createVendorSettings(
        data.data,
        data.userId
      )
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.UPDATE_VENDOR_LOGO)
  async updateVendorLogo (
    @Payload() data: ServicePayload<string>,
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      await this.vendorsService.updateVendorLogo(data.data, data.userId)
      return { status: 1 }
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.UPDATE_VENDOR_IMAGE)
  async updateVendorImage (
    @Payload() data: ServicePayload<string>,
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      await this.vendorsService.updateVendorImage(data.data, data.userId)
      return { status: 1 }
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_NEAREST_VENDORS)
  async getNearestVendors (
    @Payload()
      {
        data: { userLocation }
      }: ServicePayload<{ userLocation: LocationCoordinates }>,
      @Ctx() context: RmqContext
  ): Promise<Vendor[]> {
    try {
      return await this.vendorsService.getNearestVendors(userLocation)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_VENDOR_HOMEPAGE)
  async getHomepageData (
    @Ctx() context: RmqContext
  ): Promise<VendorServiceHomePageResult> {
    try {
      return await this.vendorsService.getVendorsForHomepage()
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @EventPattern(QUEUE_MESSAGE.UPDATE_VENDOR_REVIEW)
  async updateVendorReview (
    @Payload() data: UpdateVendorReviewDto,
      @Ctx() context: RmqContext
  ): Promise<void> {
    try {
      return await this.vendorsService.updateVendorReview(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_VENDOR_WEBPAGE_LISTING)
  async getVendorsListingPage (
    @Payload() payload: MultiPurposeServicePayload<{ friendlyId: string }>,
      @Ctx() context: RmqContext
  ): Promise<VendorWithListingsI> {
    try {
      return await this.vendorsService.getVendorsListingsPage(payload.data.friendlyId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }
}
