import { Controller, Delete, Get, HttpException, Inject, Param, Patch } from '@nestjs/common'
import { Driver, IRpcException, QUEUE_MESSAGE, QUEUE_SERVICE, ResponseWithStatus } from '@app/common'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'

@Controller('driver')
export class DriversController {
  constructor (
    @Inject(QUEUE_SERVICE.DRIVER_SERVICE)
    private readonly driversClient: ClientProxy
  ) {}

  @Get('drivers')
  public async getDrivers (): Promise<Driver[]> {
    return await lastValueFrom<Driver[]>(
      this.driversClient.send(QUEUE_MESSAGE.ADMIN_GET_DRIVERS, {})
        .pipe(catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        }))
    )
  }

  @Get('drivers/free')
  public async getFreeDrivers (): Promise<Driver[]> {
    return await lastValueFrom<Driver[]>(
      this.driversClient.send(QUEUE_MESSAGE.ADMIN_GET_FREE_DRIVERS, {})
        .pipe(catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        }))
    )
  }

  @Patch('approve/:id')
  public async approveDriver (
    @Param('id') driverId: string
  ): Promise<ResponseWithStatus> {
    return await lastValueFrom<ResponseWithStatus>(
      this.driversClient.send(QUEUE_MESSAGE.ADMIN_APPROVE_DRIVER, { driverId })
        .pipe(catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        }))
    )
  }

  @Patch('reject/:id')
  public async rejectDriver (
    @Param('id') driverId: string
  ): Promise<ResponseWithStatus> {
    return await lastValueFrom<ResponseWithStatus>(
      this.driversClient.send(QUEUE_MESSAGE.ADMIN_REJECT_DRIVER, { driverId })
        .pipe(catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        }))
    )
  }

  @Delete('delete/:id')
  public async deleteDriver (
    @Param('id') driverId: string
  ): Promise<ResponseWithStatus> {
    return await lastValueFrom<ResponseWithStatus>(
      this.driversClient.send(QUEUE_MESSAGE.ADMIN_DELETE_DRIVER, { driverId })
        .pipe(catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        }))
    )
  }
}
