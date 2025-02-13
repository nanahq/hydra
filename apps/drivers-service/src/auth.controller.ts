import { Controller, Get, Post, Res, UseGuards } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { Response } from 'express'

import { CurrentUser, Driver, FleetMember, QUEUE_MESSAGE } from '@app/common'
import { JwtAuthGuard } from './auth/guards/jwt.guard'
import { FleetLocalGuard, LocalGuard } from './auth/guards/local.guard'
import { AuthService } from './auth.service'

@Controller('auth')
export class DriversAuthController {
  constructor (private readonly authService: AuthService) {}

  @UseGuards(LocalGuard)
  @Post('login')
  async login (
    @CurrentUser() driver: Driver,
      @Res({ passthrough: true }) response: Response
  ): Promise<any> {
    return await this.authService.login(driver, response)
  }

  @UseGuards(FleetLocalGuard)
  @Post('fleet/login')
  async loginFleet (
    @CurrentUser() member: FleetMember,
      @Res({ passthrough: true }) response: Response
  ): Promise<any> {
    return await this.authService.loginFleet(member, response)
  }

  @Get('logout')
  async logout (@Res({ passthrough: true }) response: Response): Promise<any> {
    return this.authService.logout(response)
  }

  @MessagePattern(QUEUE_MESSAGE.VALIDATE_DRIVER)
  @UseGuards(JwtAuthGuard)
  async getUserProfile (@CurrentUser() driver: Driver): Promise<Driver> {
    return driver
  }
}
