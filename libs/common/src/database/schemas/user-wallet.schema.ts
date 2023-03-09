import { Types } from 'mongoose'
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { AbstractDocument } from '@app/common'

@Schema({ versionKey: false, timestamps: true })
export class UserWallet extends AbstractDocument {
  @Prop({
    type: Types.ObjectId,
    ref: 'User'
  })
  public user: string

  @Prop({
    type: Number
  })
    balance: number
}

export const VendorWalletSchema = SchemaFactory.createForClass(UserWallet)
