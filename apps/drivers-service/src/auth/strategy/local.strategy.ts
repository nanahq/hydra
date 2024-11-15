import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'

import { Driver, FleetMember, internationalisePhoneNumber } from '@app/common'
import { DriversServiceService } from '../../drivers-service.service'
import { FleetService } from '../../fleet/fleet.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor (private readonly driversService: DriversServiceService) {
    super({ usernameField: 'phone' })
  }

  async validate (phone: string, password: string): Promise<Driver> {
    try {
      return await this.driversService.validateDriver(
        internationalisePhoneNumber(phone),
        password
      )
    } catch (error) {
      throw new UnauthorizedException(error)
    }
  }
}

@Injectable()
export class FleetLocalStrategy extends PassportStrategy(Strategy, 'fleet-local') {
  constructor (private readonly fleetService: FleetService) {
    super({ usernameField: 'email' })
  }

  async validate (email: string, password: string): Promise<FleetMember> {
    try {
      return await this.fleetService.validateDriver(
        email.toLowerCase(),
        password
      )
    } catch (error) {
      throw new UnauthorizedException(error)
    }
  }
}
