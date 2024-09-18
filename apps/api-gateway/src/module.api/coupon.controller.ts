import {
  Body,
  Controller,
  Get,
  HttpException,
  Inject,
  Post,
  UseGuards
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import {
  CouponRedeemResponse,
  CurrentUser,
  IRpcException,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  ServicePayload,
  User
} from '@app/common'
import { catchError, lastValueFrom } from 'rxjs'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'

@Controller('coupon')
export class CouponController {
  constructor (
    @Inject(QUEUE_SERVICE.PAYMENT_SERVICE)
    private readonly paymentServiceClient: ClientProxy
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('redeem')
  async redeemCoupon (
    @Body() { couponCode }: { couponCode: string },
      @CurrentUser() user: User
  ): Promise<CouponRedeemResponse> {
    const servicePayload: ServicePayload<{ couponCode: string }> = {
      userId: user._id as any,
      data: {
        couponCode
      }
    }
    return await lastValueFrom<CouponRedeemResponse>(
      this.paymentServiceClient
        .send(QUEUE_MESSAGE.REDEEM_COUPON, servicePayload)
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Get('ping')
  async ping (): Promise<string> {
    return 'Coupon Controller PONG'
  }
}
