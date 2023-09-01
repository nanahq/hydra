import { SchemaTypes, Types } from 'mongoose'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { AbstractDocument } from '@app/common'
import { ListingApprovalStatus } from '@app/common/typings/ListingApprovalStatus.enum'

@Schema({ versionKey: false })
export class ListingMenu extends AbstractDocument {
  @Prop({
    type: Types.ObjectId,
    ref: 'Vendor'
  })
    vendor: string

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

  @Prop(String)
    status: ListingApprovalStatus

  @Prop(String)
    rejection_reason: string

  @Prop({
    type: Boolean,
    default: false
  })
    isDeleted: boolean

  @Prop({
    type: [Types.ObjectId],
    ref: 'Review'
  })
    reviews: string

  @Prop({
    type: [Types.ObjectId],
    ref: 'ListingOptionGroup'
  })
    optionGroups: any

  @Prop(SchemaTypes.Date)
    createdAt: string

  @Prop(SchemaTypes.Date)
    updatedAt: string
}

export const ListingMenuSchema = SchemaFactory.createForClass(ListingMenu)
