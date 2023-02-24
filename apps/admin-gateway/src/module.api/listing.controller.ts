import {
  Controller,
  Delete,
  Get,
  HttpException,
  Inject,
  Param,
  UseGuards
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'

import {
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  ResponseWithStatus,
  ServicePayload,
  IRpcException,
 ListingCategory
} from '@app/common'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'

@Controller('listing')
export class ListingController {
  constructor (
    @Inject(QUEUE_SERVICE.LISTINGS_SERVICE)
    private readonly vendorsClient: ClientProxy
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('listings')
  async getAllVendors (): Promise<ListingCategory[]> {
      return await lastValueFrom<ListingCategory[]>(
      this.vendorsClient.send(QUEUE_MESSAGE.GET_ALL_LISTING_ADMIN, {}).pipe(
        catchError<any, any>((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getVendor (@Param('id') listingId: string): Promise<ListingCategory> {
    const payload: ServicePayload<{ listingId: string }> = {
      userId: '',
      data: {
        listingId
      }
    }
      return await lastValueFrom<ListingCategory>(
      this.vendorsClient.send(QUEUE_MESSAGE.GET_LISTING_INFO, payload).pipe(
        catchError<any, any>((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async deleteVendorProfile (
    @Param('id') listingId: string
  ): Promise<ResponseWithStatus> {
    const payload: ServicePayload<{ listingId: string }> = {
      userId: '',
      data: {
        listingId
      }
    }
    return await lastValueFrom<ResponseWithStatus>(
      this.vendorsClient.send(QUEUE_MESSAGE.DELETE_LISTING, payload).pipe(
        catchError<any, any>((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }
}
