import { AuthGuard } from '@nestjs/passport'

export class LocalGuard extends AuthGuard('local') {}
export class FleetLocalGuard extends AuthGuard('fleet-local') {}
