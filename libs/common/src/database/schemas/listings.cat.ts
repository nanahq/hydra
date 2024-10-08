import { SchemaTypes, Types } from 'mongoose'
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { AbstractDocument } from '@app/common'

@Schema({ versionKey: false, timestamps: true })
export class ListingCategory extends AbstractDocument {
  @Prop({ type: Types.ObjectId, ref: 'Vendor' })
    vendor: string

  @Prop(String)
    name: string

  @Prop([String])
    tags: string[]

  @Prop(SchemaTypes.Boolean)
    isLive: boolean

  @Prop({ type: [Types.ObjectId], ref: 'ListingMenu' })
    listingsMenu: any[]

  @Prop({ type: String, default: 'ON_DEMAND' })
    type: 'PRE_ORDER' | 'ON_DEMAND'

  @Prop({ type: Boolean, default: false })
    isDeleted: boolean

  @Prop(SchemaTypes.Date)
    createdAt: string

  @Prop(SchemaTypes.Date)
    updatedAt: string

  @Prop({ type: Boolean, default: false })
    nextDayDelivery: boolean
}

export const ListingCategorySchema =
  SchemaFactory.createForClass(ListingCategory)
