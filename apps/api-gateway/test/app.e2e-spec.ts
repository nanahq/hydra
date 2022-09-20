import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { ApiGatewayModule } from './../src/api-gateway.module'

describe('ApiGatewayController (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiGatewayModule]
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('/ (GET)', async () => {
    return await request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!')
  })
})
