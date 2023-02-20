import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { AbstractDocument } from '@app/common'
import { ListingOption } from '@app/common/database/types/common'

@Schema({ versionKey: false })
export class ListingOptionGroup extends AbstractDocument {
  @Prop(String)
    name: string

  @Prop({ type: Number, default: 0 })
    min: number

  @Prop({ type: Number, default: 0 })
    max: number

  @Prop({
    type: [{
      name: String,
      price: Number
    }]
  })
    options: ListingOption[]
}

export const ListingOptionGroupSchema = SchemaFactory.createForClass(ListingOptionGroup)
