import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { AbstractDocument } from '../abstract.schema'
import { Types } from 'mongoose'
@Schema({ versionKey: false, timestamps: true })
export class Payment extends AbstractDocument {
  @Prop({
    type: Types.ObjectId,
    ref: 'User'
  })
  public user: string

  @Prop({
    type: Types.ObjectId,
    ref: 'Order'
  })
  public order: string

  @Prop(String)
    type: string

  @Prop(String)
    status: string

  @Prop(String)
    chargedAmount: string

  @Prop(Date)
    updatedAt: string

  @Prop(Date)
    createdAt: string

  @Prop(String)
    refId: string

  @Prop(String)
    paymentId: string

  @Prop(String)
    paymentMeta: string
}

export const PaymentHistorySchema = SchemaFactory.createForClass(Payment)
