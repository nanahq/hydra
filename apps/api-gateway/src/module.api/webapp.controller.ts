import { ClientProxy } from '@nestjs/microservices'
import {
  Controller,
  Get,
  HttpException,
  Inject,
  Param
} from '@nestjs/common'
import {
  IRpcException,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  UserHomePage,
  VendorWithListing
} from '@app/common'
import { catchError, lastValueFrom } from 'rxjs'

@Controller('webapp')
export class WebAppController {
  constructor (
    @Inject(QUEUE_SERVICE.VENDORS_SERVICE)
    private readonly vendorsClient: ClientProxy,

    @Inject(QUEUE_SERVICE.LISTINGS_SERVICE)
    private readonly listingClient: ClientProxy
  ) {}

  @Get('/vendor/:vendorId')
  async getVendor (
    @Param('vendorId') vendorId: string
  ): Promise<VendorWithListing> {
    return await lastValueFrom<VendorWithListing>(
      this.vendorsClient.send(QUEUE_MESSAGE.GET_VENDOR_WEBPAGE_LISTING, vendorId).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Get('/listings')
  async getWebAppListings (
  ): Promise<UserHomePage> {
    return await lastValueFrom<UserHomePage>(
      this.listingClient
        .send(QUEUE_MESSAGE.GET_WEBAPP_LISTINGS, {})
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }
}
