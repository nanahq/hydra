import { createParamDecorator, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Admin, AdminLevel } from '@app/common'

export function getCurrentUserByContext (context: ExecutionContext): Admin | undefined {
  if (context.getType() === 'http') {
    return context.switchToHttp().getRequest()?.user as Admin
  }
  return context.switchToRpc().getData()?.user as Admin
}
export const UserLevel = createParamDecorator(
  (level: AdminLevel, ctx: ExecutionContext) => {
    const admin = getCurrentUserByContext(ctx)

    if (admin === undefined || admin.level !== level) {
      throw new ForbiddenException('You do not have the required level to access this resource')
    }
    return admin
  }
)
