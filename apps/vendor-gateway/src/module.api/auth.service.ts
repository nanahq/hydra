import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Response } from 'express'

import { TokenPayload, VendorEntity } from '@app/common'

@Injectable()
export class AuthService {
  constructor (
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) {}

  async login (vendor: VendorEntity, response: Response): Promise<void> {
    const payload: TokenPayload = {
      userId: vendor.id
    }

    const expires = new Date()
    expires.setSeconds(
      expires.getSeconds() + Number(this.configService.get('JWT_EXPIRATION'))
    )
    const token = this.jwtService.sign(payload)

    response.cookie('Authentication', token, {
      httpOnly: true,
      expires
    })
  }

  logout (response: Response): void {
    response.cookie('Authentication', '', {
      httpOnly: true,
      expires: new Date()
    })
  }
}
