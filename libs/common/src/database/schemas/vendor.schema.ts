import { SchemaTypes, Types } from 'mongoose'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { AbstractDocument, VendorApprovalStatus } from '@app/common'

@Schema({
  versionKey: false,
  timestamps: true
})
export class Vendor extends AbstractDocument {
  @Prop()
    firstName: string

  @Prop()
    lastName: string

  @Prop({
    unique: true,
    sparse: true
  })
    email: string

  @Prop({
    unique: true,
    sparse: true
  })
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

  @Prop(String)
    acc_status: VendorApprovalStatus

  @Prop({ type: String })
    rejection_reason: string

  @Prop({ type: String })
    businessName: string

  @Prop({
    type: String
  })
    hello: string

  @Prop({
    type: String
  })
    businessLogo: string

  @Prop({
    type: String
  })
    businessAddress: string

  @Prop(String)
    restaurantImage: string

  @Prop({
    type: Boolean,
    default: false
  })
    isDeleted: boolean

  @Prop({
    type: {
      coordinates: [String]
    }
  })
    location: {
    coordinates: [string, string]
  }

  @Prop({
    type: Types.ObjectId,
    ref: 'VendorSettings'
  })
    settings: any

  @Prop({ type: String })
    expoNotificationToken: string
}

export const VendorSchema = SchemaFactory.createForClass(Vendor)
