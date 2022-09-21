import { TokenPayload } from '@app/common'
import {
  QUEUE_MESSAGE,
  QUEUE_SERVICE
} from '@app/common/typings/QUEUE_MESSAGE'
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ClientProxy } from '@nestjs/microservices'
import { PassportStrategy } from '@nestjs/passport'
import { Types } from 'mongoose'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { catchError, lastValueFrom } from 'rxjs'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor (
    configService: ConfigService,
    @Inject(QUEUE_SERVICE.USERS_SERVICE)
    private readonly usersClient: ClientProxy
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any): string => {
          return request?.Authentication
        }
      ]),
      secretOrKey: configService.get<string>('JWT_SECRET') as string
    })
  }

  async validate ({ userId }: TokenPayload): Promise<any> {
    return await lastValueFrom(
      this.usersClient
        .send(QUEUE_MESSAGE.GET_USER_JWT, {
          _id: new Types.ObjectId(userId)
        })
        .pipe(
          catchError((error) => {
            throw new UnauthorizedException(error.message)
          })
        )
    )
  }
}
