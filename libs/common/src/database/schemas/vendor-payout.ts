import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { AbstractDocument } from '../abstract.schema'
import { Types } from 'mongoose'

@Schema({ versionKey: false, timestamps: true })
export class VendorPayout extends AbstractDocument {
  @Prop({
    type: Types.ObjectId,
    ref: 'Vendor'
  })
  public vendor: string

  @Prop(Number)
    earnings: number

  @Prop({ type: Boolean, default: false })
    paid: boolean

  @Prop(Date)
    updatedAt: string

  @Prop(Date)
    createdAt: string

  @Prop({ type: [Types.ObjectId], ref: 'Order' })
    orders: string[]

  @Prop(Number)
    refId: number
}

export const VendorPayoutSchema = SchemaFactory.createForClass(VendorPayout)
