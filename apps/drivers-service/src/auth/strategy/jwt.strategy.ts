import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { Driver, TokenPayload } from '@app/common'
import { DriversServiceService } from '../../drivers-service.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor (
    configService: ConfigService,
    private readonly driverService: DriversServiceService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any): string => {
          return request?.cookies?.Authentication
        }
      ]),
      secretOrKey: configService.get<string>('JWT_SECRET') as string
    })
  }

  async validate ({ userId }: TokenPayload): Promise<Driver> {
    try {
      return await this.driverService.getProfile(userId)
    } catch (error) {
      throw new UnauthorizedException(error.message)
    }
  }
}
