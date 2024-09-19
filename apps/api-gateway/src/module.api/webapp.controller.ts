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
  MultiPurposeServicePayload,
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

  @Get('/vendor/:friendlyId')
  async getVendor (
    @Param('friendlyId') friendlyId: string
  ): Promise<VendorWithListing> {
    const payload: MultiPurposeServicePayload<{ friendlyId: string }> = {
      id: '',
      data: {
        friendlyId
      }
    }
    return await lastValueFrom<VendorWithListing>(
      this.vendorsClient.send(QUEUE_MESSAGE.GET_VENDOR_WEBPAGE_LISTING, payload).pipe(
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
