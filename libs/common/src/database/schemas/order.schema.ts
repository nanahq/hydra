import { SchemaTypes, Types } from 'mongoose'
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { AbstractDocument, OrderStatus, User, OrderBreakDown } from '@app/common'

@Schema({ versionKey: false })
export class Order extends AbstractDocument {
  @Prop({
    type: Types.ObjectId,
    ref: User.name
  })
    userId: string

  @Prop({
    type: SchemaTypes.ObjectId
  })
    listingsId: string

  @Prop({
    type: SchemaTypes.ObjectId
  })
    vendorId: string

  @Prop({
    type: Number
  })
    totalOrderValue: number

  @Prop({
    type: Number
  })
    orderValuePayable: number

  @Prop({
    type: String
  })
    deliveryAddess: string

  @Prop({ type: String })
    primaryContact: string

  @Prop({ default: false, type: Boolean })
    isThirdParty: boolean

  @Prop(SchemaTypes.Date)
    createdAt: string

  @Prop(SchemaTypes.Date)
    updatedAt: string

  @Prop(Number)
    refId: number

  @Prop([String])
    options: string[]

  @Prop({
    type: String
  })
    orderStatus: OrderStatus

  @Prop({
    type: {
      orderCost: Number,
      systemFee: Number,
      deliveryFee: Number,
      vat: Number
    }
  })
    orderBreakDown: OrderBreakDown
}

export const OrderSchema = SchemaFactory.createForClass(Order)
