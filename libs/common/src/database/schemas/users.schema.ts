import { SchemaTypes } from 'mongoose'
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { AbstractDocument } from '@app/common'
import { UserI } from '../dto/user.dto'

@Schema({ versionKey: false })
export class User extends AbstractDocument implements UserI {
  @Prop()
    firstName: string

  @Prop()
    lastName: string

  @Prop({ unique: true, sparse: true })
    email: string

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

  @Prop({ type: String, default: 'ONLINE' })
    status: 'ONLINE' | 'OFFLINE'

  @Prop({
    type: {
      coordinates: [String]
    }
  })
    location: {
    coordinates: [string, string]
  }

  @Prop(Boolean)
    isDeleted: string
}

export const UserSchema = SchemaFactory.createForClass(User)
