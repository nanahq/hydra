import { HttpStatus, Injectable } from '@nestjs/common'
import { CouponRepository } from './coupon.repository'
import {
  Coupon,
  CreateCouponDto,
  FitRpcException,
  GetCoupon,
  RandomGen,
  ResponseWithStatus,
  ResponseWithStatusAndData, UpdateCoupon, UpdateCouponUsage
} from '@app/common'

@Injectable()
export class CouponService {
  private readonly MAX_COUPON_LENGTH = 7
  constructor (
    private readonly couponRepository: CouponRepository
  ) {
  }

  public async createNewCoupon (data: CreateCouponDto): Promise<ResponseWithStatusAndData<string>> {
    const hasSuffix = data.suffix !== undefined

    const length = this.MAX_COUPON_LENGTH - Number(data?.suffix?.length ?? 0)

    let couponString: string

    if (hasSuffix) {
      couponString = RandomGen.genRandomString(100, length).trim() + String(data?.suffix?.trim()).toUpperCase()
    } else {
      couponString = RandomGen.generateAlphanumericString(this.MAX_COUPON_LENGTH)
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

  public async getCoupon ({ code }: GetCoupon): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({ code })

    if (coupon === null) {
      throw new FitRpcException('Invalid Coupon', HttpStatus.NOT_FOUND)
    }

    return coupon
  }

  public async updateCouponUsage (data: UpdateCouponUsage): Promise<void> {
    const coupon = await this.couponRepository.findOne({ code: data.code }) as Coupon | null

    if (coupon === null) {
      throw new FitRpcException('Invalid Coupon', HttpStatus.NOT_FOUND)
    }
    await this.couponRepository.findOneAndUpdate({ _id: coupon._id }, { users: [...coupon.users, data.user] })
  }
}
