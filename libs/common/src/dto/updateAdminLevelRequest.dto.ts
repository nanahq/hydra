import { AdminLevel } from '@app/common';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateAdminLevelRequestDto {
  @IsEnum(AdminLevel)
  @IsNotEmpty()
  level: any;

  @IsNotEmpty()
  id: string;
}
