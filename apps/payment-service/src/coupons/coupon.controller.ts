import { Controller, UseFilters } from '@nestjs/common'
import {
  Coupon, CouponRedeemResponse,
  CreateCouponDto,
  ExceptionFilterRpc, GetCoupon,
  QUEUE_MESSAGE,
  ResponseWithStatus,
  ResponseWithStatusAndData,
  RmqService, ServicePayload, UpdateCoupon, UpdateCouponUsage
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

  @MessagePattern(QUEUE_MESSAGE.GET_ALL_COUPONS)
  async getAllCoupons (
    @Ctx() context: RmqContext
  ): Promise<Coupon[]> {
    try {
      return await this.couponService.getAllCoupons()
    } catch (e) {
      throw new RpcException(e)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @EventPattern(QUEUE_MESSAGE.UPDATE_COUPON_USAGE)
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

  @MessagePattern(QUEUE_MESSAGE.REDEEM_COUPON)
  async redeemCoupon (
    @Payload() data: ServicePayload<{ couponCode: string }>,
      @Ctx() context: RmqContext
  ): Promise<CouponRedeemResponse> {
    try {
      return await this.couponService.redeemCoupon(data)
    } catch (e) {
      throw new RpcException(e)
    } finally {
      this.rmqService.ack(context)
    }
  }
}
