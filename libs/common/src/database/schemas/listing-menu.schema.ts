import { Types, SchemaTypes } from 'mongoose'
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { AbstractDocument } from '@app/common'
import { ListingOptionGroup } from '@app/common/database/schemas/listing-option.schema'

@Schema({ versionKey: false })
export class ListingMenu extends AbstractDocument {
  @Prop(Types.ObjectId)
    vendorId: string

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

  @Prop({ type: Boolean, default: false })
    isDeleted: boolean

  @Prop({
    type: [Types.ObjectId],
    ref: "ListingOptionGroup"
  })
    optionGroups: any

  @Prop(SchemaTypes.Date)
    createdAt: string

  @Prop(SchemaTypes.Date)
    updatedAt: string
}

export const ListingMenuSchema = SchemaFactory.createForClass(ListingMenu)
