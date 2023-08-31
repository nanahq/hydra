import { SchemaTypes, Types } from 'mongoose'
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import {
  AbstractDocument,
  DriverType,
  LocationCoordinates,
  Order
} from '@app/common'


@Schema({ versionKey: false, timestamps: true })
export class Driver extends AbstractDocument {
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
  location: LocationCoordinates;

  @Prop({ type: [Types.ObjectId], ref: 'Order' })
    trips: Order[]

  @Prop({ type: Boolean, default: false })
    isDeleted: false

  @Prop(String)
    state: string

  @Prop({ type: Boolean, default: true })
    available: boolean

  @Prop(String)
    type: DriverType
}

export const DriverSchema = SchemaFactory.createForClass(Driver)
DriverSchema.index({ location: '2dsphere' })
