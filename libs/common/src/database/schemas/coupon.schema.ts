import { SchemaTypes } from 'mongoose'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { AbstractDocument, CouponType } from '@app/common'

@Schema({ versionKey: false })
export class Coupon extends AbstractDocument {
  @Prop(String)
    code: string

  @Prop(Boolean)
    useOnce: boolean

  @Prop([String])
    users: string[]

  @Prop({ type: Boolean, default: false })
    expired: boolean

  @Prop(String)
    type: CouponType

  @Prop(Number)
    value?: number

  @Prop(Number)
    percentage?: number

  @Prop(SchemaTypes.Date)
    validFrom: string

  @Prop(SchemaTypes.Date)
    validTill: string

  @Prop(SchemaTypes.Date)
    createdAt: string

  @Prop(SchemaTypes.Date)
    updatedAt: string
}

export const CouponSchema = SchemaFactory.createForClass(Coupon)
