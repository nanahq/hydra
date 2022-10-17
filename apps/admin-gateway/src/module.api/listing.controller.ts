import {
  Controller,
  Delete,
  Get,
  HttpException,
  Inject,
  Param,
  UseGuards
} from '@nestjs/common'
import {
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  ResponseWithStatus,
  ServicePayload
} from '@app/common'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'
import { IRpcException } from '@app/common/filters/rpc.expection'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { ListingEntity } from '@app/common/database/entities/Listing'

@Controller('listings')
export class ListingController {
  constructor (
    @Inject(QUEUE_SERVICE.LISTINGS_SERVICE)
    private readonly vendorsClient: ClientProxy
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('get-all')
  async getAllVendors (): Promise<ListingEntity[]> {
    return await lastValueFrom<ListingEntity[]>(
      this.vendorsClient.send(QUEUE_MESSAGE.GET_ALL_LISTING_ADMIN, {}).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-one/:id')
  async getVendor (@Param('id') listingId: string): Promise<ListingEntity> {
    const payload: ServicePayload<{ listingId: string }> = {
      userId: '',
      data: {
        listingId
      }
    }
    return await lastValueFrom<ListingEntity>(
      this.vendorsClient.send(QUEUE_MESSAGE.GET_LISTING_INFO, payload).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete-listing/:id')
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
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }
}
