import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
  RpcException
} from '@nestjs/microservices'
import { Controller, UseFilters } from '@nestjs/common'

import {
  ExceptionFilterRpc,
  IdPayload,
  PinAddressI,
  QUEUE_MESSAGE,
  ResponseWithStatus,
  RmqService,
  ServicePayload,
  TokenPayload
} from '@app/common'
import { AddressBookService } from './address-book-service.service'
import { AddressBookDto } from '@app/common/database/dto/user/address.book.dto'
import { AddressBook } from '@app/common/database/schemas/address.book.schema'

@UseFilters(new ExceptionFilterRpc())
@Controller('address-books')
export class AddressBookServiceController {
  constructor (
    private readonly service: AddressBookService,
    private readonly rmqService: RmqService
  ) {}

  @MessagePattern(QUEUE_MESSAGE.ADDRESS_BOOK_LIST)
  async list (@Ctx() context: RmqContext): Promise<AddressBook[]> {
    try {
      return await this.service.list()
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.ADDRESS_BOOK_LIST_BY_USER)
  async listByUser (
    @Ctx() context: RmqContext,
      @Payload() data: IdPayload
  ): Promise<AddressBook[]> {
    try {
      return await this.service.listByUserId(data.id)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.ADDRESS_BOOK_CREATE)
  async create (
    @Payload() data: Partial<AddressBookDto>,
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return await this.service.create(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.ADDRESS_BOOK_READ)
  async getById (
    @Payload() data: IdPayload,
      @Ctx() context: RmqContext
  ): Promise<AddressBook> {
    try {
      return await this.service.findOne(data.id)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.ADDRESS_BOOK_UPDATE)
  async updateUserProfile (
    @Payload() payload: ServicePayload<AddressBookDto>,
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

  @MessagePattern(QUEUE_MESSAGE.ADDRESS_BOOK_DELETE)
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

  @MessagePattern(QUEUE_MESSAGE.ADDRESS_BOOK_DELETE_BY_USER)
  async deleteByUser (
    @Payload() { userId, data }: ServicePayload<TokenPayload>,
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

  @MessagePattern(QUEUE_MESSAGE.GET_USER_ADDRESS_BY_PIN)
  async getAddressByPin (
    @Payload() pin: number,
      @Ctx() context: RmqContext
  ): Promise<PinAddressI> {
    try {
      return await this.service.getAddressByPin(pin)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }
}
