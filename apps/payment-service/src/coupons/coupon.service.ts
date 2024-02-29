import { HttpStatus, Injectable, Inject } from '@nestjs/common'
import { CouponRepository } from './coupon.repository'
import {
  Coupon,
  CouponI,
  CouponRedeemResponse,
  CreateCouponDto,
  FitRpcException,
  GetCoupon,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  RandomGen,
  ResponseWithStatus,
  ResponseWithStatusAndData,
  ServicePayload,
  UpdateCoupon,
  UpdateCouponUsage
} from '@app/common'
import * as moment from 'moment'
import { ClientProxy } from '@nestjs/microservices'
import { lastValueFrom } from 'rxjs'
@Injectable()
export class CouponService {
  private readonly MAX_COUPON_LENGTH = 7
  constructor (
    private readonly couponRepository: CouponRepository,

    @Inject(QUEUE_SERVICE.USERS_SERVICE)
    private readonly userClient: ClientProxy
  ) {}

  public async createNewCoupon (
    data: CreateCouponDto
  ): Promise<ResponseWithStatusAndData<string>> {
    const hasSuffix = data.suffix !== undefined

    const length = this.MAX_COUPON_LENGTH - Number(data?.suffix?.length ?? 0)

    let couponString: string

    if (hasSuffix) {
      couponString =
        RandomGen.genRandomString(100, length).trim() +
        String(data?.suffix?.trim()).toUpperCase()
    } else {
      couponString = RandomGen.generateAlphanumericString(
        this.MAX_COUPON_LENGTH
      )
    }

    await this.couponRepository.create({
      ...data,
      code: couponString
    })

    return {
      status: 1,
      data: couponString
    }
  }

  public async updateCoupon (data: UpdateCoupon): Promise<ResponseWithStatus> {
    const { _id, ...rest } = data
    await this.couponRepository.findOneAndUpdate({ _id }, { ...rest })
    return { status: 1 }
  }

  public async getAllCoupons (): Promise<Coupon[]> {
    return await this.couponRepository.find({})
  }

  public async getCoupon ({ code }: GetCoupon): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({ code })

    if (coupon === null) {
      throw new FitRpcException('Invalid Coupon', HttpStatus.NOT_FOUND)
    }

    return coupon
  }

  public async updateCouponUsage (data: UpdateCouponUsage): Promise<void> {
    const coupon = (await this.couponRepository.findOne({
      code: data.code
    })) as Coupon | null

    if (coupon === null) {
      throw new FitRpcException('Invalid Coupon', HttpStatus.NOT_FOUND)
    }
    await this.couponRepository.findOneAndUpdate(
      { _id: coupon._id },
      { users: [...coupon.users, data.user] }
    )
  }

  public async redeemCoupon ({
    data,
    userId
  }: ServicePayload<{ couponCode: string }>): Promise<CouponRedeemResponse> {
    const genericError = {
      coupon: undefined,
      status: 'ERROR'
    } as any

    const coupon = (await this.couponRepository.findOne({
      code: data.couponCode
    })) as CouponI | null

    if (coupon === null) {
      return {
        ...genericError,
        message: 'This is not a valid coupon'
      }
    }

    const today = moment()

    const validFrom = moment(coupon.validFrom)
    const validTill = moment(coupon.validTill)

    if (today.isBefore(validFrom)) {
      return {
        ...genericError,
        message: `This coupon is redeemable from ${validFrom.format(
          'DDD MM YYYY'
        )}`
      }
    }

    if (today.isAfter(validTill) || coupon.expired) {
      return {
        ...genericError,
        message: 'This coupon has expired'
      }
    }

    if (coupon.useOnce && coupon.users.includes(userId.toString())) {
      return {
        ...genericError,
        message: 'You have already use this coupon. It can not be used twice'
      }
    }

    const payload: ServicePayload<{ couponId: string }> = {
      userId,
      data: {
        couponId: coupon._id
      }
    }
    await lastValueFrom(
      this.userClient.send(QUEUE_MESSAGE.USER_ADD_COUPON, payload)
    )

    return {
      coupon,
      status: 'OK',
      message: 'success!'
    }
  }
}
