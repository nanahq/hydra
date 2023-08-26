import { Ctx, MessagePattern, Payload, RmqContext, RpcException } from '@nestjs/microservices'
import { Controller, UseFilters } from '@nestjs/common'

import {
  ExceptionFilterRpc,
  IdPayload,
  QUEUE_MESSAGE,
  ResponseWithStatus,
  RmqService,
  ServicePayload
} from '@app/common'
import { AddressBookLabelService } from './address-book-label-service.service'
import { AddressBookLabel } from '@app/common/database/schemas/address.book.label.schema'
import { AddressBookLabelDto } from '@app/common/database/dto/address.book.label.dto'

@UseFilters(new ExceptionFilterRpc())
@Controller('address-book-labels')
export class AddressBookLabelServiceController {
  constructor (
    private readonly service: AddressBookLabelService,
    private readonly rmqService: RmqService
  ) {
  }

  @MessagePattern(QUEUE_MESSAGE.ADDRESS_BOOK_LABEL_LIST)
  async list (@Ctx() context: RmqContext): Promise<AddressBookLabel[]> {
    try {
      console.log('Hello')
      return await this.service.list()
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.ADDRESS_BOOK_LABEL_CREATE)
  async create (
    @Payload() data: ServicePayload<AddressBookLabelDto>,
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return await this.service.create(data.userId, data.data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.ADDRESS_BOOK_LABEL_READ)
  async getById (
    @Payload() data: IdPayload,
      @Ctx() context: RmqContext
  ): Promise<AddressBookLabel> {
    try {
      return await this.service.findOne(data.id)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.ADDRESS_BOOK_LABEL_UPDATE)
  async update (
    @Payload() payload: ServicePayload<AddressBookLabelDto>,
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return await this.service.update(payload)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.ADDRESS_BOOK_LABEL_DELETE)
  async delete (
    @Payload() { userId }: ServicePayload<null>,
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return await this.service.delete(userId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }
}
