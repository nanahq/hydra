import { RmqService } from '@app/common';
import { verifyPhoneRequest } from '@app/common/dto/verifyPhoneRequest.dto';
import { QUEUE_MESSAGE } from '@app/common/typings/QUEUE_MESSAGE';
import { Controller, Get, UnprocessableEntityException } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { User } from './schema';
import { UsersServiceService } from './users-service.service';

@Controller()
export class UsersServiceController {
  constructor
  (private readonly usersServiceService: UsersServiceService,
    private readonly rmqService: RmqService
    ) {}

  @MessagePattern( QUEUE_MESSAGE.CREATE_USER)
  async registerNewUser(@Payload() data:  any, @Ctx() context: RmqContext) {
    try {
    return  await this.usersServiceService.register(data)
    } catch (error) {
      throw new UnprocessableEntityException(error)
    } finally {
     this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.UPDATE_USER_STATUS)
  async updateUserStatus (@Payload() data: verifyPhoneRequest, @Ctx() ctx: RmqContext) {
    return this.usersServiceService.updateUserStatus(data)
  }
}
