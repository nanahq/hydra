import { SchemaTypes, Types } from 'mongoose'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { AbstractDocument } from '@app/common'

@Schema({
  versionKey: false,
  timestamps: true
})
export class AddressBook extends AbstractDocument {
  @Prop({
    type: Types.ObjectId,
    ref: 'User'
  })
    userId: string

  @Prop({
    type: Types.ObjectId,
    ref: 'AddressBookLabel'
  })
    labelId: string

  @Prop()
    labelName: string

  @Prop()
    address: string

  @Prop(String)
    plot_number?: string

  @Prop(String)
    house_number?: string

  @Prop()
    street_address: string

  @Prop({
    type: {
      coordinates: [Number]
    }
  })
    location: {
    coordinates: [string, string]
  }

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

export const AddressBookSchema = SchemaFactory.createForClass(AddressBook)
