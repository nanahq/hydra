import { Injectable, Logger } from '@nestjs/common'
import { AbstractRepository, Coupon } from '@app/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

@Injectable()
export class CouponRepository extends AbstractRepository<Coupon> {
  protected readonly logger = new Logger(Coupon.name)

  constructor (
  @InjectModel(Coupon.name) couponModel: Model<Coupon>
  ) {
    super(couponModel)
  }
}
