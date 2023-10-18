import { SchemaTypes, Types } from 'mongoose'
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { AbstractDocument } from '@app/common'

@Schema({ versionKey: false, timestamps: true })
export class ScheduledListing extends AbstractDocument {
  @Prop({ type: Types.ObjectId, ref: 'ListingMenu' })
    listing: string

  @Prop({ type: Types.ObjectId, ref: 'Vendor' })
    vendor: string

  @Prop(Number)
    quantity: number

  @Prop(Number)
    availableDate: number

  @Prop(SchemaTypes.Date)
    createdAt: string

  @Prop(SchemaTypes.Date)
    updatedAt: string

  @Prop({type: SchemaTypes.Boolean, default: false })
    soldOut: boolean
}

export const ScheduledListingSchema = SchemaFactory.createForClass(ScheduledListing)
