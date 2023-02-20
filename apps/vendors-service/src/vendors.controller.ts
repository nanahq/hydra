import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
  RpcException
} from '@nestjs/microservices'
import { Controller, UseFilters } from '@nestjs/common'

import {
  RmqService,
  TokenPayload,
  QUEUE_MESSAGE,
  ExceptionFilterRpc,
  ServicePayload,
  ResponseWithStatus,
  LoginVendorRequest,
  UpdateVendorStatus
} from '@app/common'
import { VendorsService } from './vendors.service'
import { Vendor } from '@app/common/database/schemas/vendor.schema'
import {
  UpdateVendorSettingsDto,
  VendorUserI
} from '@app/common/database/dto/vendor.dto'
import { VendorSettings } from '@app/common/database/schemas/vendor-settings.schema'

@UseFilters(new ExceptionFilterRpc())
@Controller()
export class VendorsController {
  constructor (
    private readonly vendorsService: VendorsService,
    private readonly rmqService: RmqService
  ) {}

  @MessagePattern(QUEUE_MESSAGE.CREATE_VENDOR)
  async registerNewVendor (
    @Payload() data: any,
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
  async getUserByPhone (
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
  async getUserById (
    @Payload() data: TokenPayload,
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

  @MessagePattern(QUEUE_MESSAGE.GET_VENDOR)
  async getSingleVendor (
    @Payload() { data }: ServicePayload<string>,
      @Ctx() context: RmqContext
  ): Promise<Vendor> {
    try {
      return await this.vendorsService.getVendor({ userId: data })
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_ALL_VENDORS)
  async getAllVendors (@Ctx() context: RmqContext): Promise<Vendor[]> {
    try {
      return await this.vendorsService.getAllVendors()
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_ALL_VENDORS_USERS)
  async getAllVendorsUser (@Ctx() context: RmqContext): Promise<VendorUserI[]> {
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
}
