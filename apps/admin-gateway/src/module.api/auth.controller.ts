import { Controller, Get, Post, Res, UseGuards } from '@nestjs/common'
import { Response } from 'express'
import { LocalGuard } from '../auth/guards/local.guard'
import { AuthService } from './auth.service'
import { CurrentUser } from './current-user.decorator'
import { AdminEntity } from '@app/common/database/entities/Admin'

@Controller('auth')
export class AuthController {
  constructor (private readonly authService: AuthService) {}
  @UseGuards(LocalGuard)
  @Post('login')
  async login (
    @CurrentUser() admin: AdminEntity,
      @Res({ passthrough: true }) response: Response
  ): Promise<void> {
    return await this.authService.login(admin, response)
  }

  @Get('logout')
  async logout (@Res() response: Response): Promise<any> {
    return this.authService.logout(response)
  }
}
