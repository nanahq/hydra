import { SchemaTypes } from 'mongoose'
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { AbstractDocument } from '@app/common'

@Schema({ versionKey: false })
export class Review extends AbstractDocument {
  @Prop(String)
    reviewBody: string

  @Prop(SchemaTypes.ObjectId)
    listingId: string

  @Prop(SchemaTypes.ObjectId)
    vendorId: string

  @Prop(Number)
    reviewStars: number

  @Prop(SchemaTypes.ObjectId)
    orderId: string

  @Prop(String)
    reviewerName: string

  @Prop(SchemaTypes.Date)
    createdAt: string
}

export const ReviewSchema = SchemaFactory.createForClass(Review)
