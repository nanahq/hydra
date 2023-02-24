import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { catchError, lastValueFrom } from 'rxjs'

import { QUEUE_MESSAGE, QUEUE_SERVICE } from '@app/common'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor (
    @Inject(QUEUE_SERVICE.VENDORS_SERVICE)
    private readonly vendorClient: ClientProxy
  ) {
    super({ usernameField: 'email' })
  }

  async validate (email: string, password: string): Promise<any> {
    return await lastValueFrom(
      this.vendorClient
        .send(QUEUE_MESSAGE.GET_VENDOR_LOCAL, {
          businessEmail: email,
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
