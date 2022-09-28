import { Controller, Get, Post, Res, UseGuards } from '@nestjs/common'
import { Response } from 'express'
import { LocalGuard } from '../auth/guards/local.guard'
import { AuthService } from './auth.service'
import { CurrentUser } from './current-user.decorator'
import { VendorEntity } from '@app/common/database/entities/Vendor'
import { MessagePattern } from '@nestjs/microservices'
import { QUEUE_MESSAGE } from '@app/common'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'

@Controller('auth')
export class AuthController {
  constructor (private readonly authService: AuthService) {}
  @UseGuards(LocalGuard)
  @Post('login')
  async login (
    @CurrentUser() vendor: VendorEntity,
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
  async getUserProfile (
    @CurrentUser() vendor: VendorEntity
  ): Promise<VendorEntity> {
    return vendor
  }
}
