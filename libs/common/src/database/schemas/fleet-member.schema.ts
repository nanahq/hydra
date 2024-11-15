import { Types } from 'mongoose'
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import {
  AbstractDocument
} from '@app/common'

@Schema({ versionKey: false, timestamps: true })
export class FleetMember extends AbstractDocument {
  @Prop(String)
    firstName: string

  @Prop(String)
    lastName: string

  @Prop({ type: String, unique: true })
    phone: string

  @Prop({ type: String, unique: true })
    email: string

  @Prop(String)
    password: string

  @Prop({ type: Types.ObjectId, ref: 'FleetOrganization' })
    organization: string
}
export const FleetMemberSchema = SchemaFactory.createForClass(FleetMember)
