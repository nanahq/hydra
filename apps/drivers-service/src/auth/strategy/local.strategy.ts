import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'

import { Driver } from '@app/common'
import { DriversServiceService } from '../../drivers-service.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor (private readonly driversService: DriversServiceService) {
    super({ usernameField: 'phone' })
  }

  async validate (phone: string, password: string): Promise<Driver> {
    try {
      return await this.driversService.validateDriver(phone, password)
    } catch (error) {
      throw new UnauthorizedException(error)
    }
  }
}
