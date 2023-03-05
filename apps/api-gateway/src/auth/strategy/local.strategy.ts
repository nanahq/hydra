import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { catchError, lastValueFrom } from 'rxjs'

import { QUEUE_MESSAGE, QUEUE_SERVICE } from '@app/common'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor (
    @Inject(QUEUE_SERVICE.USERS_SERVICE)
    private readonly usersClient: ClientProxy
  ) {
    super({ usernameField: 'phone' })
  }

  async validate (phone: string, password: string): Promise<any> {
    return await lastValueFrom(
      this.usersClient
        .send(QUEUE_MESSAGE.GET_USER_LOCAL, {
          phone,
          password
        })
        .pipe(
          catchError((error) => {
            throw new UnauthorizedException(error)
          })
        )
    )
  }
}
