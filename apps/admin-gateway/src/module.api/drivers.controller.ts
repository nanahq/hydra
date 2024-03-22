import {
  Controller,
  Delete,
  Get,
  HttpException,
  Inject,
  Param,
  Patch, UseGuards
} from '@nestjs/common'
import {
  Admin,
  AdminLevel,
  Delivery,
  Driver,
  IRpcException,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  ResponseWithStatus
} from '@app/common'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'
import { AdminClearance } from './decorators/user-level.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'

@Controller('driver')
@UseGuards(JwtAuthGuard)
export class DriversController {
  constructor (
    @Inject(QUEUE_SERVICE.DRIVER_SERVICE)
    private readonly driversClient: ClientProxy
  ) {}

  @Get('drivers')
  public async getDrivers (): Promise<Driver[]> {
    return await lastValueFrom<Driver[]>(
      this.driversClient.send(QUEUE_MESSAGE.ADMIN_GET_DRIVERS, {}).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Get('drivers/free')
  public async getFreeDrivers (): Promise<Driver[]> {
    return await lastValueFrom<Driver[]>(
      this.driversClient.send(QUEUE_MESSAGE.ADMIN_GET_FREE_DRIVERS, {}).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Patch('approve/:id')
  public async approveDriver (
    @AdminClearance([AdminLevel.OPERATIONS]) admin: Admin,
      @Param('id') driverId: string
  ): Promise<ResponseWithStatus> {
    return await lastValueFrom<ResponseWithStatus>(
      this.driversClient
        .send(QUEUE_MESSAGE.ADMIN_APPROVE_DRIVER, { driverId })
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Patch('reject/:id')
  public async rejectDriver (
    @AdminClearance([AdminLevel.OPERATIONS]) admin: Admin,
      @Param('id') driverId: string
  ): Promise<ResponseWithStatus> {
    return await lastValueFrom<ResponseWithStatus>(
      this.driversClient
        .send(QUEUE_MESSAGE.ADMIN_REJECT_DRIVER, { driverId })
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Delete('delete/:id')
  public async deleteDriver (
    @AdminClearance([AdminLevel.OPERATIONS]) admin: Admin,
      @Param('id') driverId: string
  ): Promise<ResponseWithStatus> {
    return await lastValueFrom<ResponseWithStatus>(
      this.driversClient
        .send(QUEUE_MESSAGE.ADMIN_DELETE_DRIVER, { driverId })
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Get('deliveries')
  public async getAllDeliveries (): Promise<Delivery[]> {
    return await lastValueFrom<Delivery[]>(
      this.driversClient.send(QUEUE_MESSAGE.ADMIN_GET_DELIVERIES, {}).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Get('deliveries/pending/:id')
  public async getPendingDeliveries (
    @Param('id') driverId: string
  ): Promise<Delivery[]> {
    return await lastValueFrom<Delivery[]>(
      this.driversClient
        .send(QUEUE_MESSAGE.ADMIN_GET_DRIVER_PENDING_DELIVERIES, { driverId })
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Get('deliveries/fulfilled/:id')
  public async getAllFulfilledDeliveries (
    @Param('id') driverId: string
  ): Promise<Delivery[]> {
    return await lastValueFrom<Delivery[]>(
      this.driversClient
        .send(QUEUE_MESSAGE.ADMIN_GET_DRIVER_FULFILLED_DELIVERIES, { driverId })
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }
}
