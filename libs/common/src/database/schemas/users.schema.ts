import { SchemaTypes, Types } from 'mongoose'
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { AbstractDocument, LocationCoordinates, Order } from '@app/common'

@Schema({ versionKey: false, timestamps: true })
export class User extends AbstractDocument {
  @Prop()
    firstName: string

  @Prop()
    lastName: string

  @Prop()
    email: string

  @Prop(String)
    password: string

  @Prop()
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
}

export const UserSchema = SchemaFactory.createForClass(User)
UserSchema.index({ location: '2dsphere' })
