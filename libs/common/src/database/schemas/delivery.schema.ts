import { SchemaTypes, Types } from 'mongoose'
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { AbstractDocument, LocationCoordinates, OrderStatus } from '@app/common'

@Schema({ versionKey: false, timestamps: true })
export class Delivery extends AbstractDocument {
  @Prop({ type: Types.ObjectId, ref: 'User' })
    user: string

  @Prop({ type: Types.ObjectId, ref: 'Driver' })
    driver: string

  @Prop({ type: Types.ObjectId, ref: 'Order' })
    order: string

  @Prop({ type: Types.ObjectId, ref: 'ListingMenu' })
    listing: string

  @Prop({ type: Types.ObjectId, ref: 'Vendor' })
    vendor: string

  @Prop(SchemaTypes.Date)
    createdAt: string

  @Prop(SchemaTypes.Date)
    updatedAt: string

  @Prop({ type: String, default: OrderStatus.PROCESSED })
    status: string

  @Prop({
    type: {
      coordinates: [String]
    }
  })
    pickupLocation: LocationCoordinates

  @Prop({
    type: {
      coordinates: [String]
    }
  })
    dropOffLocation: LocationCoordinates

  @Prop({ type: Boolean, default: false })
    completed: boolean

  @Prop({ type: Boolean, default: false })
    deliveredWithinTime: boolean

  @Prop({ type: Number })
    deliveryTime: number
}

export const DeliverySchema = SchemaFactory.createForClass(Delivery)
