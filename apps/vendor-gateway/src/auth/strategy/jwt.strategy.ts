import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ClientProxy } from '@nestjs/microservices'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { catchError, lastValueFrom } from 'rxjs'

import { QUEUE_MESSAGE, QUEUE_SERVICE, TokenPayload } from '@app/common'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor (
    configService: ConfigService,
    @Inject(QUEUE_SERVICE.VENDORS_SERVICE)
    private readonly vendorClient: ClientProxy
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

  async validate ({ userId }: TokenPayload): Promise<any> {
    return await lastValueFrom(
      this.vendorClient
        .send(QUEUE_MESSAGE.GET_VENDOR_JWT, {
          userId
        })
        .pipe(
          catchError((error) => {
            throw new UnauthorizedException(error.message)
          })
        )
    )
  }
}
