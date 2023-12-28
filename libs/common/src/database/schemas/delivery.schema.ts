import { SchemaTypes, Types } from 'mongoose'
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import {
  AbstractDocument,
  LocationCoordinates,
  OrderStatus, OrderType
} from '@app/common'

@Schema({ versionKey: false, timestamps: true })
export class Delivery extends AbstractDocument {
  @Prop({ type: Types.ObjectId, ref: 'User' })
    user: string

  @Prop({ type: Types.ObjectId, ref: 'Driver' })
    driver: string

  @Prop({ type: Types.ObjectId, ref: 'Order' })
    order: string

  @Prop({ type: [Types.ObjectId], ref: 'ListingMenu' })
    listing: string[]

  @Prop({ type: Types.ObjectId, ref: 'Vendor' })
    vendor: string

  @Prop(SchemaTypes.Date)
    createdAt: string

  @Prop(SchemaTypes.Date)
    updatedAt: string

  @Prop({ type: String, default: OrderStatus.PAYMENT_PENDING })
    status: string

  @Prop({
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0] // Default coordinates here
    }
  })
    pickupLocation: LocationCoordinates

  @Prop({
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0] // Default coordinates here
    }
  })
    currentLocation: LocationCoordinates

  @Prop({
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0] // Default coordinates here
    }
  })
    dropOffLocation: LocationCoordinates

  @Prop({ type: Boolean, default: false })
    completed: boolean

  @Prop({ type: Boolean, default: false })
    deliveredWithinTime: boolean

  @Prop({ type: Date })
    deliveryTime: string

  @Prop({ type: Boolean, default: false })
    assignedToDriver: boolean

  @Prop(String)
    deliveryType: OrderType

  @Prop({ type: Boolean, default: false })
    driverAccepted: boolean

  @Prop({
    type: {
      distance: Number,
      travelTime: Number
    }
  })
    travelMeta: {
    distance: number
    travelTime: number
  }
}

export const DeliverySchema = SchemaFactory.createForClass(Delivery)
DeliverySchema.index({ dropOffLocation: '2dsphere', pickupLocation: '2dsphere' })
