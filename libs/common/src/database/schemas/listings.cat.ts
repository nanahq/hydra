import { SchemaTypes } from 'mongoose'
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { AbstractDocument } from '@app/common'

@Schema({ versionKey: false })
export class ListingCategory extends AbstractDocument {
  @Prop(String)
    name: string

  @Prop([String])
    tags: string[]

  @Prop(SchemaTypes.Boolean)
    isLive: boolean
}

export const ListingCategorySchema = SchemaFactory.createForClass(ListingCategory)
