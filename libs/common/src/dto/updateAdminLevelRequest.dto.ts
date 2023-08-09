import { IsNotEmpty } from 'class-validator'

export class UpdateAdminLevelRequestDto {
  @IsNotEmpty()
    level: any

  @IsNotEmpty()
    id: string
}
