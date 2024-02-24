import { Body, Controller, Delete, Get, HttpException, Inject, Param, Patch, UseGuards } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'

import {
  Admin,
  AdminLevel,
  IRpcException,
  ListingCategory,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  ResponseWithStatus,
  ServicePayload
} from '@app/common'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { ReasonDto } from '@app/common/database/dto/reason.dto'
import { AdminClearance } from './decorators/user-level.decorator'

@Controller('listings')
export class ListingController {
  constructor (
    @Inject(QUEUE_SERVICE.LISTINGS_SERVICE)
    private readonly listingsClient: ClientProxy
  ) {
  }

  @UseGuards(JwtAuthGuard)
  @Get('')
  async index (): Promise<ListingCategory[]> {
    return await lastValueFrom<ListingCategory[]>(
      this.listingsClient.send(QUEUE_MESSAGE.LISTING_ADMIN_LIST_ALL, {}).pipe(
        catchError<any, any>((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Get('pending')
  async pending (): Promise<ListingCategory[]> {
    return await lastValueFrom<ListingCategory[]>(
      this.listingsClient.send(QUEUE_MESSAGE.LISTING_ADMIN_LIST_PENDING, {}).pipe(
        catchError<any, any>((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Get('approved')
  async approved (): Promise<ListingCategory[]> {
    return await lastValueFrom<ListingCategory[]>(
      this.listingsClient.send(QUEUE_MESSAGE.LISTING_ADMIN_LIST_APPROVED, {}).pipe(
        catchError<any, any>((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Get('rejected')
  async rejected (): Promise<ListingCategory[]> {
    return await lastValueFrom<ListingCategory[]>(
      this.listingsClient.send(QUEUE_MESSAGE.LISTING_ADMIN_LIST_REJECTED, {}).pipe(
        catchError<any, any>((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async show (@Param('id') id: string): Promise<ListingCategory> {
    return await lastValueFrom<ListingCategory>(
      this.listingsClient.send(QUEUE_MESSAGE.LISTING_READ, { id }).pipe(
        catchError<any, any>((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async delete (
    @Param('id') listingId: string
  ): Promise<ResponseWithStatus> {
    const payload: ServicePayload<{ listingId: string }> = {
      userId: '',
      data: {
        listingId
      }
    }
    return await lastValueFrom<ResponseWithStatus>(
      this.listingsClient.send(QUEUE_MESSAGE.DELETE_LISTING, payload).pipe(
        catchError<any, any>((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtAuthGuard)
  @Patch('/:id/approve')
  async approve (
    @AdminClearance([AdminLevel.OPERATIONS]) admin: Admin,
      @Param('id') id: string
  ): Promise<ResponseWithStatus> {
    return await lastValueFrom<ResponseWithStatus>(
      this.listingsClient
        .send(QUEUE_MESSAGE.LISTING_MENU_APPROVE, { id })
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtAuthGuard)
  @Patch('/:id/disapprove')
  async disapprove (
    @AdminClearance([AdminLevel.OPERATIONS]) admin: Admin,
      @Param('id') id: string,
      @Body() req: ReasonDto
  ): Promise<ResponseWithStatus> {
    return await lastValueFrom<ResponseWithStatus>(
      this.listingsClient
        .send(QUEUE_MESSAGE.LISTING_MENU_REJECT, {
          id,
          data: req
        })
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }
}
