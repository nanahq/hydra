import { TokenPayload } from '@app/common'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Response } from 'express'
import { AdminEntity } from '@app/common/database/entities/Admin'

@Injectable()
export class AuthService {
  constructor (
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) {}

  async login (admin: AdminEntity, response: Response): Promise<void> {
    const payload: TokenPayload = {
      userId: admin.id
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

    response.send()
  }

  logout (response: Response): void {
    response.cookie('Authentication', '', {
      httpOnly: true,
      expires: new Date()
    })

    response.send()
  }
}
