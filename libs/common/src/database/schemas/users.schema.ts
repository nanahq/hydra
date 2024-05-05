import { SchemaTypes, Types } from 'mongoose'
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { AbstractDocument, LocationCoordinates, Order } from '@app/common'

@Schema({ versionKey: false, timestamps: true })
export class User extends AbstractDocument {
  @Prop(String)
    firstName: string

  @Prop(String)
    lastName: string

  @Prop({ type: String, unique: true })
    email: string

  @Prop(String)
    password: string

  @Prop({ type: String, unique: true })
    phone: string

  @Prop({ default: false })
    isValidated: boolean

  @Prop(SchemaTypes.Date)
    createdAt: string

  @Prop(SchemaTypes.Date)
    updatedAt: string

  @Prop({ type: String, default: 'ONLINE' })
    status: 'ONLINE' | 'OFFLINE'

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
    location: LocationCoordinates

  @Prop({ type: [Types.ObjectId], ref: 'Order' })
    orders: Order[]

  @Prop({ type: Boolean, default: false })
    isDeleted: false

  @Prop({ type: String })
    expoNotificationToken: string

  @Prop({ type: String })
    paystack_customer_id?: string

  @Prop({ type: String })
    paystack_titan?: string

  @Prop({ type: [Types.ObjectId], ref: 'Coupon' })
    coupons?: string[]

  @Prop({ type: [Types.ObjectId], ref: 'ListingMenu' })
    favourites?: string[]
}

export const UserSchema = SchemaFactory.createForClass(User)
UserSchema.index({ location: '2dsphere' })
