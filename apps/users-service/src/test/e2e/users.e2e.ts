import { HttpStatus, INestApplication } from '@nestjs/common'
import { StartedTestContainer } from 'testcontainers'
import Docker from 'dockerode'
import { ClientProxy } from '@nestjs/microservices'
import { RabbitmqInstance, stopRabbitmqContainer } from '@app/common/test/utils/rabbitmq.instace'
import { MongodbInstance } from '@app/common/test/utils/mongodb.instance'
import { Test, TestingModule } from '@nestjs/testing'
import {
  loginUserRequest,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  registerUserRequest,
  ResponseWithStatus,
  RmqModule,
  RmqService, ServicePayload, TokenPayload,
  User, Vendor, verifyPhoneRequest
} from '@app/common'
import { UserRepository } from '../../users.repository'
import { UsersServiceModule } from '../../users-service.module'
import { catchError, lastValueFrom } from 'rxjs'
import * as bcrypt from 'bcryptjs'
import { UpdateUserDto } from '@app/common/dto/UpdateUserDto'
import { createClientProxyMock } from '../support/client-proxy.mock'

describe('users service e2e', () => {
  const port = 5672
  const rmqConnectionUri = `amqp://localhost:${port}`
  let app: INestApplication
  let mongo: StartedTestContainer
  let rabbitMq: Docker.Container
  let client: ClientProxy
  let repository: UserRepository
  beforeAll(async () => {
    try {
      rabbitMq = await RabbitmqInstance(port)

      mongo = await MongodbInstance()

      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          UsersServiceModule,
          RmqModule.register({ name: QUEUE_SERVICE.USERS_SERVICE, fallbackUri: rmqConnectionUri })
        ]
      })
        .overrideProvider(QUEUE_SERVICE.NOTIFICATION_SERVICE)
        .useValue(createClientProxyMock())
        .compile()

      app = moduleFixture.createNestApplication()
      const rmq = app.get<RmqService>(RmqService)
      app.connectMicroservice(rmq.getOption(QUEUE_SERVICE.USERS_SERVICE, false, rmqConnectionUri))
      await app.startAllMicroservices()
      await app.init()

      client = app.get(QUEUE_SERVICE.USERS_SERVICE)
      repository = moduleFixture.get<UserRepository>(UserRepository)
    } catch (error) {
      console.error(error)
      await mongo.stop()
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

  describe('smoke', () => {
    it('should smoke test ', function () {
      expect(rabbitMq).toBeDefined()
    })
  })

  describe('create operation', () => {
    let payload: registerUserRequest

    beforeEach(() => {
      payload = {
        password: '123456',
        email: 'suraj@gmail.com',
        phone: '+2348107641913'
      }
    })
    it('should create a new user', async () => {
      expect((await repository.find({})).length).toStrictEqual(0)

      const response = await lastValueFrom<ResponseWithStatus>(
        client.send(QUEUE_MESSAGE.CREATE_USER, payload)
          .pipe(
            catchError((error) => {
              throw error
            })
          )
      )
      expect(response).toStrictEqual({ status: 1 })
      const users: User[] = await repository.find({})

      expect(users.length).toStrictEqual(1)
      expect(users[0].email).toStrictEqual(payload.email)
      expect(users[0].phone).toStrictEqual(payload.phone)
    })

    it('should throw an exception when creating account with existing phone', async () => {
      await repository.create({
        password: '123456',
        email: 'suraj@gmail.com',
        phone: '+2348107641913'
      })

      try {
        await lastValueFrom<ResponseWithStatus>(
          client.send(QUEUE_MESSAGE.CREATE_USER, payload))
        fail('should throw an exception if creating account with exiting phone number')
      } catch (error) {
        expect(error.message).toStrictEqual('Phone Number is  already registered.')
        expect(error.status).toStrictEqual(HttpStatus.CONFLICT)
      }
    })

    it('should throw an exception when creating account with existing email', async () => {
      await repository.create({
        password: '123456',
        email: 'suraj@gmail.com',
        phone: '+2348107641944'
      })

      try {
        await lastValueFrom<ResponseWithStatus>(
          client.send(QUEUE_MESSAGE.CREATE_USER, payload))
        fail('should throw an exception if creating account with exiting email')
      } catch (error) {
        expect(error.message).toStrictEqual('Email is  already registered.')
        expect(error.status).toStrictEqual(HttpStatus.CONFLICT)
      }
    })
  })

  describe('get operation', () => {
    let user: User
    beforeEach(async () => {
      const payload = {
        password: await bcrypt.hash('12345678', 10),
        email: 'suraj@gmail.com',
        phone: '+2348107641933'
      }
      user = await repository.create({ ...payload, isValidated: false })
    })

    afterEach(async () => {
      await repository.deleteMany()
    })

    it('should get user by ID [JWT]', async () => {
      const tokenPayload: TokenPayload = {
        userId: user._id.toString()
      }

      const response = await lastValueFrom<User>(
        client.send(QUEUE_MESSAGE.GET_USER_JWT, tokenPayload)
          .pipe(
            catchError((error) => {
              throw error
            })
          )
      )

      expect(response.phone).toStrictEqual(user.phone)
      expect(response.email).toStrictEqual(user.email)
    })

    it('should login user [LOCAL]', async () => {
      const payload: loginUserRequest = {
        password: '12345678',
        phone: '+2348107641933'
      }

      const response = await lastValueFrom<User>(
        client.send(QUEUE_MESSAGE.GET_USER_LOCAL, payload)
          .pipe(
            catchError((error) => {
              throw error
            })
          )
      )

      expect(response.phone).toStrictEqual(user.phone)
      expect(response.email).toStrictEqual(user.email)
    })

    it('should get user by phone', async () => {
      const response = await lastValueFrom<User>(
        client.send(QUEUE_MESSAGE.GET_USER_BY_PHONE, { phone: user.phone })
          .pipe(
            catchError((error) => {
              throw error
            })
          )
      )

      expect(response.phone).toStrictEqual(user.phone)
      expect(response.email).toStrictEqual(user.email)
    })

    it('should throw an exception when getting user with wrong ID', async () => {
      const fakeTokenPayload: TokenPayload = {
        userId: '63f7f2d0a0f1d5158f43cb7b'
      }

      try {
        await lastValueFrom<ResponseWithStatus>(
          client.send(QUEUE_MESSAGE.GET_USER_JWT, fakeTokenPayload))
        fail('should throw an exception when getting user with wrong ID')
      } catch (error) {
        expect(error.message).toStrictEqual('Provided user id is not found')
        expect(error.status).toStrictEqual(HttpStatus.UNAUTHORIZED)
      }
    })

    it('should throw an exception when login in with wrong phone', async () => {
      const payload: loginUserRequest = {
        phone: '+2341234567', // wrong email. correct email [user.email]
        password: 'WRONG_PASSWORD'
      }

      try {
        await lastValueFrom<ResponseWithStatus>(
          client.send(QUEUE_MESSAGE.GET_USER_LOCAL, payload))
        fail('should throw an exception when login in with wrong phone')
      } catch (error) {
        expect(error.message).toStrictEqual('User with that phone number does not exist')
        expect(error.status).toStrictEqual(HttpStatus.NOT_FOUND)
      }
    })

    it('should throw an exception when login in with wrong password', async () => {
      const payload: loginUserRequest = {
        phone: user.phone,
        password: 'WRONG_PASSWORD'
      }

      try {
        await lastValueFrom<ResponseWithStatus>(
          client.send(QUEUE_MESSAGE.GET_USER_LOCAL, payload))
        fail('should throw an exception when login in with wrong password')
      } catch (error) {
        expect(error.message).toStrictEqual('Provided Password is incorrect')
        expect(error.status).toStrictEqual(HttpStatus.UNAUTHORIZED)
      }
    })
    it('should throw an exception when getting user with wrong phone number', async () => {
      try {
        await lastValueFrom<ResponseWithStatus>(
          client.send(QUEUE_MESSAGE.GET_USER_BY_PHONE, { phone: '+23456789098' })
        )
        fail('should throw an exception when getting user with wrong phone number')
      } catch (error) {
        expect(error.message).toStrictEqual('User not with the phone number not found')
        expect(error.status).toStrictEqual(HttpStatus.NOT_FOUND)
      }
    })
  })

  describe('update operations', () => {
    let user: User
    beforeEach(async () => {
      const payload = {
        password: await bcrypt.hash('12345678', 10),
        email: 'suraj@gmail.com',
        phone: '+2348107641933'
      }
      user = await repository.create({ ...payload, isValidated: false })
    })

    afterEach(async () => {
      await repository.deleteMany()
    })

    it('should update user status to validated', async () => {
      const beforeUpdate: User = await repository.findOne({ phone: user.phone })
      expect(beforeUpdate.isValidated).toStrictEqual(false)

      const payload: verifyPhoneRequest = {
        phone: user.phone
      }

      const response = await lastValueFrom<ResponseWithStatus>(
        client.send(QUEUE_MESSAGE.UPDATE_USER_STATUS, payload)
          .pipe(
            catchError((error) => {
              throw error
            })
          )
      )

      expect(response).toStrictEqual({ status: 1 })

      const afterUpdate: User = await repository.findOne({ phone: user.phone })
      expect(afterUpdate.isValidated).toStrictEqual(true)
    })

    it('should update user profile', async () => {
      const beforeUpdate: User = await repository.findOne({ phone: user.phone })
      expect(beforeUpdate?.firstName).toStrictEqual(undefined)
      expect(beforeUpdate?.lastName).toStrictEqual(undefined)

      const payload: ServicePayload<Partial<UpdateUserDto>> = {
        userId: user._id.toString(),
        data: {
          firstName: 'Suraj',
          lastName: 'Auwal'
        }
      }

      const response = await lastValueFrom<ResponseWithStatus>(
        client.send(QUEUE_MESSAGE.UPDATE_USER_PROFILE, payload)
          .pipe(
            catchError((error) => {
              throw error
            })
          )
      )

      expect(response).toStrictEqual({ status: 1 })

      const afterUpdate: User = await repository.findOne({ phone: user.phone })
      expect(afterUpdate?.firstName).toStrictEqual(payload.data.firstName)
      expect(afterUpdate?.lastName).toStrictEqual(payload.data.lastName)
    })

    it('should update user order count', async () => {
      const beforeUpdate: User = await repository.findOne({ phone: user.phone })
      expect(beforeUpdate?.orders.length).toStrictEqual(0)

      const payload = {
        userId: user._id.toString(),
        orderId: user._id.toString()

      }

      const response = await lastValueFrom<ResponseWithStatus>(
        client.send(QUEUE_MESSAGE.UPDATE_USER_ORDER_COUNT, payload)
          .pipe(
            catchError((error) => {
              throw error
            })
          )
      )

      expect(response).toStrictEqual({ status: 1 })

      const afterUpdate: User = await repository.findOne({ phone: user.phone })
      expect(afterUpdate?.orders.length).toStrictEqual(1)
    })
  })

  describe('delete operations', () => {
    let user: User
    beforeEach(async () => {
      const payload = {
        password: await bcrypt.hash('12345678', 10),
        email: 'suraj@gmail.com',
        phone: '+2348107641933'
      }
      user = await repository.create({ ...payload, isValidated: false })
    })

    afterEach(async () => {
      await repository.deleteMany()
    })

    it('should delete user', async () => {
      const beforeUpdate = await repository.findOne({ _id: user._id.toString() })

      expect(beforeUpdate).toBeDefined() // Assert default
      expect(beforeUpdate.isDeleted).toStrictEqual(false) // Assert default

      const response = await lastValueFrom<ResponseWithStatus>(
        client.send(QUEUE_MESSAGE.DELETE_USER_PROFILE, { userId: user._id.toString(), data: null })
          .pipe(
            catchError((error) => {
              throw error
            })
          )
      )

      expect(response).toStrictEqual({ status: 1 })

      const afterUpdate: Vendor[] = await repository.find({})
      expect(afterUpdate[0].isDeleted).toStrictEqual(true) // Assert default
    })
  })
})
