import { SchemaTypes, Types } from 'mongoose'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { AbstractDocument } from '@app/common'

@Schema({
  versionKey: false,
  timestamps: true
})
export class ScheduledListingNotification extends AbstractDocument {
  @Prop({
    type: [Types.ObjectId],
    ref: 'User'
  })
    subscribers: string[]

  @Prop(
    {
      type: Types.ObjectId,
      ref: 'Vendor'
    }
  )
    vendor: string

  @Prop({
    type: Boolean,
    default: true
  })
    enabledByVendor: boolean

  @Prop(SchemaTypes.Date)
    createdAt: string

  @Prop(SchemaTypes.Date)
    updatedAt: string
}

export const ScheduledListingNotificationSchema =
    SchemaFactory.createForClass(ScheduledListingNotification)
