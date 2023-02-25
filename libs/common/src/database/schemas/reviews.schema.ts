import { SchemaTypes, Types } from 'mongoose'
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { AbstractDocument, ListingMenu, Order, Vendor } from '@app/common'

@Schema({ versionKey: false, timestamps: true })
export class Review extends AbstractDocument {
  @Prop(String)
    reviewBody: string

  @Prop({ type: Types.ObjectId, ref: "ListingMenu" })
    listingId: string

  @Prop({ type: Types.ObjectId, ref: "Vendor" })
    vendorId: string

  @Prop(Number)
    reviewStars: number

  @Prop({ type: Types.ObjectId, ref: "Order" })
    orderId: string

  @Prop(String)
    reviewerName: string

  @Prop(SchemaTypes.Date)
    createdAt: string

  @Prop(SchemaTypes.Date)
    updatedAt: string
}

export const ReviewSchema = SchemaFactory.createForClass(Review)
