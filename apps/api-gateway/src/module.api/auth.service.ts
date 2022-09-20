import { TokenPayload } from '@app/common'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { User } from 'apps/users-service/src/schema'
import { Response } from 'express'

@Injectable()
export class AuthService {
  constructor (
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) {}

  async login (user: User, response: Response): Promise<void> {
    const payload: TokenPayload = {
      userId: user._id.toString()
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
