import { Types } from 'mongoose'
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import {
  AbstractDocument
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
}
export const FleetOrganizationSchema = SchemaFactory.createForClass(FleetOrganization)
