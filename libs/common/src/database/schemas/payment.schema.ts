import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { AbstractDocument } from '../abstract.schema'
import { Types } from 'mongoose'
import { PaymentDetails } from '@app/common'

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
  type: PaymentDetails

  @Prop(String)
  accountNumber: string

  @Prop(Number)
    chargedAmount: number

  @Prop(Date)
    updatedAt: string

  @Prop(Date)
    createdAt: string

  @Prop(Number)
    refId: number
}

export const PaymentHistorySchema = SchemaFactory.createForClass(Payment)
