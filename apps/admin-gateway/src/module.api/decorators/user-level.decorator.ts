import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException
} from '@nestjs/common'
import { Admin, AdminLevel } from '@app/common'

export function getCurrentUserByContext (
  context: ExecutionContext
): Admin | undefined {
  if (context.getType() === 'http') {
    return context.switchToHttp().getRequest()?.user as Admin
  }
  return context.switchToRpc().getData()?.user as Admin
}
export const AdminClearance = createParamDecorator(
  (level: AdminLevel[], ctx: ExecutionContext) => {
    const admin = getCurrentUserByContext(ctx)

    if (admin?.level === AdminLevel.SUPER_ADMIN) {
      return admin
    }
    if (admin === undefined || !level.includes(admin.level)) {
      throw new ForbiddenException(
        'You do not have the required clearance to access this resource'
      )
    }
    return admin
  }
)
