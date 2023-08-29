import { Types } from 'mongoose'
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import {
  AbstractDocument,
  PaymentInfo,
  VendorOperationSetting
} from '@app/common'

@Schema({ versionKey: false, timestamps: true })
export class VendorSettings extends AbstractDocument {
  @Prop({ type: Types.ObjectId, ref: 'Vendor' })
    vendor: string

  @Prop({
    type: {
      startTime: String,
      cutoffTime: String,
      placementTime: String,
      minOrder: Number,
      preparationTime: Number,
      deliveryType: String
    },
    nullable: true
  })
    operations: VendorOperationSetting

  @Prop({
    type: {
      bankName: String,
      bankAccountName: String,
      bankAccountNumber: String
    },
    nullable: true
  })
    payment: PaymentInfo
}

export const VendorSettingsSchema =
  SchemaFactory.createForClass(VendorSettings)
