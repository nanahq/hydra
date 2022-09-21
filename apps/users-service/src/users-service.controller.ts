import { loginUserRequest, RmqService, TokenPayload } from '@app/common'
import { verifyPhoneRequest } from '@app/common/dto/verifyPhoneRequest.dto'
import { QUEUE_MESSAGE } from '@app/common/typings/QUEUE_MESSAGE'
import { Controller, UseFilters } from '@nestjs/common'
import { User } from './schema'
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
  RpcException
} from '@nestjs/microservices'
import { UpdateUserStateResponse } from './interface'
import { UsersServiceService } from './users-service.service'

import { ExceptionFilterRpc } from '@app/common/filters/rpc.expection'
@UseFilters(new ExceptionFilterRpc())
@Controller()
export class UsersServiceController {
  constructor (
    private readonly usersServiceService: UsersServiceService,
    private readonly rmqService: RmqService
  ) {}

  @MessagePattern(QUEUE_MESSAGE.CREATE_USER)
  async registerNewUser (
    @Payload() data: any,
      @Ctx() context: RmqContext
  ): Promise<User> {
    try {
      return await this.usersServiceService.register(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.UPDATE_USER_STATUS)
  async updateUserStatus (
    @Payload() data: verifyPhoneRequest,
      @Ctx() ctx: RmqContext
  ): Promise<UpdateUserStateResponse> {
    this.rmqService.ack(ctx)
    try {
      return await this.usersServiceService.updateUserStatus(data)
    } catch (error) {
      throw new RpcException(error)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_USER_LOCAL)
  async getUserByPhone (
    @Payload() data: loginUserRequest,
      @Ctx() context: RmqContext
  ): Promise<User> {
    try {
      this.rmqService.ack(context)
      return await this.usersServiceService.validateUser(data)
    } catch (error) {
      throw new RpcException(error)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_USER_JWT)
  async getUserById (
    @Payload() data: TokenPayload,
      @Ctx() context: RmqContext
  ): Promise<User> {
    try {
      this.rmqService.ack(context)
      return await this.usersServiceService.getUser(data)
    } catch (error) {
      throw new RpcException(error)
    }
  }
}
