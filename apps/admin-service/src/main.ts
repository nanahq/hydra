import { NestFactory } from '@nestjs/core'
import { AdminServiceModule } from './admin-service.module'

async function bootstrap (): Promise<void> {
  const app = await NestFactory.create(AdminServiceModule)
  await app.listen(3000)
}
void bootstrap()
