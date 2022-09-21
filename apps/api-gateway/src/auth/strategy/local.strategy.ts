import { QUEUE_MESSAGE, QUEUE_SERVICE } from '@app/common'
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { catchError, lastValueFrom } from 'rxjs'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor (
    @Inject(QUEUE_SERVICE.USERS_SERVICE)
    private readonly usersClient: ClientProxy
  ) {
    super({ usernameField: 'phoneNumber' })
  }

  async validate (phoneNumber: string, password: string): Promise<any> {
    return await lastValueFrom(
      this.usersClient
        .send(QUEUE_MESSAGE.GET_USER_LOCAL, {
          phoneNumber,
          password
        })
        .pipe(
          catchError((error) => {
            throw new UnauthorizedException(error.message)
          })
        )
    )
  }
}
