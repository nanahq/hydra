import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
  RpcException
} from '@nestjs/microservices'
import { Controller, UseFilters } from '@nestjs/common'

import {
  CheckUserAccountI,
  ExceptionFilterRpc,
  loginUserRequest,
  QUEUE_MESSAGE,
  registerUserRequest,
  ResponseWithStatus,
  RmqService,
  ServicePayload,
  TokenPayload,
  User,
  verifyPhoneRequest
} from '@app/common'
import { UsersService } from './users-service.service'
import { UpdateUserDto } from '@app/common/dto/UpdateUserDto'

@UseFilters(new ExceptionFilterRpc())
@Controller()
export class UsersServiceController {
  constructor (
    private readonly usersService: UsersService,
    private readonly rmqService: RmqService
  ) {}

  @MessagePattern(QUEUE_MESSAGE.CREATE_USER)
  async registerNewUser (
    @Payload() data: registerUserRequest,
      @Ctx() context: RmqContext
  ): Promise<User> {
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
  ): Promise<User> {
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
  ): Promise<User> {
    try {
      const res = await this.usersService.validateUser(data)
      return res.data
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
  ): Promise<User> {
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
    @Payload() payload: ServicePayload<Partial<UpdateUserDto>>,
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

  @MessagePattern(QUEUE_MESSAGE.GET_USER_BY_PHONE)
  async getUserWithPhone (
    @Payload() { phone }: { phone: string },
      @Ctx() context: RmqContext
  ): Promise<User> {
    try {
      return await this.usersService.getUserWithPhone(phone)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.UPDATE_USER_ORDER_COUNT)
  async updateUserOrderCount (
    @Payload() { orderId, userId }: { orderId: string, userId: string },
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return await this.usersService.updateUserOrderCount(orderId, userId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.CHECK_PHONE_NUMBER)
  async checkUserAccount (
    @Payload() { phone }: { phone: string },
      @Ctx() context: RmqContext
  ): Promise<CheckUserAccountI> {
    try {
      return await this.usersService.checkUserAccount(phone)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.RESEND_PHONE_VERIFICATION)
  async resendPhoneVerification (
    @Payload() { phone }: { phone: string },
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return await this.usersService.resendPhoneNumberRequest(phone)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }
}
