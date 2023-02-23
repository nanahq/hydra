import { IsNotEmpty } from 'class-validator';

export class RegisterAdminDTO {
  @IsNotEmpty()
  public userName: string;

  @IsNotEmpty()
  public password: string;

  @IsNotEmpty()
  public firstName: string;

  @IsNotEmpty()
  public lastName: string;
}
