import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator'
import { Coupon, CouponType } from '@app/common'

export class CreateCouponDto {
  @IsNotEmpty()
  @IsString()
    validFrom: string

  @IsNotEmpty()
  @IsString()
    validTill: string

  @IsNotEmpty()
  @IsBoolean()
    useOnce: boolean

  @IsNumber()
  @IsOptional()
    percentage?: number

  @IsString()
    type: CouponType

  @IsNumber()
  @IsOptional()
    value?: number

  @IsOptional()
  @IsString()
    suffix?: string

  @IsOptional()
  @IsString()
    code?: string
}

export class UpdateCoupon {
  @IsOptional()
  @IsDateString({ strict: false })
    validFrom?: string

  @IsOptional()
  @IsDateString({ strict: false })
    validTill?: string

  @IsOptional()
  @IsBoolean()
    expired?: boolean

  @IsNotEmpty()
  @IsString()
    _id: string
}

export class GetCoupon implements Partial<Coupon> {
  @IsNotEmpty()
  @IsString()
    code: string
}

export class UpdateCouponUsage {
  @IsNotEmpty()
  @IsString()
    code: string

  @IsNotEmpty()
  @IsString()
    user: string
}
