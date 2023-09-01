import { Controller, Get, HttpException, Inject, Param, UseGuards } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'

import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { IRpcException, ListingCategory, ListingMenu, QUEUE_MESSAGE, QUEUE_SERVICE } from '@app/common'

@Controller('listing')
export class ListingsController {
  constructor (
    @Inject(QUEUE_SERVICE.LISTINGS_SERVICE)
    private readonly listingClient: ClientProxy
  ) {
  }

  @Get('menus')
  @UseGuards(JwtAuthGuard)
  async getMenus (): Promise<ListingMenu[]> {
    return await lastValueFrom<ListingMenu[]>(
      this.listingClient.send(QUEUE_MESSAGE.GET_ALL_LISTING_MENU_USER, {}).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Get('categories')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
}
