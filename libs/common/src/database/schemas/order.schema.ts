import { SchemaTypes, Types } from 'mongoose'
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { AbstractDocument, OrderStatus, OrderBreakDown, OrderType } from '@app/common'

@Schema({ versionKey: false })
export class Order extends AbstractDocument {
  @Prop({
    type: Types.ObjectId,
    ref: 'User'
  })
    user: string

  @Prop({
    type: Types.ObjectId,
    ref: 'ListingMenu'
  })
    listing: string

  @Prop({
    type: Types.ObjectId,
    ref: 'Vendor'
  })
    vendor: string

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

  @Prop(String)
    orderType: OrderType

  @Prop({
    type: {
      coordinates: [String]
    }
  })
    preciseLocation: {
    coordinates: [string, string]
  }

  @Prop({
    type: String
  })
    orderStatus: OrderStatus

  @Prop(String)
    orderDeliveryScheduledTime: string

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
