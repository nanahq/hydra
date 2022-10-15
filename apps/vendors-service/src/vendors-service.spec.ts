import { getRepositoryToken } from '@nestjs/typeorm'
import { FitRpcException, ResponseWithStatus, VendorEntity } from '@app/common'
import { Repository } from 'typeorm'
import { VendorsService } from './vendors.service'
import { TestingModule, Test } from '@nestjs/testing'
import * as bcrypt from 'bcrypt'
import { baseCreateQueryBuilder } from '../../__test__/testing/MockQueryBuilder'
import { HttpStatus } from '@nestjs/common'

describe('Users Service Unit Test', () => {
  const token = getRepositoryToken(VendorEntity)
  let repo: Repository<VendorEntity>
  let service: VendorsService
  let moduleRef: TestingModule

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        VendorsService,
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

    service = moduleRef.get<VendorsService>(VendorsService)
    repo = moduleRef.get<Repository<VendorEntity>>(token)
  })

  afterAll(async () => {
    await moduleRef.close()
  })

  const vendor: any = {
    businessPhoneNumber: '+2348107641833',
    password: 'mfuhcvb845',
    businessName: 'Test Kitchen',
    firstName: 'Test',
    lastName: 'Vendor'
  }

  describe('Testing Stub init', () => {
    it('should be defined', async () => {
      expect(service).toBeDefined()
      expect(repo).toBeDefined()
    })
  })

  describe('Register a vendor', () => {
    it('should register a user without errors', async () => {
      baseCreateQueryBuilder.getOne = () => null as any // setting getone method to null due to existing user check
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder)
      const assertion = await service.register(vendor)
      expect(assertion).toStrictEqual<ResponseWithStatus>({
        status: 1
      })
    })

    it('should not register existing vendor', async () => {
      expect.assertions(3) // mandatory when asserting errors. This is the number of assertions in the catch block
      baseCreateQueryBuilder.getOne = () => vendor
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder)
      try {
        await service.register(vendor)
      } catch (error) {
        expect(error).toBeInstanceOf(FitRpcException)
        expect(error.message).toStrictEqual<string>(
          'Phone Number is  already registered.'
        )
        expect(error.status).toStrictEqual<HttpStatus>(400)
      }
    })
  })

  describe('Validate vendors with phone  and email', () => {
    it('should validate user', async () => {
      const passwordHash = await bcrypt.hash(vendor.password, 10)
      baseCreateQueryBuilder.getOne = () => ({
        phoneNumber: '+2348107641833',
        password: passwordHash
      })
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder)
      expect(await service.validateVendor(vendor)).toStrictEqual({
        password: '',
        phoneNumber: '+2348107641833'
      })
    })

    it('should throw an exeception with incorrect phone number', async () => {
      expect.assertions(3)

      baseCreateQueryBuilder.getOne = () => null

      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder)

      try {
        await service.validateVendor(vendor)
      } catch (error) {
        expect(error).toBeInstanceOf(FitRpcException)
        expect(error.message).toStrictEqual(
          'Provided phone number is not correct'
        )
        expect(error.status).toStrictEqual(401)
      }
    })

    it('should throw an exception with incorrect password', async () => {
      expect.assertions(3)
      const passwordHash = await bcrypt.hash('WRONG_PASSWORD', 10)

      baseCreateQueryBuilder.getOne = () => ({
        phoneNumber: '+2348107641833',
        password: passwordHash
      })

      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder)

      try {
        await service.validateVendor(vendor)
      } catch (error) {
        expect(error).toBeInstanceOf(FitRpcException)
        expect(error.message).toStrictEqual('Provided Password is incorrect')
        expect(error.status).toStrictEqual(401)
      }
    })
  })

  describe('Get vendor by ID', () => {
    it('should get vendor', async () => {
      baseCreateQueryBuilder.getOne = () => vendor
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder)
      expect(await service.getVendor({ userId: 'dnivondovifo' })).toStrictEqual(
        {
          password: '',
          businessPhoneNumber: '+2348107641833',
          businessName: 'Test Kitchen',
          firstName: 'Test',
          lastName: 'Vendor'
        }
      )
    })

    it('should throw an exception with wrong id', async () => {
      expect.assertions(3)
      baseCreateQueryBuilder.getOne = () => null
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder)
      try {
        await service.getVendor({ userId: 'FAKE_USER_ID' })
      } catch (error) {
        expect(error).toBeInstanceOf(FitRpcException)
        expect(error.message).toStrictEqual('Provided vendor id is not found')
        expect(error.status).toStrictEqual(401)
      }
    })
  })

  describe('Delete vendor profile', () => {
    it('should delete vendor with id ', async () => {
      baseCreateQueryBuilder.execute = () => vendor
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder)
      expect(
        await service.deleteVendorProfile('dnivondovifo')
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
        await service.deleteVendorProfile('dnivondovifo')
      } catch (error) {
        expect(error).toBeInstanceOf(FitRpcException)
        expect(error.message).toStrictEqual(
          'Failed to delete vendor. Invalid ID'
        )
        expect(error.status).toStrictEqual(422)
      }
    })
  })

  describe('Update vendor status', () => {
    it('should update vendor status ', async () => {
      baseCreateQueryBuilder.execute = () => vendor
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder)
      expect(
        await service.updateVendorStatus({
          id: 'hdfdhvufv',
          status: 'APPROVED'
        })
      ).toStrictEqual<ResponseWithStatus>({
        status: 1
      })
    })

    it('should throw an exception with wrong  ID', async () => {
      expect.assertions(3)
      baseCreateQueryBuilder.execute = () => null
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder)
      try {
        await service.updateVendorStatus({ id: 'hdfdhvufv', status: '1' })
      } catch (error) {
        expect(error).toBeInstanceOf(FitRpcException)
        expect(error.message).toStrictEqual(
          'Failed to update user. Incorrect input'
        )
        expect(error.status).toStrictEqual(400)
      }
    })
  })

  describe('Update vendor profile', () => {
    it('should update user status ', async () => {
      baseCreateQueryBuilder.execute = () => vendor
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder)
      expect(
        await service.updateVendorProfile({
          data: { firstName: 'Test' },
          userId: 'JNVKJDFVD'
        })
      ).toStrictEqual<ResponseWithStatus>({
        status: 1
      })
    })

    it('should throw an exception with wrong vendorid', async () => {
      expect.assertions(3)
      baseCreateQueryBuilder.execute = () => null
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder)
      try {
        await service.updateVendorProfile({
          data: { firstName: 'Test' },
          userId: 'FAKE_USER_ID'
        })
      } catch (error) {
        expect(error).toBeInstanceOf(FitRpcException)
        expect(error.message).toStrictEqual('Failed to update vendor profile')
        expect(error.status).toStrictEqual(422)
      }
    })
  })
})
