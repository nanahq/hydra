import { SchemaTypes, Types } from 'mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument, ListingMenu } from '@app/common';

@Schema({ versionKey: false })
export class ListingCategory extends AbstractDocument {
  @Prop(Types.ObjectId)
  vendorId: string;

  @Prop(String)
  name: string;

  @Prop([String])
  tags: string[];

  @Prop(SchemaTypes.Boolean)
  isLive: boolean;

  @Prop({ type: [Types.ObjectId], ref: ListingMenu.name })
  listingsMenu: string[];

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;
}

export const ListingCategorySchema =
  SchemaFactory.createForClass(ListingCategory);
