import { Controller, Get, Post } from '@nestjs/common'

@Controller('/auth')
export class AuthController {
  @Post('/login')
  async login (): Promise<any> {
    return 'Hello world'
  }

  @Get('/logout')
  async logout (): Promise<any> {
    return 'Hello world'
  }
}
