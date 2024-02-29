import { SchemaTypes, Types } from 'mongoose'
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { AbstractDocument } from '@app/common'

@Schema({ versionKey: false, timestamps: true })
export class DriverWallet extends AbstractDocument {
  @Prop({ type: [Types.ObjectId], ref: 'DriverWalletTransaction' })
    transactions: string[]

  @Prop({ type: Number, default: 0 })
    balance: number

  @Prop({ type: Types.ObjectId, ref: 'Driver' })
    driver: string

  @Prop([String])
    logs: string[]

  @Prop(SchemaTypes.Date)
    createdAt: string

  @Prop(SchemaTypes.Date)
    updatedAt: string
}

export const DriverWalletSchema = SchemaFactory.createForClass(DriverWallet)
