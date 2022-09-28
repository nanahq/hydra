import { Module } from '@nestjs/common'
import { AdminServiceController } from './admin-service.controller'
import { AdminServiceService } from './admin-service.service'

@Module({
  imports: [],
  controllers: [AdminServiceController],
  providers: [AdminServiceService]
})
export class AdminServiceModule {}
