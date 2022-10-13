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
  Put,
  UseGuards
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'
import { ListingDto } from '@app/common/database/dto/listing.dto'
import {
  IRpcException,
  ResponseWithStatus,
  ServicePayload,
  VendorEntity
} from '@app/common'
import { ListingEntity } from '@app/common/database/entities/Listing'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { CurrentUser } from '../../../admin-gateway/src/module.api/current-user.decorator'

@Controller('/listings')
export class ListingsController {
  constructor (
    @Inject(QUEUE_SERVICE.LISTINGS_SERVICE)
    private readonly listingClient: ClientProxy
  ) {}

  @Get('/')
  @UseGuards(JwtAuthGuard)
  async getAllListings (@CurrentUser() vendor: VendorEntity): Promise<any> {
    return await lastValueFrom(
      this.listingClient
        .send(QUEUE_MESSAGE.GET_ALL_LISTINGS, { vendorId: vendor.id })
        .pipe(
          catchError((error) => {
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
    const payload = {
      listingId,
      vendorId: vendor.id
    }

    return await lastValueFrom<ListingEntity>(
      this.listingClient.send(QUEUE_MESSAGE.GET_LISTING_INFO, payload).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard)
  async deleteVendorProfile (
    @Param('id') listingId: string,
      @CurrentUser() vendor: VendorEntity
  ): Promise<ResponseWithStatus> {
    const payload = {
      listingId,
      vendorId: vendor.id
    }

    return await lastValueFrom<ResponseWithStatus>(
      this.listingClient.send(QUEUE_MESSAGE.DELETE_LISTING, payload).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Post('/create')
  @UseGuards(JwtAuthGuard)
  async createListing (
    @Body() request: ListingDto,
      @CurrentUser() vendor: VendorEntity
  ): Promise<any> {
    const payload: ServicePayload<ListingDto> = {
      userId: vendor.id,
      data: request
    }

    return await lastValueFrom(
      this.listingClient
        .send(QUEUE_MESSAGE.CREATE_LISTING, { ...payload })
        .pipe(
          catchError((error) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Put('update/:id')
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
