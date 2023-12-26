import {
  Body,
  Controller,
  Get,
  HttpException, Param,
  Post, Put,
  UseGuards
} from '@nestjs/common'
import { DriversServiceService } from './drivers-service.service'
import {
  CurrentUser,
  Delivery,
  Driver,
  ResponseWithStatus,
  RegisterDriverDto, QUEUE_MESSAGE, RmqService, UpdateDeliveryStatusDto, DeliveryI, DriverStatGroup
} from '@app/common'
import { JwtAuthGuard } from './auth/guards/jwt.guard'
import { ODSA } from './ODSA/odsa.service'
import { Ctx, MessagePattern, Payload, RmqContext, RpcException } from '@nestjs/microservices'

@Controller('driver')
export class DriversServiceController {
  constructor (
    private readonly driversServiceService: DriversServiceService,
    private readonly odsaService: ODSA,
    private readonly rmqService: RmqService
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

  @Put('update')
  @UseGuards(JwtAuthGuard)
  async updateProfile (@CurrentUser() driver: Driver, @Body() payload: Partial<Driver>): Promise<ResponseWithStatus> {
    try {
      return await this.driversServiceService.updateDriver(payload, driver._id.toString())
    } catch (error) {
      throw new HttpException(error, 500)
    }
  }

  @Post('order/status')
  @UseGuards(JwtAuthGuard)
  async updateDeliveryStatus (
    @Body() data: UpdateDeliveryStatusDto,
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
        driver._id as any
      )
    } catch (error) {
      throw new HttpException(error.message, error.status)
    }
  }

  @Get('deliveries/today')
  @UseGuards(JwtAuthGuard)
  async getDayDeliveries (
    @CurrentUser() driver: Driver
  ): Promise<DeliveryI[] | undefined> {
    try {
      return await this.odsaService.queryDayDeliveries(driver._id as any)
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

  @Get('delivery/order/:id')
  @UseGuards(JwtAuthGuard)
  async getOrderDelivery (
    @Param('id') orderId: string
  ): Promise<DeliveryI | undefined> {
    try {
      return await this.odsaService.queryOrderDelivery(orderId)
    } catch (error) {
      throw new HttpException(error.message, error.status)
    }
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getDriverStats (
    @CurrentUser() driver: Driver
  ): Promise<DriverStatGroup> {
    try {
      return await this.odsaService.getDriverStats(driver._id.toString())
    } catch (error) {
      throw new HttpException(error.message, error.status)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.ADMIN_GET_DRIVERS)
  async getDrivers (
    @Ctx() context: RmqContext
  ): Promise<Driver[]> {
    try {
      return this.driversServiceService.getAllDrivers()
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.ADMIN_APPROVE_DRIVER)
  async approveDriver (
    @Payload() { driverId }: { driverId: string },
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return this.driversServiceService.approveDriver(driverId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.ADMIN_REJECT_DRIVER)
  async rejectDriver (
    @Payload() { driverId }: { driverId: string },
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return this.driversServiceService.rejectDriver(driverId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.ADMIN_DELETE_DRIVER)
  async deleteDriver (
    @Payload() { driverId }: { driverId: string },
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return this.driversServiceService.deleteDriver(driverId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }



  @MessagePattern(QUEUE_MESSAGE.ADMIN_GET_FREE_DRIVERS)
  async freeDrivers (
    @Ctx() context: RmqContext
  ): Promise<Driver[]> {
    try {
      return this.driversServiceService.getAllFreeDrivers()
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }
}
