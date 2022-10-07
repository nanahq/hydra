import { Controller } from '@nestjs/common'
import { AdminServiceService } from './admin-service.service'
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
  RpcException
} from '@nestjs/microservices'
import { QUEUE_MESSAGE, RmqService } from '@app/common'
import { ServicePayload } from '@app/common/typings/ServicePayload.interface'
import { RegisterAdminDTO } from '@app/common/dto/registerAdminDTO.dto'
import { AdminEntity } from '@app/common/database/entities/Admin'
import { UpdateAdminLevelRequestDto } from '@app/common/dto/updateAdminLevelRequest.dto'

@Controller()
export class AdminServiceController {
  constructor (
    private readonly adminServiceService: AdminServiceService,
    private readonly rmqService: RmqService
  ) {}

  @MessagePattern(QUEUE_MESSAGE.CREATE_ADMIN)
  async createAdmin (
    @Payload() { data }: ServicePayload<RegisterAdminDTO>,
      @Ctx() context: RmqContext
  ): Promise<{ status: number }> {
    try {
      return await this.adminServiceService.createAdmin(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_ADMIN_LOCAL)
  async getAdminWithPassword (
    @Payload() { data }: ServicePayload<{ userName: string, password: string }>,
      @Ctx() context: RmqContext
  ): Promise<Partial<AdminEntity>> {
    try {
      return await this.adminServiceService.validateAdminWithPassword(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_ADMIN_JWT)
  async getAdminWithId (
    @Payload() { userId }: ServicePayload<null>,
      @Ctx() context: RmqContext
  ): Promise<AdminEntity> {
    try {
      return await this.adminServiceService.validateAdminWithId(userId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.UPDATE_ADMIN_STATUS)
  async updateAdminLevel (
    @Payload() { data }: ServicePayload<UpdateAdminLevelRequestDto>,
      @Ctx() context: RmqContext
  ): Promise<{ status: number }> {
    try {
      return await this.adminServiceService.changeAdminAccess(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.DELETE_ADMIN)
  async deleteAdminProfile (
    @Payload() { userId }: ServicePayload<null>,
      @Ctx() context: RmqContext
  ): Promise<{ status: number }> {
    try {
      return await this.adminServiceService.deleteAdminProfile(userId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }
}
