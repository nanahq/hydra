import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException
} from '@nestjs/common'
import {  FleetMember } from '@app/common'

export function getCurrentUserByContext (
  context: ExecutionContext
): FleetMember | undefined {
  if (context.getType() === 'http') {
    return context.switchToHttp().getRequest()?.user as FleetMember
  }
  return context.switchToRpc().getData()?.user as FleetMember
}
export const FleetOwner = createParamDecorator(
  (level: string = "", ctx: ExecutionContext) => {
    const member = getCurrentUserByContext(ctx) as FleetMember

    if (!member?.isOwner) {
      throw new ForbiddenException(
        'You do not have the required clearance to access this resource'
      )
    }

    return member
  }
)
