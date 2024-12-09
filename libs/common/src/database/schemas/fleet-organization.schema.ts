import { Types } from 'mongoose'
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import {
  AbstractDocument,
  PaymentInfo
} from '@app/common'

@Schema({ versionKey: false, timestamps: true })
export class FleetOrganization extends AbstractDocument {
  @Prop({ type: [Types.ObjectId], ref: 'FleetMember' })
    members: string[]

  @Prop({ type: [Types.ObjectId], ref: 'FleetMember' })
    owners: string[]

  @Prop()
    name: string

  @Prop()
    image: string

  @Prop(String)
    password: string

  @Prop({ type: String, unique: true })
    email: string

  @Prop({ type: Boolean, default: false })
    accountApproved: false

  @Prop(String)
    inviteLink: string

  @Prop({ type: [Types.ObjectId], ref: 'Driver' })
    drivers: string[]

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
export const FleetOrganizationSchema = SchemaFactory.createForClass(FleetOrganization)
