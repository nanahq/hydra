import {
  Body,
  Controller,
  Get,
  HttpException,
  Post,
  UseGuards
} from '@nestjs/common'
import { DriversServiceService } from './drivers-service.service'
import {
  CurrentUser,
  Delivery,
  Driver,
  OrderStatus,
  ResponseWithStatus,
  RegisterDriverDto
} from '@app/common'
import { JwtAuthGuard } from './auth/guards/jwt.guard'
import { ODSA } from './ODSA/odsa.service'

@Controller('driver')
export class DriversServiceController {
  constructor (
    private readonly driversServiceService: DriversServiceService,
    private readonly odsaService: ODSA
  ) {}

  @Post('register')
  async registerDriver (
    @Body() data: RegisterDriverDto
  ): Promise<ResponseWithStatus> {
    try {
      return await this.driversServiceService.register(data)
    } catch (error: any) {
      throw new HttpException(error, 500)
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile (@CurrentUser() driver: Driver): Promise<Driver> {
    return driver
  }

  @Post('order/status')
  @UseGuards(JwtAuthGuard)
  async updateDeliveryStatus (
    @Body() data: { status: OrderStatus, deliveryId: string },
      @CurrentUser() driver: Driver
  ): Promise<ResponseWithStatus> {
    try {
      return await this.odsaService.handleUpdateDeliveryStatus({
        ...data,
        driverId: driver._id as unknown as string
      })
    } catch (error) {
      throw new HttpException(error, 500)
    }
  }

  @Get('deliveries/pending')
  @UseGuards(JwtAuthGuard)
  async getDriversPendingDelivery (
    @CurrentUser() driver: Driver
  ): Promise<Delivery[] | undefined> {
    try {
      return await this.odsaService.queryPendingDeliveries(
        driver._id as unknown as string
      )
    } catch (error) {
      throw new HttpException(error.message, error.status)
    }
  }

  @Get('deliveries/fulfilled')
  @UseGuards(JwtAuthGuard)
  async getDriversFulfilledDelivery (
    @CurrentUser() driver: Driver
  ): Promise<Delivery[] | undefined> {
    try {
      return await this.odsaService.queryFulfilledDeliveries(
        driver._id as unknown as string
      )
    } catch (error) {
      throw new HttpException(error.message, error.status)
    }
  }
}
