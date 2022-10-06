import { Controller, Get, Post, Res, UseGuards } from '@nestjs/common'
import { Response } from 'express'

import { LocalGuard } from '../auth/guards/local.guard'
import { AuthService } from './auth.service'
import { CurrentUser } from './current-user.decorator'
import { UserEntity } from '@app/common'

@Controller('auth')
export class AuthController {
  constructor (private readonly authService: AuthService) {}

  @UseGuards(LocalGuard)
  @Post('login')
  async login (
    @CurrentUser() user: UserEntity,
      @Res({ passthrough: true }) response: Response
  ): Promise<any> {
    return await this.authService.login(user, response)
  }

  @Get('logout')
  async logout (@Res() response: Response): Promise<any> {
    return this.authService.logout(response)
  }
}
