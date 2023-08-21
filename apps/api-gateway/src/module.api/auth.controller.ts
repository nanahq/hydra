import { Controller, Get, Post, Res, UseGuards } from '@nestjs/common'
import { Response } from 'express'

import { LocalGuard } from '../auth/guards/local.guard'
import { AuthService } from './auth.service'
import { CurrentUser, User } from '@app/common'

@Controller('auth')
export class AuthController {
  constructor (private readonly authService: AuthService) {
  }

  @UseGuards(LocalGuard)
  @Post('login')
  async login (
    @CurrentUser() user: User,
      @Res({ passthrough: true }) response: Response
  ): Promise<void> {
    return await this.authService.login(user, response)
  }

  @Get('logout')
  async logout (@Res({ passthrough: true }) response: Response): Promise<void> {
    return this.authService.logout(response)
  }
}
