import {
  Controller,
  Inject,
  Get,
  UseGuards,
  HttpException,
  Param
} from '@nestjs/common'
import {
  QUEUE_SERVICE,
  QUEUE_MESSAGE,
  ServicePayload,
  IRpcException,
  VendorEntity
} from '@app/common'
import { ClientProxy } from '@nestjs/microservices'
import { ListingEntity } from '@app/common/database/entities/Listing'
import { catchError, lastValueFrom } from 'rxjs'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'

@Controller('listings')
export class ListingsController {
  constructor (
    @Inject(QUEUE_SERVICE.LISTINGS_SERVICE)
    private readonly listingClient: ClientProxy
  ) {}

  @Get('get-all')
  @UseGuards(JwtAuthGuard)
  async getVendors (): Promise<VendorEntity[]> {
    return await lastValueFrom<VendorEntity[]>(
      this.listingClient.send(QUEUE_MESSAGE.GET_ALL_LISTING_ADMIN, {}).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Get('get-listings/:vendorId')
  @UseGuards(JwtAuthGuard)
  async getVendorListings (
    @Param('vendorId') vendorId: string
  ): Promise<ListingEntity[]> {
    const payload: ServicePayload<null> = {
      userId: vendorId,
      data: null
    }
    console.log(payload)
    return await lastValueFrom<ListingEntity[]>(
      this.listingClient.send(QUEUE_MESSAGE.GET_ALL_LISTINGS, payload).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }
}