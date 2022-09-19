import { RmqService } from '@app/common';
import { QUEUE_MESSAGE } from '@app/common/typings/QUEUE_MESSAGE';
import { Controller, Get } from '@nestjs/common';
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { UsersServiceService } from './users-service.service';

@Controller()
export class UsersServiceController {
  constructor
  (private readonly usersServiceService: UsersServiceService,
    private readonly rmqService: RmqService
    ) {}

  @MessagePattern( QUEUE_MESSAGE.CREATE_USER)
  async registerNewUser(@Payload() data:  any, @Ctx() context: RmqContext) {
    const user = await this.usersServiceService.register(data)
    return user
  }
}
