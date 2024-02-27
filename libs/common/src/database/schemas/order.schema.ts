import { SchemaTypes, Types } from 'mongoose'
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import {
  AbstractDocument,
  OrderStatus,
  OrderBreakDown,
  OrderType,
  LocationCoordinates,
  OrderOptions
} from '@app/common'

@Schema({ versionKey: false, timestamps: true })
export class Order extends AbstractDocument {
  @Prop({
    type: Types.ObjectId,
    ref: 'User'
  })
    user: string

  @Prop({
    type: [Types.ObjectId],
    ref: 'ListingMenu'
  })
    listing: string[]

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
    deliveryAddress: string

  @Prop({ type: String })
    primaryContact: string

  @Prop({ default: false, type: Boolean })
    isThirdParty: boolean

  @Prop({ default: '', type: String })
    thirdPartyName?: string

  @Prop(SchemaTypes.Date)
    createdAt: string

  @Prop(SchemaTypes.Date)
    updatedAt: string

  @Prop(Number)
    refId: number

  @Prop({
    type: [{
      listing: Types.ObjectId,
      options: [String]
    }]
  })
    options: OrderOptions[]

  @Prop(String)
    orderType: OrderType

  @Prop({
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  })
    preciseLocation: LocationCoordinates

  @Prop({
    type: [{
      listing: Types.ObjectId,
      quantity: Number
    }]
  })
    quantity: [{
    listing: string
    quantity: number
  }]

  @Prop(String)
    specialNote: string

  @Prop({
    type: String
  })
    orderStatus: OrderStatus

  @Prop(Date)
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

  @Prop(String)
    txRefId: string

  @Prop({ type: String, nullable: true })
    coupon?: string
}

export const OrderSchema = SchemaFactory.createForClass(Order)
