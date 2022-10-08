import { loginUserRequest, RmqService, TokenPayload } from '@app/common'
import { QUEUE_MESSAGE } from '@app/common/typings/QUEUE_MESSAGE'
import { Controller, UseFilters } from '@nestjs/common'
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
  RpcException
} from '@nestjs/microservices'
import { UpdateUserStateResponse } from './interface'
import { VendorsService } from './vendors.service'

import { ExceptionFilterRpc } from '@app/common/filters/rpc.expection'
import { updateVendorStatus } from '@app/common/dto/UpdateVendorStatus.dto'
import { VendorEntity } from '@app/common/database/entities/Vendor'
import { ServicePayload } from '@app/common/typings/ServicePayload.interface'
@UseFilters(new ExceptionFilterRpc())
@Controller()
export class VendorsController {
  constructor (
    private readonly vendorsService: VendorsService,
    private readonly rmqService: RmqService
  ) {}

  @MessagePattern(QUEUE_MESSAGE.CREATE_VENDOR)
  async registerNewUser (
    @Payload() data: any,
      @Ctx() context: RmqContext
  ): Promise<string> {
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
    @Payload() data: updateVendorStatus,
      @Ctx() ctx: RmqContext
  ): Promise<UpdateUserStateResponse> {
    this.rmqService.ack(ctx)
    try {
      return await this.vendorsService.updateVendorStatus(data)
    } catch (error) {
      throw new RpcException(error)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_VENDOR_LOCAL)
  async getUserByPhone (
    @Payload() data: loginUserRequest,
      @Ctx() context: RmqContext
  ): Promise<VendorEntity> {
    try {
      this.rmqService.ack(context)
      return await this.vendorsService.validateVendor(data)
    } catch (error) {
      throw new RpcException(error)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_VENDOR_JWT)
  async getUserById (
    @Payload() data: TokenPayload,
      @Ctx() context: RmqContext
  ): Promise<VendorEntity> {
    try {
      this.rmqService.ack(context)
      return await this.vendorsService.getVendor(data)
    } catch (error) {
      throw new RpcException(error)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.UPDATE_VENDOR_PROFILE)
  async updateVendorProfile (
    @Payload() data: ServicePayload<Partial<VendorEntity>>,
      @Ctx() context: RmqContext
  ): Promise<string> {
    try {
      this.rmqService.ack(context)
      return await this.vendorsService.updateVendorProfile(data)
    } catch (error) {
      throw new RpcException(error)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.DELETE_VENDOR_PROFILE)
  async deleteVendorProfile (
    @Payload() data: ServicePayload<null>,
      @Ctx() context: RmqContext
  ): Promise<{ status: number }> {
    try {
      return await this.vendorsService.deleteVendorProfile(data.userId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_VENDOR)
  async  getSingleVendor(
      @Payload() {vendorId}: {vendorId: string},
      @Ctx() context: RmqContext
  ): Promise<VendorEntity> {
    try {
      return await this.vendorsService.getVendor({userId: vendorId})
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_ALL_VENDORS)
  async  getAllVendors(
      @Ctx() context: RmqContext
  ): Promise<VendorEntity[]> {
    try {
      return await this.vendorsService.getAllVendors()
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }
}
