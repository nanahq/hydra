import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException
} from '@nestjs/common'
import { Admin, FleetMember } from '@app/common'

export function getCurrentUserByContext (
  context: ExecutionContext
): Admin | undefined {
  if (context.getType() === 'http') {
    return context.switchToHttp().getRequest()?.user as Admin
  }
  return context.switchToRpc().getData()?.user as Admin
}
export const FleetOwner = createParamDecorator(
  (level?: '', ctx: ExecutionContext) => {
    const member = getCurrentUserByContext(ctx) as FleetMember

    if (!member?.isOwner) {
      throw new ForbiddenException(
        'You do not have the required clearance to access this resource'
      )
    }

    return member
  }
)
