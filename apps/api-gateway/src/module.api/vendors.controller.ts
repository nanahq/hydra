import { ClientProxy } from '@nestjs/microservices'
import {
  Controller,
  Get,
  HttpException,
  Inject,
  Param,
  UseGuards,
  Post,
  Body,
  Res,
  HttpStatus
} from '@nestjs/common'
import {
  CurrentUser,
  IRpcException,
  LocationCoordinates,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  ScheduledListingNotification,
  ServicePayload,
  SubscribeDto,
  TravelDistanceResult,
  User,
  Vendor
} from '@app/common'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { catchError, lastValueFrom } from 'rxjs'
import { Response } from 'express'

@Controller('vendor')
export class VendorsController {
  constructor (
    @Inject(QUEUE_SERVICE.VENDORS_SERVICE)
    private readonly vendorsClient: ClientProxy,

    @Inject(QUEUE_SERVICE.LOCATION_SERVICE)
    private readonly locationClient: ClientProxy,

    @Inject(QUEUE_SERVICE.NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy
  ) {}

  @Get('vendors')
  async getVendors (): Promise<Vendor[]> {
    return await lastValueFrom<Vendor[]>(
      this.vendorsClient.send(QUEUE_MESSAGE.GET_ALL_VENDORS_USERS, {}).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Get('/:vendorId')
  async getVendor (
    @Param('vendorId') vendorId: string
  ): Promise<Vendor> {
    const payload: ServicePayload<string> = {
      userId: '',
      data: vendorId
    }
    return await lastValueFrom<Vendor>(
      this.vendorsClient.send(QUEUE_MESSAGE.GET_VENDOR, payload).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }
  //   Homepage/landing page endpoints

  /**
   * Get restaurants closest to the user
   */
  @Get('/home/nearest')
  async nearestToYou (@CurrentUser() user: User): Promise<Vendor[]> {
    const payload: ServicePayload<{ userLocation: LocationCoordinates }> = {
      userId: user._id as any,
      data: {
        userLocation: user.location
      }
    }
    return await lastValueFrom<Vendor[]>(
      this.vendorsClient.send(QUEUE_MESSAGE.GET_NEAREST_VENDORS, payload).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Post('/travel-distance')
  async getTravelDistance (
    @Body() data: Omit<LocationCoordinates, 'type'>,
      @CurrentUser() user: User
  ): Promise<TravelDistanceResult> {
    return await lastValueFrom<TravelDistanceResult>(
      this.locationClient
        .send(QUEUE_MESSAGE.LOCATION_GET_ETA, {
          userCoords: user.location.coordinates,
          vendorCoords: data.coordinates
        })
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  async subscribeUnsubscribeToVendor (
    @Body() payload: SubscribeDto,
      @CurrentUser() user: User,
      @Res() response: Response
  ): Promise<void> {
    await lastValueFrom(
      this.notificationClient
        .emit(QUEUE_MESSAGE.USER_SUBSCRIBE_TO_VENDOR, payload)
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
    response.status(HttpStatus.OK).end()
  }

  @Get('subscriptions/:id')
  @UseGuards(JwtAuthGuard)
  async getAllSubscriptions (
    @Param('id') id: string
  ): Promise<ScheduledListingNotification[]> {
    const payload: ServicePayload<null> = {
      userId: id,
      data: null
    }
    return await lastValueFrom(
      this.notificationClient
        .send(QUEUE_MESSAGE.GET_USER_SUBSCRIPTIONS, payload)
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Get('subscription/vendor/:vid')
  async getVendorSubscribers (
    @Param('vid') vendor: string
  ): Promise<ScheduledListingNotification> {
    const payload: ServicePayload<null> = {
      userId: vendor,
      data: null
    }
    return await lastValueFrom(
      this.notificationClient
        .send(QUEUE_MESSAGE.GET_VENDOR_SUBSCRIPTION, payload)
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Get('check/ping')
  async ping (): Promise<string> {
    return 'Vendor Controller PONG'
  }
}
