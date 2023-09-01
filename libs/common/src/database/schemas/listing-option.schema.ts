import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { AbstractDocument, ListingOption } from '@app/common'
import { SchemaTypes } from 'mongoose'

@Schema({ versionKey: false })
export class ListingOptionGroup extends AbstractDocument {
  @Prop(SchemaTypes.ObjectId)
    vendorId: string

  @Prop({ type: SchemaTypes.String })
    name: string

  @Prop({ type: SchemaTypes.Number })
    min: number

  @Prop({ type: SchemaTypes.Number })
    max: number

  @Prop({ type: Boolean, default: false })
    isDeleted: boolean

  @Prop({ type: [{ name: SchemaTypes.String, price: SchemaTypes.Number }] })
    options: ListingOption[]
}

export const ListingOptionGroupSchema =
  SchemaFactory.createForClass(ListingOptionGroup)
