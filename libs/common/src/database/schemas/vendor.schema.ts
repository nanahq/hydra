import { SchemaTypes } from 'mongoose'
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { AbstractDocument } from '@app/common'

@Schema({ versionKey: false })
export class Vendor extends AbstractDocument {
  @Prop()
    firstName: string

  @Prop()
    lastName: string

  @Prop({ unique: true, sparse: true })
    email: string

  @Prop({ unique: true, sparse: true })
    businessEmail: string

  @Prop()
    password: string

  @Prop({ unique: true })
    phone: string

  @Prop({ default: false })
    isValidated: boolean

  @Prop(SchemaTypes.Date)
    createdAt: string

  @Prop(SchemaTypes.Date)
    updatedAt: string

  @Prop(String)
    status: 'ONLINE' | 'OFFLINE'

  @Prop({
    type: String
  })
    businessName: string

  @Prop({
    type: String
  })
    businessLogo: string

  @Prop({
    type: String
  })
    businessAddress: string

  @Prop({ type: Boolean, default: false })
    isDeleted: boolean

  @Prop({
    type: {
      coordinates: [String]
    }
  })
    location: {
    coordinates: [string, string]
  }
}

export const VendorSchema = SchemaFactory.createForClass(Vendor)
