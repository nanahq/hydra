import { HttpException, Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { catchError, lastValueFrom } from 'rxjs'

import {
  Admin,
  IRpcException,
  QUEUE_MESSAGE,
  QUEUE_SERVICE
} from '@app/common'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor (
    @Inject(QUEUE_SERVICE.ADMINS_SERVICE)
    private readonly adminClient: ClientProxy
  ) {
    super({ usernameField: 'userName' })
  }

  async validate (userName: string, password: string): Promise<Admin> {
    return await lastValueFrom(
      this.adminClient
        .send(QUEUE_MESSAGE.GET_ADMIN_LOCAL, {
          userId: '',
          data: {
            userName,
            password
          }
        })
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }
}
