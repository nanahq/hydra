import { AbstractDocument } from "@app/common/database/abstract.schema";
import { Prop, SchemaFactory } from "@nestjs/mongoose";

export class User extends AbstractDocument {
    @Prop({required: true})
    phoneNumber: string

    @Prop({required: true})
    password: string

    @Prop({default: 0})
    status: Number

    @Prop()
    name: String

    @Prop()
    savedDeliveryAddress: [String]

    @Prop()
    state: string
}


export const UserSchema = SchemaFactory.createForClass(User)