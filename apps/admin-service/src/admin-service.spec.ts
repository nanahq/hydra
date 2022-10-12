import { AdminServiceService } from './admin-service.service'
import { Repository } from 'typeorm'
import {
  AdminEntity,
  FitRpcException,
  RegisterAdminDTO,
  ResponseWithStatus
} from '@app/common'
import { getRepositoryToken } from '@nestjs/typeorm'
import { TestingModule, Test } from '@nestjs/testing'
import { baseCreateQueryBuilder } from '../../__test__/testing/MockQueryBuilder'
import * as bcrypt from 'bcrypt'
import { HttpStatus } from '@nestjs/common'

describe('Admin Service Unit Test', () => {
  let service: AdminServiceService
  let repo: Repository<AdminEntity>
  const token = getRepositoryToken(AdminEntity)
  let moduleRef: TestingModule

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        AdminServiceService,
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

    repo = moduleRef.get<Repository<AdminEntity>>(token)
    service = moduleRef.get<AdminServiceService>(AdminServiceService)
  })

  afterAll(async () => {
    await moduleRef.close()
  })

  const adminDto: RegisterAdminDTO = {
    userName: 'admin',
    password: 'hreh9eh98vre9',
    firstName: 'Super',
    lastName: 'Admin'
  }

  describe('Create a new admin', () => {
    it('should create a new user', async () => {
      baseCreateQueryBuilder.execute = () => adminDto
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder)

      expect(
        await service.createAdmin(adminDto)
      ).toStrictEqual<ResponseWithStatus>({
        status: 1
      })
    })

    it('should throw an exception with wrong input', async () => {
      expect.assertions(3)
      baseCreateQueryBuilder.execute = () => null
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder)

      try {
        await service.createAdmin(adminDto)
      } catch (error) {
        expect(error).toBeInstanceOf(FitRpcException)
        expect(error.status).toStrictEqual(400)
        expect(error.message).toStrictEqual(
          'Failed to create admin. Check submitted values'
        )
      }
    })
  })

  describe('Validate admin', () => {
    it('should validate with username and password', async () => {
      const password = await bcrypt.hash('password', 10)
      baseCreateQueryBuilder.getOne = () => ({
        userName: 'admin',
        password,
        firstName: 'Super',
        lastName: 'Admin'
      })
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder)
      expect(
        await service.validateAdminWithPassword({
          userName: 'admin',
          password: 'password'
        })
      ).toStrictEqual({
        userName: 'admin',
        password: '',
        firstName: 'Super',
        lastName: 'Admin'
      })
    })

    it('should throw an exception with incorrect username', async () => {
      expect.assertions(3)
      baseCreateQueryBuilder.getOne = () => null
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder)

      try {
        await service.validateAdminWithPassword({
          userName: 'admin',
          password: ' password'
        })
      } catch (error) {
        expect(error).toBeInstanceOf(FitRpcException)
        expect(error.status).toStrictEqual<HttpStatus>(401)
        expect(error.message).toStrictEqual<string>(
          'Provided username is incorrect'
        )
      }
    })

    it('should throw an exception with incorrect password', async () => {
      expect.assertions(3)
      const password = await bcrypt.hash('password', 10)
      baseCreateQueryBuilder.getOne = () => ({
        userName: 'admin',
        password,
        firstName: 'Super',
        lastName: 'Admin'
      })
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder)
      try {
        await service.validateAdminWithPassword({
          userName: 'admin',
          password: 'WRONG_PASSWORD'
        })
      } catch (error) {
        expect(error).toBeInstanceOf(FitRpcException)
        expect(error.status).toStrictEqual<HttpStatus>(401)
        expect(error.message).toStrictEqual<string>(
          'Provided Password is incorrect'
        )
      }
    })
  })

  describe('get admin', () => {
    it('should get admin by id', async () => {
      baseCreateQueryBuilder.getOne = () => adminDto
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder)
      expect(await service.validateAdminWithId('fudosvebu439')).toStrictEqual({
        userName: 'admin',
        password: '',
        firstName: 'Super',
        lastName: 'Admin'
      })
    })

    it('should throw an execption with wrong id', async () => {
      expect.assertions(3)
      baseCreateQueryBuilder.getOne = () => null
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder)
      try {
        await service.validateAdminWithId('WRONG_ID')
      } catch (error) {
        expect(error).toBeInstanceOf(FitRpcException)
        expect(error.status).toStrictEqual<HttpStatus>(401)
        expect(error.message).toStrictEqual<string>(
          'Can not find Admin with the provided ID'
        )
      }
    })
  })

  describe('update admin access', () => {
    it('should change admin access', async () => {
      baseCreateQueryBuilder.execute = () => adminDto
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder)
      expect(
        await service.changeAdminAccess({ id: 'oudvhuodfvudh', level: '3' })
      ).toStrictEqual<ResponseWithStatus>({ status: 1 })
    })

    it('should throw an exception with wrong data', async () => {
      expect.assertions(3)
      baseCreateQueryBuilder.execute = () => null
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder)

      try {
        await service.changeAdminAccess({
          id: 'WRONG_ID',
          level: 'WRONG_LEVEL'
        })
      } catch (error) {
        expect(error).toBeInstanceOf(FitRpcException)
        expect(error.status).toStrictEqual<HttpStatus>(400)
        expect(error.message).toStrictEqual<string>(
          'Failed to update admin level. admin with id not found'
        )
      }
    })
  })

  describe('delete admin', () => {
    it('should delete admin', async () => {
      baseCreateQueryBuilder.execute = () => adminDto
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder)
      expect(
        await service.deleteAdminProfile('on030voonvvn')
      ).toStrictEqual<ResponseWithStatus>({ status: 1 })
    })

    it('should throw an exception with wrong id', async () => {
      expect.assertions(3)
      baseCreateQueryBuilder.execute = () => null
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder)

      try {
        await service.deleteAdminProfile('WRONG_ID')
      } catch (error) {
        expect(error).toBeInstanceOf(FitRpcException)
        expect(error.status).toStrictEqual<HttpStatus>(400)
        expect(error.message).toStrictEqual<string>(
          'Failed to delete admin. Id is not correct'
        )
      }
    })
  })
})
