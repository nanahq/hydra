import { Controller, Get, Post, Res, UseGuards } from '@nestjs/common'
import { User } from 'apps/users-service/src/schema'
import { Response } from 'express'
import { LocalGuard } from '../auth/guards/local.guard'
import { AuthService } from './auth.service'
import { CurrentUser } from './current-user.decorator'

@Controller('auth')
export class AuthController {
  constructor (private readonly authService: AuthService) {}
  @UseGuards(LocalGuard)
  @Post('login')
  async login (
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response
  ): Promise<any> {
    return await this.authService.login(user, response)
  }

  @Get('logout')
  async logout (): Promise<any> {
    return 'Hello world'
  }
}
