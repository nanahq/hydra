import { Controller, Get } from '@nestjs/common'
import { AdminServiceService } from './admin-service.service'

@Controller()
export class AdminServiceController {
  constructor (private readonly adminServiceService: AdminServiceService) {}

  @Get()
  getHello (): string {
    return this.adminServiceService.getHello()
  }
}
