import {  IsNotEmpty, IsPhoneNumber, IsString, Length, Max, MaxLength, Min, MinLength } from "class-validator";

export class loginUserRequest {
    @IsNotEmpty()
    @IsPhoneNumber('NG')
    phoneNumber: string

    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(20)
    password: string
}