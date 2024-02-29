import { SchemaTypes, Types } from 'mongoose'
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import {
  AbstractDocument,
  WalletTransactionStatus,
  WalletTransactionType
} from '@app/common'

@Schema({ versionKey: false, timestamps: true })
export class DriverWalletTransaction extends AbstractDocument {
  @Prop({ type: Types.ObjectId, ref: 'DriverWallet' })
    wallet: string

  @Prop(String)
    transaction: string

  @Prop({ type: Types.ObjectId, ref: 'Driver' })
    driver: string

  @Prop(Number)
    amount: number

  @Prop(String)
    txType: WalletTransactionType

  @Prop({ type: String, default: WalletTransactionStatus.PENDING })
    status: WalletTransactionStatus

  @Prop(Number)
    refid: number

  @Prop(SchemaTypes.Date)
    createdAt: string

  @Prop(SchemaTypes.Date)
    updatedAt: string
}

export const DriverWalletTransactionSchema = SchemaFactory.createForClass(
  DriverWalletTransaction
)
