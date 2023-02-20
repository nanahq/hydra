import { SchemaTypes } from 'mongoose'
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { AbstractDocument } from '@app/common'
import { ListingCategory } from '@app/common/database/schemas/listings.cat'
import { ListingOptionGroup } from '@app/common/database/schemas/listing-option.schema'

@Schema({ versionKey: false })
export class ListingMenu extends AbstractDocument {
  @Prop(String)
    name: string

  @Prop(String)
    desc: string

  @Prop(String)
    price: string

  @Prop(String)
    serving: string

  @Prop(String)
    photo: string

  @Prop(Boolean)
    isLive: boolean

  @Prop(Boolean)
    isAvailable: boolean

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: ListingCategory.name
  })
    category: any

  @Prop([{
    type: SchemaTypes.ObjectId,
    ref: ListingOptionGroup.name
  }])
    optionGroups: string
}

export const ListingMenuSchema = SchemaFactory.createForClass(ListingMenu)
