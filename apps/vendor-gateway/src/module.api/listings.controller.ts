import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Inject,
  Param,
  Post,
  Put,
  UseGuards
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'

import {
  IRpcException,
  ResponseWithStatus,
  ServicePayload,
  VendorEntity,
  ListingEntity,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  ListingDto
} from '@app/common'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { CurrentUser } from '../../../admin-gateway/src/module.api/current-user.decorator'

@Controller('listings')
export class ListingsController {
  constructor (
    @Inject(QUEUE_SERVICE.LISTINGS_SERVICE)
    private readonly listingClient: ClientProxy
  ) {}

  @Get('get-listings')
  @UseGuards(JwtAuthGuard)
  async getAllListings (
    @CurrentUser() vendor: VendorEntity
  ): Promise<ResponseWithStatus> {
    const payload: ServicePayload<null> = {
      userId: vendor.id,
      data: null
    }
    return await lastValueFrom<ResponseWithStatus>(
      this.listingClient.send(QUEUE_MESSAGE.GET_ALL_LISTINGS, payload).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Get('get-one/:id')
  @UseGuards(JwtAuthGuard)
  async getVendor (
    @Param('id') listingId: string,
      @CurrentUser() vendor: VendorEntity
  ): Promise<ListingEntity> {
    const payload: ServicePayload<{ listingId: string }> = {
      userId: vendor.id,
      data: { listingId }
    }

    return await lastValueFrom<ListingEntity>(
      this.listingClient.send(QUEUE_MESSAGE.GET_LISTING_INFO, payload).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Delete('delete-listing/:id')
  @UseGuards(JwtAuthGuard)
  async deleteVendorProfile (
    @Param('id') listingId: string,
      @CurrentUser() vendor: VendorEntity
  ): Promise<ResponseWithStatus> {
    const payload: ServicePayload<{ listingId: string }> = {
      data: { listingId },
      userId: vendor.id
    }

    return await lastValueFrom<ResponseWithStatus>(
      this.listingClient.send(QUEUE_MESSAGE.DELETE_LISTING, payload).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createListing (
    @Body() request: ListingDto,
      @CurrentUser() vendor: VendorEntity
  ): Promise<ResponseWithStatus> {
    const payload: ServicePayload<ListingDto> = {
      userId: vendor.id,
      data: request
    }

    return await lastValueFrom(
      this.listingClient.send(QUEUE_MESSAGE.CREATE_LISTING, payload).pipe(
        catchError((error) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Put('update-listing/:id')
  @UseGuards(JwtAuthGuard)
  async updateVendorProfile (
    @Param('id') listingId: string,
      @Body() listing: Partial<ListingEntity>,
      @CurrentUser() vendor: VendorEntity
  ): Promise<ResponseWithStatus> {
    listing.id = listingId
    const payload: ServicePayload<Partial<ListingEntity>> = {
      userId: vendor.id,
      data: listing
    }

    return await lastValueFrom<ResponseWithStatus>(
      this.listingClient.send(QUEUE_MESSAGE.UPDATE_LISTING, payload).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }
}
