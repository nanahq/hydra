import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  Put,
  UseGuards
} from '@nestjs/common'
import { DriversServiceService } from './drivers-service.service'
import {
  CurrentUser,
  Delivery,
  Driver,
  ResponseWithStatus,
  RegisterDriverDto,
  QUEUE_MESSAGE,
  RmqService,
  UpdateDeliveryStatusDto,
  DeliveryI,
  DriverStatGroup,
  DriverWalletI,
  CreateAccountWithOrganizationDto,
  AcceptFleetInviteDto,
  FleetOrganization
} from '@app/common'
import { JwtAuthGuard } from './auth/guards/jwt.guard'
import { ODSA } from './ODSA/odsa.service'
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
  RpcException
} from '@nestjs/microservices'
import { createTransaction, updateIsDriverInternalDto } from '@app/common/dto/General.dto'

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

  @UseGuards(JwtAuthGuard)
  @Get('available-deliveries')
  async getAvailableDeliveries (@CurrentUser() driver: Driver): Promise<Delivery[]> {
    return await this.odsaService.driverFetchAvailableDeliveries(driver._id.toString())
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile (@CurrentUser() driver: Driver): Promise<Driver> {
    return driver
  }

  @Put('update')
  @UseGuards(JwtAuthGuard)
  async updateProfile (
    @CurrentUser() driver: Driver,
      @Body() payload: Partial<Driver>
  ): Promise<ResponseWithStatus> {
    try {
      return await this.driversServiceService.updateDriver(
        payload,
        driver._id.toString()
      )
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
      return await this.odsaService.queryPendingDeliveries(driver._id as any)
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

  @UseGuards(JwtAuthGuard)
  @Post('delivery/accept')
  async driverAcceptDelivery (
    @Body() data: { deliveryId: string, orderId: string },
      @CurrentUser() driver: Driver
  ): Promise<ResponseWithStatus> {
    try {
      const payload = {
        ...data,
        driverId: driver._id.toString()
      }
      return await this.odsaService.handleAcceptDelivery(payload)
    } catch (error) {
      throw new HttpException(error.message, error.status)
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('delivery/reject')
  async driverRejectDelivery (
    @Body() data: { deliveryId: string, orderId: string },
      @CurrentUser() driver: Driver
  ): Promise<ResponseWithStatus> {
    try {
      const payload = {
        ...data,
        driverId: driver._id.toString()
      }
      return await this.odsaService.handleRejectDelivery(payload)
    } catch (error) {
      throw new HttpException(error.message, error.status)
    }
  }

  //  Wallet -------

  @UseGuards(JwtAuthGuard)
  @Get('driver/wallet')
  async driverFetchWallet (
    @CurrentUser() driver: Driver
  ): Promise<DriverWalletI> {
    try {
      return await this.driversServiceService.fetchWallet(
        driver._id.toString()
      )
    } catch (error) {
      throw new HttpException(error.message, error.status)
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('driver/wallet/withdrawal')
  async driverWithdraw (
    @Body() data: createTransaction,
      @CurrentUser() driver: Driver
  ): Promise<ResponseWithStatus> {
    try {
      return await this.driversServiceService.withdrawal(data)
    } catch (error) {
      throw new HttpException(error.message, error.status)
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('driver/wallet/transactions')
  async driverFetchTransactions (
    @CurrentUser() driver: Driver
  ): Promise<DriverWalletI[]> {
    try {
      return await this.driversServiceService.fetchTransactions(
        driver._id.toString()
      )
    } catch (error) {
      throw new HttpException(error.message, error.status)
    }
  }

  @Post('fleet/create/organization')
  async createFleetOrganization (
    @Body() data: CreateAccountWithOrganizationDto
  ): Promise<ResponseWithStatus> {
    try {
      return await this.driversServiceService.createFleetOrganization(data)
    } catch (error) {
      throw new HttpException(error.message, error.status)
    }
  }

  @Post('fleet/invite/member')
  async acceptFleetOrgInvite (
    @Body() data: AcceptFleetInviteDto
  ): Promise<ResponseWithStatus> {
    try {
      return await this.driversServiceService.acceptFleetOrgInvite(data)
    } catch (error) {
      throw new HttpException(error.message, error.status)
    }
  }

  @Get('fleet/organization/:inviteLink')
  async getOrganization (
    @Param('inviteLink') inviteLink: string
  ): Promise<FleetOrganization> {
    try {
      return await this.driversServiceService.getFleetOrganization(inviteLink)
    } catch (error) {
      throw new HttpException(error.message, error.status)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.ADMIN_GET_DRIVERS)
  async getDrivers (@Ctx() context: RmqContext): Promise<Driver[]> {
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
  async freeDrivers (@Ctx() context: RmqContext): Promise<Driver[]> {
    try {
      return this.driversServiceService.getAllFreeDrivers()
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.ADMIN_UPDATE_DRIVER_IS_INTERNAL)
  async updateDriverIsInternal (
    @Payload() data: updateIsDriverInternalDto,
      @Ctx() context: RmqContext): Promise<{ status: number }> {
    try {
      return this.driversServiceService.updateDriverIsInternal({ id: data.id, internal: data.internal })
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.DRIVER_SERVICE_REQUEST_PING)
  async ping (
    @Ctx() context: RmqContext
  ): Promise<string | undefined> {
    try {
      return await this.driversServiceService.ping()
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }
}
