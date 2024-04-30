import {
  Body,
  Controller,
  Get,
  HttpException,
  Inject,
  Param,
  Post
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'

import {
  IRpcException,
  ListingCategory,
  ListingCategoryI,
  ListingMenu,
  LocationCoordinates,
  MultiPurposeServicePayload,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  ScheduledListingI,
  UserHomePage
} from '@app/common'

@Controller('listing')
export class ListingsController {
  constructor (
    @Inject(QUEUE_SERVICE.LISTINGS_SERVICE)
    private readonly listingClient: ClientProxy
  ) {}

  @Get('menus')
  async getMenus (): Promise<ListingMenu[]> {
    return await lastValueFrom<ListingMenu[]>(
      this.listingClient.send(QUEUE_MESSAGE.GET_ALL_LISTING_MENU_USER, {}).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Get('categories/:vid')
  async getVendorCategories (
    @Param('vid') vendorId: string
  ): Promise<ListingCategory[]> {
    return await lastValueFrom<ListingCategory[]>(
      this.listingClient
        .send(QUEUE_MESSAGE.GET_VENDOR_CAT_USER, { vendorId })
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Get('scheduled/:vid')
  async getVendorScheduledListings (
    @Param('vid') vendorId: string
  ): Promise<ScheduledListingI[]> {
    const payload: MultiPurposeServicePayload<null> = {
      id: vendorId,
      data: null
    }
    return await lastValueFrom<ScheduledListingI[]>(
      this.listingClient
        .send(QUEUE_MESSAGE.GET_SCHEDULED_LISTINGS, payload)
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Get('scheduled')
  async getAllScheduledListings (): Promise<ScheduledListingI[]> {
    return await lastValueFrom<ScheduledListingI[]>(
      this.listingClient
        .send(QUEUE_MESSAGE.GET_SCHEDULED_LISTINGS_USER, {})
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Get('categories')
  async getCategories (): Promise<ListingCategory[]> {
    return await lastValueFrom<ListingCategory[]>(
      this.listingClient.send(QUEUE_MESSAGE.GET_ALL_LISTING_CAT_USER, {}).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Get('menu/:mid')
  async getSingleMenu (@Param('mid') mid: string): Promise<ListingMenu | null> {
    return await lastValueFrom<ListingMenu | null>(
      this.listingClient
        .send(QUEUE_MESSAGE.GET_SINGLE_LISTING_MENU_USER, mid)
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Get('/category/:catid')
  async getSingleCategory (
    @Param('catid') catid: string
  ): Promise<ListingMenu | null> {
    return await lastValueFrom<ListingMenu | null>(
      this.listingClient
        .send(QUEUE_MESSAGE.GET_SINGLE_LISTING_CAT_USER, catid)
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Get('/vendor/:vid')
  async getVendorListings (
    @Param('vid') vendorId: string
  ): Promise<ListingCategoryI> {
    return await lastValueFrom<ListingCategoryI>(
      this.listingClient
        .send(QUEUE_MESSAGE.GET_VENDOR_WITH_LISTING, { vendorId })
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Post('/homepage')
  async getHomepageListings (
    @Body() userLocation: LocationCoordinates
  ): Promise<UserHomePage> {
    return await lastValueFrom<UserHomePage>(
      this.listingClient
        .send(QUEUE_MESSAGE.GET_HOMEPAGE_USERS, { userLocation })
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }
}
