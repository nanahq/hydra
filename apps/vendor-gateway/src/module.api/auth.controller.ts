import { Controller, Get, Post, Res, UseGuards } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { Response } from 'express'

import { QUEUE_MESSAGE, Vendor, CurrentUser } from '@app/common'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { LocalGuard } from '../auth/guards/local.guard'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor (private readonly authService: AuthService) {}

  @UseGuards(LocalGuard)
  @Post('login')
  async login (
    @CurrentUser() vendor: Vendor,
      @Res({ passthrough: true }) response: Response
  ): Promise<any> {
    return await this.authService.login(vendor, response)
  }

  @Get('logout')
  async logout (@Res({ passthrough: true }) response: Response): Promise<any> {
    return this.authService.logout(response)
  }

  @MessagePattern(QUEUE_MESSAGE.VALIDATE_VENDOR)
  @UseGuards(JwtAuthGuard)
  async getUserProfile (@CurrentUser() vendor: Vendor): Promise<Vendor> {
    return vendor
  }
}
