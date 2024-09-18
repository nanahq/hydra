import {
  Body,
  Controller,
  Get,
  HttpException,
  Inject,
  Post,
  UseGuards
} from '@nestjs/common'
import {
  CurrentUser,
  DeliveryFeeResult,
  IRpcException,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  TravelDistanceResult,
  User
} from '@app/common'
import { ClientProxy } from '@nestjs/microservices'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { catchError, lastValueFrom } from 'rxjs'

@Controller('location')
export class LocationController {
  constructor (
    @Inject(QUEUE_SERVICE.LOCATION_SERVICE)
    private readonly locationClient: ClientProxy
  ) {}

  @Post('eta')
  @UseGuards(JwtAuthGuard)
  async getDeliveryEta (
    @CurrentUser() user: User,
      @Body() data: { userCoords: number[], vendorCoords: number[] }
  ): Promise<any> {
    return await lastValueFrom<TravelDistanceResult>(
      this.locationClient.send(QUEUE_MESSAGE.LOCATION_GET_ETA, data).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Post('delivery-fee')
  @UseGuards(JwtAuthGuard)
  async getDeliveryFee (
    @CurrentUser() user: User,
      @Body() data: { userCoords: number[], vendorCoords: number[] }
  ): Promise<any> {
    return await lastValueFrom<DeliveryFeeResult>(
      this.locationClient
        .send(QUEUE_MESSAGE.LOCATION_GET_DELIVERY_FEE, data)
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Get('ping')
  async ping (): Promise<string> {
    return 'Location Controller PONG'
  }
}
