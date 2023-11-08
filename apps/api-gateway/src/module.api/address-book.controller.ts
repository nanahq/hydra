import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Inject,
  Param,
  Post,
  UseGuards
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'

import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import {
  CurrentUser,
  IRpcException,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  ResponseWithStatus,
  ServicePayload,
  TokenPayload,
  User
} from '@app/common'
import { AddressBook } from '@app/common/database/schemas/address.book.schema'
import { AddressBookDto } from '@app/common/database/dto/user/address.book.dto'
import { AddressBookLabel } from '@app/common/database/schemas/address.book.label.schema'

@Controller('address-books')
export class AddressBookController {
  constructor (
    @Inject(QUEUE_SERVICE.USERS_SERVICE)
    private readonly userClient: ClientProxy,
    @Inject(QUEUE_SERVICE.ADMINS_SERVICE)
    private readonly adminClient: ClientProxy
  ) {}

  @Get('')
  @UseGuards(JwtAuthGuard)
  async list (@CurrentUser() user: User): Promise<AddressBook[]> {
    return await lastValueFrom<AddressBook[]>(
      this.userClient
        .send(QUEUE_MESSAGE.ADDRESS_BOOK_LIST_BY_USER, { id: user._id })
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Post('')
  @UseGuards(JwtAuthGuard)
  async create (
    @Body() data: AddressBookDto,
      @CurrentUser() user: User
  ): Promise<ResponseWithStatus> {
    const payload: Partial<ServicePayload<AddressBookDto>> = {
      userId: user._id as any,
      data
    }

    return await lastValueFrom<ResponseWithStatus>(
      this.userClient.send(QUEUE_MESSAGE.ADDRESS_BOOK_CREATE, payload).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Get('labels')
  @UseGuards(JwtAuthGuard)
  async listLabels (): Promise<AddressBookLabel[]> {
    console.log('Hello 1')
    return await lastValueFrom<AddressBookLabel[]>(
      this.adminClient.send(QUEUE_MESSAGE.ADDRESS_BOOK_LABEL_LIST, {}).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getById (@Param('id') id: string): Promise<AddressBook | null> {
    return await lastValueFrom<AddressBook | null>(
      this.userClient.send(QUEUE_MESSAGE.ADDRESS_BOOK_READ, { id }).pipe(
        catchError<any, any>((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async delete (
    @Param('id') id: string,
      @CurrentUser() user: User
  ): Promise<ResponseWithStatus> {
    const payload: ServicePayload<TokenPayload> = {
      userId: id,
      data: {
        userId: user._id as any
      }
    }

    return await lastValueFrom<ResponseWithStatus>(
      this.userClient
        .send(QUEUE_MESSAGE.ADDRESS_BOOK_DELETE_BY_USER, payload)
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }
}
