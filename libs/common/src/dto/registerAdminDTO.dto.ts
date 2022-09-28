import { IsNotEmpty } from 'class-validator'

export class RegisterAdminDTODto {
  @IsNotEmpty()
  public userName: string

  @IsNotEmpty()
  public password: string

  @IsNotEmpty()
  public firstName: string

  @IsNotEmpty()
  public lastName: string
}
