import { SchemaTypes } from 'mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';
import {
  PaymentInfo,
  VendorOperationSetting,
} from '@app/common/database/types/common';
import { Vendor } from './vendor.schema';
@Schema({ versionKey: false })
export class VendorSettings extends AbstractDocument {
  @Prop({ type: SchemaTypes.ObjectId, ref: Vendor.name })
  vendor: string;

  @Prop({
    type: {
      startTime: String,
      cutoffTime: String,
      placementTime: String,
      minOrder: Number,
    },
    nullable: true,
  })
  operations: VendorOperationSetting;

  @Prop({
    type: {
      bankName: String,
      bankAccountName: String,
      bankAccountNumber: String,
    },
    nullable: true,
  })
  payment: PaymentInfo;
}

export const VendorSettingsSchema =
  SchemaFactory.createForClass(VendorSettings);