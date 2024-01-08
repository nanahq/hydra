import { Controller, UseFilters } from '@nestjs/common'
import {
  Coupon,
  CreateCouponDto,
  ExceptionFilterRpc, GetCoupon,
  QUEUE_MESSAGE,
  ResponseWithStatus,
  ResponseWithStatusAndData,
  RmqService, UpdateCoupon, UpdateCouponUsage
} from '@app/common'
import { CouponService } from './coupon.service'
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext, RpcException } from '@nestjs/microservices'

@UseFilters(new ExceptionFilterRpc())
@Controller('coupon')
export class CouponController {
  constructor (
    private readonly couponService: CouponService,
    private readonly rmqService: RmqService
  ) {}

  @MessagePattern(QUEUE_MESSAGE.CREATE_COUPON)
  async createCoupon (
    @Payload() data: CreateCouponDto,
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatusAndData<string>> {
    try {
      return await this.couponService.createNewCoupon(data)
    } catch (e) {
      throw new RpcException(e)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_COUPON_BY_CODE)
  async getCoupon (
    @Payload() data: GetCoupon,
      @Ctx() context: RmqContext
  ): Promise<Coupon> {
    try {
      return await this.couponService.getCoupon(data)
    } catch (e) {
      throw new RpcException(e)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.UPDATE_COUPON)
  async updateCoupon (
    @Payload() data: UpdateCoupon,
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return await this.couponService.updateCoupon(data)
    } catch (e) {
      throw new RpcException(e)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @EventPattern(QUEUE_MESSAGE.UPDATE_COUPON)
  async updateCouponUsage (
    @Payload() data: UpdateCouponUsage,
      @Ctx() context: RmqContext
  ): Promise<void> {
    try {
      await this.couponService.updateCouponUsage(data)
    } catch (e) {
      throw new RpcException(e)
    } finally {
      this.rmqService.ack(context)
    }
  }
}
