import {
  QUEUE_MESSAGE,
  QUEUE_SERVICE
} from '@app/common/typings/QUEUE_MESSAGE'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Inject,
  Param,
  Post,
  Put
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'
import { ListingDto } from '@app/common/database/dto/listing.dto'
import { IRpcException, ResponseWithStatus } from '@app/common'
import { ListingEntity } from '@app/common/database/entities/Listing'

@Controller('/listings')
export class ListingsController {
  constructor (
    @Inject(QUEUE_SERVICE.LISTINGS_SERVICE)
    private readonly listingClient: ClientProxy
  ) {}

  @Get('/')
  async getAllListings (): Promise<any> {
    return await lastValueFrom(
      this.listingClient.send(QUEUE_MESSAGE.GET_ALL_LISTINGS, {}).pipe(
        catchError((error) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Get('get-one/:id')
  async getVendor (@Param('id') listingId: string): Promise<ListingEntity> {
    console.log(listingId)
    return await lastValueFrom<ListingEntity>(
      this.listingClient
        .send(QUEUE_MESSAGE.GET_LISTING_INFO, { listingId })
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Delete('delete/:id')
  async deleteVendorProfile (
    @Param('id') listingId: string
  ): Promise<ResponseWithStatus> {
    return await lastValueFrom<ResponseWithStatus>(
      this.listingClient.send(QUEUE_MESSAGE.DELETE_LISTING, { listingId }).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Post('/create')
  async createListing (@Body() request: ListingDto): Promise<any> {
    return await lastValueFrom(
      this.listingClient
        .send(QUEUE_MESSAGE.CREATE_LISTING, { ...request })
        .pipe(
          catchError((error) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Put('update/:id')
  async updateVendorProfile (
    @Param('id') listingId: string,
      @Body() listing: Partial<ListingEntity>
  ): Promise<ResponseWithStatus> {
    listing.id = listingId
    return await lastValueFrom<ResponseWithStatus>(
      this.listingClient.send(QUEUE_MESSAGE.UPDATE_LISTING, listing).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }
}
