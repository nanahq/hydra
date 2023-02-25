import { SchemaTypes } from 'mongoose'
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { AbstractDocument, LocationCoordinates } from '@app/common'

@Schema({ versionKey: false })
export class User extends AbstractDocument {
  @Prop(String)
    firstName: string

  @Prop(String)
    lastName: string

  @Prop({ type: String, unique: true, sparse: true })
    email: string

  @Prop(String)
    password: string

  @Prop({ type: String, unique: true })
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
    location: LocationCoordinates
}

export const UserSchema = SchemaFactory.createForClass(User)
