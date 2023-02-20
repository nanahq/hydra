import { getRepositoryToken } from '@nestjs/typeorm'
import { FitRpcException, ResponseWithStatus, UserEntity } from '@app/common'
import { Repository } from 'typeorm'
import { UsersService } from './users-service.service'
import { Test, TestingModule } from '@nestjs/testing'
import * as bcrypt from 'bcryptjs'
import { baseCreateQueryBuilder } from '../../__test__/testing/MockQueryBuilder'

describe('Users Service Unit Test', () => {
  const token = getRepositoryToken(UserEntity)
  let repo: Repository<UserEntity>
  let service: UsersService
  let moduleRef: TestingModule

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: token,
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              delete: jest.fn().mockReturnThis(),
              returning: jest.fn().mockReturnThis(),
              insert: jest.fn().mockReturnThis(),
              into: jest.fn().mockReturnThis(),
              values: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              execute: jest.fn().mockReturnThis(),
              update: jest.fn().mockReturnThis(),
              set: jest.fn().mockReturnThis(),
              getOne: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis()
            }))
          }
        }
      ]
    }).compile()

    service = moduleRef.get<UsersService>(UsersService)
    repo = moduleRef.get<Repository<UserEntity>>(token)
  })

  afterAll(async () => {
    await moduleRef.close()
  })

  const user = {
    phoneNumber: '+2348107641833',
    password: 'mfuhcvb845'
  }

  describe('Testing Stub init', () => {
    it('should be defined', async () => {
      expect(service).toBeDefined()
      expect(repo).toBeDefined()
    })
  })

  describe('Register a user', () => {
    it('should register a user without errors', async () => {
      baseCreateQueryBuilder.getOne = () => null as any // setting getone method to null due to existing user check
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder)
      const assertion = await service.register(user)
      expect(assertion).toStrictEqual({
        status: 1
      })
    })

    it('should not register existing user ', async () => {
      expect.assertions(3) // mandatory when asserting errors. This is the number of assertions in the catch block
      baseCreateQueryBuilder.getOne = () => user
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder)
      try {
        await service.register(user)
      } catch (error) {
        expect(error).toBeInstanceOf(FitRpcException)
        expect(error.message).toStrictEqual(
          'Phone Number is  already registered.'
        )
        expect(error.status).toStrictEqual(502)
      }
    })
  })

  describe('Validate user with phone  and email', () => {
    it('should validate user', async () => {
      const passwordHash = await bcrypt.hash(user.password, 10)
      baseCreateQueryBuilder.getOne = () => ({
        phoneNumber: user.phoneNumber,
        password: passwordHash
      })

      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder)
      expect(await service.validateUser(user)).toStrictEqual({
        status: 2,
        data: {
          password: '',
          phoneNumber: user.phoneNumber
        }
      })
    })

    // it('should throw an exception with incorrect phone number', async () => {
    //   expect.assertions(3)
    //
    //   baseCreateQueryBuilder.getOne = () => null
    //
    //   jest
    //     .spyOn(repo, 'createQueryBuilder')
    //     .mockImplementationOnce(() => baseCreateQueryBuilder)
    //
    //   try {
    //     await service.validateUser(user)
    //   } catch (error) {
    //     expect(error).toBeInstanceOf(FitRpcException)
    //     expect(error.message).toStrictEqual(
    //       'Provided phone number is not correct'
    //     )
    //     expect(error.status).toStrictEqual(401)
    //   }
    // })

    it('should throw an exception with incorrect password', async () => {
      expect.assertions(3)
      const passwordHash = await bcrypt.hash('WRONG_PASSWORD', 10)

      baseCreateQueryBuilder.getOne = () => ({
        phoneNumber: user.phoneNumber,
        password: passwordHash
      })

      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder)

      try {
        await service.validateUser(user)
      } catch (error) {
        expect(error).toBeInstanceOf(FitRpcException)
        expect(error.message).toStrictEqual('Provided Password is incorrect')
        expect(error.status).toStrictEqual(401)
      }
    })
  })

  describe('Get user by ID', () => {
    it('should get user', async () => {
      baseCreateQueryBuilder.getOne = () => user
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder)
      expect(await service.getUser({ userId: 'dnivondovifo' })).toStrictEqual({
        password: '',
        phoneNumber: user.phoneNumber
      })
    })

    it('should throw an exception with wrong id', async () => {
      expect.assertions(3)
      baseCreateQueryBuilder.getOne = () => null
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder)
      try {
        await service.getUser({ userId: 'FAKE_USER_ID' })
      } catch (error) {
        expect(error).toBeInstanceOf(FitRpcException)
        expect(error.message).toStrictEqual('Provided user id is not found')
        expect(error.status).toStrictEqual(401)
      }
    })
  })

  describe('Delete user profile', () => {
    it('should delete user with id ', async () => {
      baseCreateQueryBuilder.execute = () => user
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder)
      expect(
        await service.deleteUserProfile('dnivondovifo')
      ).toStrictEqual<ResponseWithStatus>({
        status: 1
      })
    })

    it('should throw an exception with wrong id', async () => {
      expect.assertions(3)
      baseCreateQueryBuilder.execute = () => null
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder)
      try {
        await service.deleteUserProfile('dnivondovifo')
      } catch (error) {
        expect(error).toBeInstanceOf(FitRpcException)
        expect(error.message).toStrictEqual(
          'Can not delete user. User does not exist'
        )
        expect(error.status).toStrictEqual(422)
      }
    })
  })

  describe('Update user status', () => {
    it('should update user status ', async () => {
      baseCreateQueryBuilder.execute = () => user
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder)
      expect(
        await service.updateUserStatus({ phoneNumber: user.phoneNumber })
      ).toStrictEqual<ResponseWithStatus>({
        status: 1
      })
    })

    it('should throw an exception with wrong phone number', async () => {
      expect.assertions(3)
      baseCreateQueryBuilder.execute = () => null
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder)
      try {
        await service.updateUserStatus({ phoneNumber: user.phoneNumber })
      } catch (error) {
        expect(error).toBeInstanceOf(FitRpcException)
        expect(error.message).toStrictEqual('Failed to update user status')
        expect(error.status).toStrictEqual(422)
      }
    })
  })

  describe('Update user profile', () => {
    it('should update user status ', async () => {
      baseCreateQueryBuilder.execute = () => user
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder)
      expect(
        await service.updateUserProfile({
          data: { firstName: 'Test' },
          userId: 'JNVKJDFVD'
        })
      ).toStrictEqual<ResponseWithStatus>({
        status: 1
      })
    })

    it('should throw an exception with wrong userId', async () => {
      expect.assertions(3)
      baseCreateQueryBuilder.execute = () => null
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder)
      try {
        await service.updateUserProfile({
          data: { firstName: 'Test' },
          userId: 'FAKE_USER_ID'
        })
      } catch (error) {
        expect(error).toBeInstanceOf(FitRpcException)
        expect(error.message).toStrictEqual('Failed to update user profile')
        expect(error.status).toStrictEqual(422)
      }
    })
  })
})
