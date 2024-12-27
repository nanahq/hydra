import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { AbstractDocument } from '../abstract.schema'
import { Types } from 'mongoose'

@Schema({ versionKey: false, timestamps: true })
export class FleetPayout extends AbstractDocument {
  @Prop({
    type: Types.ObjectId,
    ref: 'Driver'
  })
  public driver: string

  @Prop(Number)
    earnings: number

  @Prop({ type: Boolean, default: false })
    paid: boolean

  @Prop(Date)
    updatedAt: string

  @Prop(Date)
    createdAt: string

  @Prop({ type: [Types.ObjectId], ref: 'Delivery' })
    deliveries: string[]

  @Prop(Number)
    refId: number
}

export const FleetPayoutSchema = SchemaFactory.createForClass(FleetPayout)
