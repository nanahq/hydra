import {
  Controller,
  Inject,
  Get,
  UseGuards,
  HttpException,
  Param
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'

import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import {
  QUEUE_SERVICE,
  QUEUE_MESSAGE,
  ServicePayload,
  IRpcException,
  Vendor,
  ListingMenu
} from '@app/common'

@Controller('listing')
export class ListingsController {
  constructor (
    @Inject(QUEUE_SERVICE.LISTINGS_SERVICE)
    private readonly listingClient: ClientProxy
  ) {}

  @Get('listings')
  @UseGuards(JwtAuthGuard)
  async getVendors (): Promise<Vendor[]> {
    return await lastValueFrom<Vendor[]>(
      this.listingClient.send(QUEUE_MESSAGE.GET_ALL_LISTING_ADMIN, {}).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Get('/:vendorId')
  @UseGuards(JwtAuthGuard)
  async getVendorListings (
    @Param('vendorId') vendorId: string
  ): Promise<ListingMenu[]> {
    const payload: ServicePayload<null> = {
      userId: vendorId,
      data: null
    }
    return await lastValueFrom<ListingMenu[]>(
      this.listingClient.send(QUEUE_MESSAGE.GET_ALL_LISTINGS, payload).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }
}
