import { AbstractDocument } from '@app/common/database/abstract.schema'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { SchemaTypes } from 'mongoose'

@Schema({ versionKey: false })
export class User extends AbstractDocument {
  @Prop({ required: true, type: SchemaTypes.String })
    phoneNumber: string

  @Prop({ required: true, type: SchemaTypes.String })
    password: string

  @Prop({ type: SchemaTypes.Number })
    status: number

  @Prop({ type: SchemaTypes.String })
    name: string

  @Prop({ type: SchemaTypes.String })
    state: string
}

export const UserSchema = SchemaFactory.createForClass(User)
