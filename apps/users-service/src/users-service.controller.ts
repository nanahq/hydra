import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
  RpcException
} from '@nestjs/microservices'
import { Controller, UseFilters } from '@nestjs/common'

import {
  loginUserRequest,
  RmqService,
  TokenPayload,
  UserEntity,
  verifyPhoneRequest,
  QUEUE_MESSAGE,
  ExceptionFilterRpc,
  ServicePayload,
  ResponseWithStatus
} from '@app/common'
import { UsersService } from './users-service.service'

@UseFilters(new ExceptionFilterRpc())
@Controller()
export class UsersServiceController {
  constructor (
    private readonly usersService: UsersService,
    private readonly rmqService: RmqService
  ) {}

  @MessagePattern(QUEUE_MESSAGE.CREATE_USER)
  async registerNewUser (
    @Payload() data: any,
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return await this.usersService.register(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.UPDATE_USER_STATUS)
  async updateUserStatus (
    @Payload() data: verifyPhoneRequest,
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return await this.usersService.updateUserStatus(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_USER_LOCAL)
  async getUserByPhone (
    @Payload() data: loginUserRequest,
      @Ctx() context: RmqContext
  ): Promise<UserEntity> {
    try {
      return await this.usersService.validateUser(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_USER_JWT)
  async getUserById (
    @Payload() data: TokenPayload,
      @Ctx() context: RmqContext
  ): Promise<UserEntity> {
    try {
      return await this.usersService.getUser(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.UPDATE_USER_PROFILE)
  async updateUserProfile (
    @Payload() payload: ServicePayload<Partial<UserEntity>>,
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return await this.usersService.updateUserProfile(payload)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.DELETE_USER_PROFILE)
  async deleteUserProfile (
    @Payload() { userId }: ServicePayload<null>,
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return await this.usersService.deleteUserProfile(userId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }
}
