import { INestApplication } from '@nestjs/common'
import { StartedTestContainer } from 'testcontainers'
import Docker from 'dockerode'
import { ClientProxy } from '@nestjs/microservices'
import { RabbitmqInstance, stopRabbitmqContainer } from '@app/common/test/utils/rabbitmq.instace'
import { MongodbInstance } from '@app/common/test/utils/mongodb.instance'
import { Test, TestingModule } from '@nestjs/testing'
import {
  PlaceOrderDto,
  QUEUE_SERVICE,
  RmqModule,
  RmqService,
  ServicePayload,
  QUEUE_MESSAGE, ResponseWithStatus
} from '@app/common'
import { OrderRepository } from '../../order.repository'
import { OrdersServiceModule } from '../../orders-service.module'
import { createClientProxyMock } from '../../../../users-service/src/test/support/client-proxy.mock'
import { catchError, lastValueFrom } from 'rxjs'

describe('Orders - E2E', () => {
  const port = 5675
  const rmqConnectionUri = `amqp://localhost:${port}`
  let app: INestApplication
  let mongo: StartedTestContainer
  let rabbitMq: Docker.Container
  let client: ClientProxy
  let repository: OrderRepository
  beforeAll(async () => {
    try {
      rabbitMq = await RabbitmqInstance(port)

      mongo = await MongodbInstance()

      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          OrdersServiceModule,
          RmqModule.register({ name: QUEUE_SERVICE.ORDERS_SERVICE, fallbackUri: rmqConnectionUri })
        ]
      })
        .overrideProvider(QUEUE_SERVICE.NOTIFICATION_SERVICE)
        .useValue(createClientProxyMock())
        .overrideProvider(QUEUE_SERVICE.USERS_SERVICE)
        .useValue(createClientProxyMock())
        .overrideProvider(QUEUE_SERVICE.DRIVER_SERVICE)
        .useValue(createClientProxyMock())
        .compile()

      app = moduleFixture.createNestApplication()
      const rmq = app.get<RmqService>(RmqService)
      app.connectMicroservice(rmq.getOption(QUEUE_SERVICE.ORDERS_SERVICE, false, rmqConnectionUri))
      await app.startAllMicroservices()
      await app.init()

      client = app.get(QUEUE_SERVICE.ORDERS_SERVICE)
      repository = moduleFixture.get<OrderRepository>(OrderRepository)
    } catch (error) {
      console.error(error)
      await mongo?.stop()
      await stopRabbitmqContainer(rabbitMq)
    }
  })

  beforeEach(async () => {
    await repository.deleteMany()
  })

  afterAll(async () => {
    await app.close()
    await mongo.stop()
    await stopRabbitmqContainer(rabbitMq)
    client.close()
  })

  describe('App - entry', () => {
    it(' should be defined', function () {
      expect(app).toBeDefined()
    })
  })

  describe('create operations', () => {
    let payload: ServicePayload<PlaceOrderDto>
    let listingId: '63f7f2d0a0f1d5158f43cb7b'

    beforeEach(async () => {
      payload = {
        userId: listingId,
        data: {
          user: listingId,
          deliveryAddress: 'Suite c22 ummiplaxa zoo road kano',
          orderDeliveryScheduledTime: (new Date()).toLocaleDateString(),
          isThirdParty: false,
          listing: listingId,
          options: ['zobo', 'fura'],
          vendor: listingId,
          orderBreakDown: {
            orderCost: 2000,
            vat: 80,
            deliveryFee: 250,
            systemFee: 150
          },
          orderType: 'ON_DEMAND',
          orderValuePayable: 2500,
          preciseLocation: {
            type: 'Point',
            coordinates: [0.0, 200]

          },
          primaryContact: '+2348107641933',
          quantity: '3',
          totalOrderValue: 3000
        }
      }
    })

    it('should place a new order', async () => {
      const beforePlacement = await repository.find({})

      expect(beforePlacement.length).toStrictEqual(0)

      const response = await lastValueFrom<ResponseWithStatus>(
        client.send(QUEUE_MESSAGE.CREATE_ORDER, payload)
          .pipe(
            catchError((error) => {
              throw error
            })
          )
      )
      expect(response).toStrictEqual({ status: 1 })

      const afterPlacement = await repository.find({})

      expect(afterPlacement.length).toStrictEqual(1)
      expect(afterPlacement[0].user).toStrictEqual(listingId)
    })
  })
})
