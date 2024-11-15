import { AuthGuard } from '@nestjs/passport'

export class JwtAuthGuard extends AuthGuard('jwt') {}
export class FleetJwtAuthGuard extends AuthGuard('fleet-jwt') {}
