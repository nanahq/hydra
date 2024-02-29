import {
  Body,
  Controller,
  Get,
  HttpException,
  Inject,
  Logger,
  Post,
  Put,
  UseGuards
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'

import {
  Admin,
  AdminLevel,
  CreateCouponDto,
  IRpcException,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  ResponseWithStatus,
  ResponseWithStatusAndData,
  UpdateCoupon
} from '@app/common'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { AdminClearance } from './decorators/user-level.decorator'
import { catchError, lastValueFrom } from 'rxjs'

@Controller('coupon')
export class CouponController {
  private readonly logger = new Logger(CouponController.name)
  constructor (
    @Inject(QUEUE_SERVICE.PAYMENT_SERVICE)
    private readonly paymentClient: ClientProxy
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  public async createCoupon (
    @AdminClearance([AdminLevel.SUPER_ADMIN]) admin: Admin,
      @Body() data: CreateCouponDto
  ): Promise<ResponseWithStatusAndData<string>> {
    return await lastValueFrom<ResponseWithStatusAndData<string>>(
      this.paymentClient.send(QUEUE_MESSAGE.CREATE_COUPON, data).pipe(
        catchError((error: IRpcException) => {
          this.logger.error(JSON.stringify(error))
          this.logger.error('[PIM] -> Something went wrong creating coupon')
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Put('update')
  public async updateCoupon (
    @AdminClearance([AdminLevel.SUPER_ADMIN]) admin: Admin,
      @Body() data: UpdateCoupon
  ): Promise<ResponseWithStatus> {
    return await lastValueFrom<ResponseWithStatus>(
      this.paymentClient.send(QUEUE_MESSAGE.UPDATE_COUPON, data).pipe(
        catchError((error: IRpcException) => {
          this.logger.error(JSON.stringify(error))
          this.logger.error('[PIM] -> Something went wrong updating coupon')
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  public async getAllCoupons (
    @AdminClearance([AdminLevel.SUPER_ADMIN]) admin: Admin
  ): Promise<ResponseWithStatusAndData<string>> {
    return await lastValueFrom<ResponseWithStatusAndData<string>>(
      this.paymentClient.send(QUEUE_MESSAGE.GET_ALL_COUPONS, {}).pipe(
        catchError((error: IRpcException) => {
          this.logger.error(JSON.stringify(error))
          this.logger.error('[PIM] -> Something went wrong updating coupon')
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }
}
