import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Inject,
  Param,
  Post,
  Put,
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
  User,
  AddressBookLabelDto,
  AddressBookLabel, AdminLevel, Admin
} from '@app/common'
import { AdminClearance } from './decorators/user-level.decorator'

@Controller('address-book-labels')
@UseGuards(JwtAuthGuard)
export class AddressBookLabelController {
  constructor (
    @Inject(QUEUE_SERVICE.ADMINS_SERVICE)
    private readonly addressBookLabelClient: ClientProxy
  ) {}

  @Get('')
  async list (): Promise<AddressBookLabel[]> {
    return await lastValueFrom<AddressBookLabel[]>(
      this.addressBookLabelClient
        .send(QUEUE_MESSAGE.ADDRESS_BOOK_LABEL_LIST, {})
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Post('')
  async create (
    @AdminClearance([AdminLevel.OPERATIONS]) admin: Admin,
      @Body() data: AddressBookLabelDto,
      @CurrentUser() user: User
  ): Promise<ResponseWithStatus> {
    const payload: ServicePayload<AddressBookLabelDto> = {
      userId: user._id as any,
      data
    }
    return await lastValueFrom<ResponseWithStatus>(
      this.addressBookLabelClient
        .send(QUEUE_MESSAGE.ADDRESS_BOOK_LABEL_CREATE, payload)
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Get(':id')
  async getById (@Param('id') id: string): Promise<AddressBookLabel | null> {
    return await lastValueFrom<AddressBookLabel | null>(
      this.addressBookLabelClient
        .send(QUEUE_MESSAGE.ADDRESS_BOOK_LABEL_READ, { id })
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update (
    @AdminClearance([AdminLevel.OPERATIONS]) admin: Admin,
      @Body() data: AddressBookLabelDto,
      @Param('id') id: string
  ): Promise<AddressBookLabel | null> {
    const payload: ServicePayload<AddressBookLabelDto> = {
      data,
      userId: id
    }

    return await lastValueFrom<AddressBookLabel | null>(
      this.addressBookLabelClient
        .send(QUEUE_MESSAGE.ADDRESS_BOOK_LABEL_UPDATE, payload)
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async delete (
    @AdminClearance([AdminLevel.OPERATIONS]) admin: Admin,
      @Param('id') id: string): Promise<ResponseWithStatus> {
    return await lastValueFrom<ResponseWithStatus>(
      this.addressBookLabelClient
        .send(QUEUE_MESSAGE.ADDRESS_BOOK_DELETE_BY_USER, { id })
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }
}
