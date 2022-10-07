import { TokenPayload } from '@app/common'
import {
  QUEUE_MESSAGE,
  QUEUE_SERVICE
} from '@app/common/typings/QUEUE_MESSAGE'
import { HttpException, Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ClientProxy } from '@nestjs/microservices'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { catchError, lastValueFrom } from 'rxjs'
import { IRpcException } from '@app/common/filters/rpc.expection'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor (
    configService: ConfigService,
    @Inject(QUEUE_SERVICE.ADMIN_SERVICE)
    private readonly adminClient: ClientProxy
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
      this.adminClient
        .send(QUEUE_MESSAGE.GET_ADMIN_JWT, {
           userId,
          data: null
        })
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }
}
