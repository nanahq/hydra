import { SchemaTypes, Types } from 'mongoose'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { AbstractDocument } from '@app/common'

@Schema({
  versionKey: false,
  timestamps: true
})
export class AddressBookLabel extends AbstractDocument {
  @Prop({
    type: Types.ObjectId,
    ref: 'User'
  })
    createdBy: string

  @Prop()
    name: string

  @Prop()
    desc?: string

  @Prop({
    type: Boolean,
    default: false
  })
    isDeleted: boolean

  @Prop(SchemaTypes.Date)
    createdAt: string

  @Prop(SchemaTypes.Date)
    updatedAt: string
}

export const AddressBookLabelSchema = SchemaFactory.createForClass(AddressBookLabel)
