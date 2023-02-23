import { SchemaTypes } from 'mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument, AdminLevel } from '@app/common';

@Schema({ versionKey: false })
export class Admin extends AbstractDocument {
  @Prop(String)
  firstName: string;

  @Prop(String)
  lastName: string;

  @Prop(String)
  userName: string;

  @Prop(String)
  password: string;

  @Prop(Number)
  reviewStars: number;

  @Prop(String)
  level: AdminLevel;

  @Prop(SchemaTypes.Date)
  createdAt: string;

  @Prop(SchemaTypes.Date)
  lastLoggedIn: string;

  @Prop(SchemaTypes.Date)
  updatedAt: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
