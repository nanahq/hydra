
import { Test } from '@nestjs/testing'
import { UsersService } from '../users-service.service'
import { UsersServiceController } from '../users-service.controller'
import {
  ResponseWithStatus,
  ServicePayload,
  RmqService,
 registerUserRequest, verifyPhoneRequest, User, loginUserRequest, TokenPayload
} from '@app/common'
import { RmqContext } from '@nestjs/microservices'
import { UserProfileStub, resStub } from './stubs/user.stub'
import {} from '@app/common/database/dto/listing.dto'
import { UpdateUserDto } from '@app/common/dto/UpdateUserDto'

export const RmqServiceMock = {
  ack: jest.fn()
}

jest.mock('../users-service.service.ts')

describe('usersServiceController', () => {
  let usersController: UsersServiceController
  let usersService: UsersService

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [UsersServiceController],
      providers: [UsersService, RmqService]
    })
      .overrideProvider(RmqService)
      .useValue(RmqServiceMock)
      .compile()

      usersController = moduleRef.get<UsersServiceController>(UsersServiceController)
      usersService = moduleRef.get<UsersService>(UsersService)
    jest.clearAllMocks()
  })

  describe('register', () => {
    describe('When registering a new  user', () => {
      let response: ResponseWithStatus
      let payload:registerUserRequest
      let context: RmqContext
      beforeEach(async () => {
        payload = {
            password: '1234567',
            phone: 'SURAJ@GMAIL.COM'
        }

        response = await usersController.registerNewUser(payload, context)
      })
      test('then it should call usersService.register', () => {
        expect(usersService.register).toBeCalledWith(payload)
      })

      test('then is should return a success status', () => {
        expect(response).toStrictEqual(resStub())
      })
    })
  })

  describe('updateUserStatus', () => {
    describe('when updating a user status', () => {
      let response: ResponseWithStatus
      let data: verifyPhoneRequest
      let context: RmqContext

      beforeEach(async () => {
        data = {
          phone: '0810009900',
        }
        response = await usersController.updateUserStatus(data, context)
      })
      test('then it should call usersService.updateUserStatus', () => {
        expect(usersService.updateUserStatus).toHaveBeenCalledWith(data)
      })

      test('then it should return a success response', () => {
        expect(response).toStrictEqual({ status: 1 })
      })
    })
  })

  describe('getUserByPhone', () => {
    describe('when getting a single user by phone ', () => {
      let response: User
      let payload: loginUserRequest
      let context: RmqContext

      beforeEach(async () => {
      payload = {
        password: '12345678',
        phone: "09100998899"
      }

        response = await usersController.getUserByPhone(payload, context)
      })
      test('then it should call usersService.validateUser', () => {
        expect(usersService.validateUser).toHaveBeenCalledWith(payload)
      })

      test('then it should return a single menu', () => {
        expect(response).toStrictEqual(UserProfileStub())
      })
    })
  })

  describe('getUserById', () => {
    describe('when a single user by ID', () => {
      let response: User
      let payload: TokenPayload
      let context: RmqContext

      beforeEach(async () => {

        payload = {
          userId: UserProfileStub()._id as any,
          }

        response = await usersController.getUserById(payload, context)
      })
      test('then it should call listingService.getUser', () => {
        expect(usersService.getUser).toHaveBeenCalledWith(payload)
      })

      test('then it should return a success status', () => {
        expect(response).toStrictEqual(UserProfileStub())
      })
    })
  })

  describe('updateUserProfile', () => {
    describe('When updatting a user profile', () => {
      let response: ResponseWithStatus
      let payload: ServicePayload<Partial<UpdateUserDto>> 
      let context: RmqContext

      beforeEach(async () => {
        payload = {
          userId: UserProfileStub()._id as any,
          data: {
            email: 'suraj@gmail.com'
          }
        } 
        response = await usersController.updateUserProfile(payload as any, context)
      })
      test('then it should call listingService.updateUserProfile', () => {
        expect(usersService.updateUserProfile).toHaveBeenCalledWith(payload)
      })

      test('then it should return a  success response', () => {
        expect(response).toStrictEqual(resStub())
      })
    })
  })

  describe('deleteUserProfile', () => {
    describe('When  deleting a user', () => {
      let response: ResponseWithStatus
      let data: ServicePayload<null>
      let context: RmqContext

      beforeEach(async () => {
        data = {
          userId: UserProfileStub()._id as any,
          data: null
        }
        response = await usersController.deleteUserProfile(data, context)
      })
      test('then it should call listingService.deleteUserProfile', () => {
        expect(usersService.deleteUserProfile).toHaveBeenCalledWith(data.userId)
      })

      test('then it should return all category', () => {
        expect(response).toStrictEqual(resStub())
      })
    })
  })

  describe('getUserWithPhone', () => {
    describe('When getting user with phone', () => {
      let response: User
      let data: {phone: string}
      let context: RmqContext

      beforeEach(async () => {
        data = {
          phone: '0809599696'
        }
        response = await usersController.getUserWithPhone(data, context)
      })
      test('then it should call listingService.getUserWithPhone', () => {
        expect(usersService.getUserWithPhone).toHaveBeenCalledWith(data.phone)
      })

      test('then it should return a success user', () => {
        expect(response).toStrictEqual(UserProfileStub())
      })
    })
  })
})
