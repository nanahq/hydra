import { IsNotEmpty, IsPhoneNumber, IsString, Length, Max, MaxLength, Min, MinLength } from "class-validator";

export class registerUserRequest {
    @IsNotEmpty()
    @IsPhoneNumber('NG')
    phoneNumber: string

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(20)
    password: string
}