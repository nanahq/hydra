import { Test } from '@nestjs/testing'
import { VendorsService } from '../vendors.service'
import { VendorsController } from '../vendors.controller'
import {
  LoginVendorRequest,
  ResponseWithStatus,
  RmqService,
  ServicePayload,
  TokenPayload,
  UpdateVendorStatus,
  Vendor,
  VendorSettings
} from '@app/common'
import {
  CreateVendorDto,
  UpdateVendorSettingsDto
} from '@app/common/database/dto/vendor.dto'
import { RmqContext } from '@nestjs/microservices'
import { VendorStub } from './stubs/vendor.stub'
import { VendorSettingStub } from './stubs/VendorSettings.stub'

export const RmqServiceMock = {
  ack: jest.fn()
}

jest.mock('../vendors.service.ts')

describe('vendorsController', () => {
  let vendorsController: VendorsController
  let vendorsService: VendorsService

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [VendorsController],
      providers: [VendorsService, RmqService]
    })
      .overrideProvider(RmqService)
      .useValue(RmqServiceMock)
      .compile()

    vendorsController = moduleRef.get<VendorsController>(VendorsController)
    vendorsService = moduleRef.get<VendorsService>(VendorsService)
    jest.clearAllMocks()
  })

  describe('registerNewVendor', () => {
    describe('When registerNewVendor is Called', () => {
      let response: ResponseWithStatus
      let vendor: CreateVendorDto
      let context: RmqContext
      beforeEach(async () => {
        vendor = {
          firstName: 'Suraj',
          lastName: 'Auwal',
          businessName: "Jay's Pizza",
          businessEmail: 'suraj@gmail.com',
          businessAddress: 'Tsamiyar boka',
          phone: '+2348107641933',
          password: '12345678',
          email: 'siradjiawoual@gmail.com'
        }

        response = await vendorsController.registerNewVendor(vendor, context)
      })
      test('then it should call vendorsService', () => {
        expect(vendorsService.register).toBeCalledWith(vendor)
      })

      test('then is should return a success response', () => {
        expect(response).toStrictEqual({ status: 1 })
      })
    })
  })

  describe('updateVendorStatus', () => {
    describe('when updating Vendor Status', () => {
      let response: ResponseWithStatus
      let status: UpdateVendorStatus
      let context: RmqContext

      beforeEach(async () => {
        status = {
          id: VendorStub()._id as any,
          status: 'ONLINE'
        }
        response = await vendorsController.updateVendorStatus(status, context)
      })
      test('then it should call VendorService', () => {
        expect(vendorsService.updateVendorStatus).toHaveBeenCalledWith(status)
      })

      test('then it should return a success response', () => {
        expect(response).toStrictEqual({ status: 1 })
      })
    })
  })

  describe('getVendorByEmail', () => {
    describe('when a vendor login', () => {
      let response: Vendor
      let loginData: LoginVendorRequest
      let context: RmqContext

      beforeEach(async () => {
        loginData = {
          password: VendorStub().password as any,
          businessEmail: VendorStub().businessEmail as any
        }
        response = await vendorsController.getVendorByEmail(loginData, context)
      })
      test('then it should call validateVendor', () => {
        expect(vendorsService.validateVendor).toHaveBeenCalledWith(loginData)
      })

      test('then it should return a vendor', () => {
        expect(response).toStrictEqual(VendorStub())
      })
    })
  })

  describe('getVendorByEmail', () => {
    describe('when a vendor login', () => {
      let response: Vendor
      let loginData: LoginVendorRequest
      let context: RmqContext
      beforeEach(async () => {
        loginData = {
          password: VendorStub().password as any,
          businessEmail: VendorStub().businessEmail as any
        }
        response = await vendorsController.getVendorByEmail(loginData, context)
      })
      test('then it should call validateVendor', () => {
        expect(vendorsService.validateVendor).toHaveBeenCalledWith(loginData)
      })

      test('then it should return a vendor', () => {
        expect(response).toStrictEqual(VendorStub())
      })
    })
  })

  describe('getVendorById', () => {
    describe('When getting a vendor by ID', () => {
      let response: Vendor
      let token: TokenPayload
      let context: RmqContext

      beforeEach(async () => {
        token = {
          userId: VendorStub()._id as any
        }
        response = await vendorsController.getVendorById(token as any, context)
      })
      test('then it should call validateVendor', () => {
        expect(vendorsService.getVendor).toHaveBeenCalledWith(token)
      })

      test('then it should return a vendor', () => {
        expect(response._id).toStrictEqual(VendorStub()._id)
      })

      test('then it should fail when called with a wrong ID', async () => {
        const fakeId: any = 'FAKE_ID'
        response = await vendorsController.getVendorById(
          { userId: fakeId } as any,
          context
        )
        expect(response._id === fakeId).toBeFalsy()
      })
    })
  })

  describe('updateVendorProfile', () => {
    describe('When updating a vendor profile', () => {
      let response: ResponseWithStatus
      let data: ServicePayload<Partial<Vendor>>
      let context: RmqContext

      beforeEach(async () => {
        data = {
          userId: VendorStub()._id as any,
          data: VendorStub()
        }
        response = await vendorsController.updateVendorProfile(data, context)
      })
      test('then it should call updateVendorProfile', () => {
        expect(vendorsService.updateVendorProfile).toHaveBeenCalledWith(data)
      })

      test('then it should return a success response', () => {
        expect(response).toStrictEqual({ status: 1 })
      })
    })
  })

  describe('deleteVendorProfile', () => {
    describe('When deleting a vendor profile', () => {
      let response: ResponseWithStatus
      let data: ServicePayload<null>
      let context: RmqContext

      beforeEach(async () => {
        data = {
          userId: VendorStub()._id as any,
          data: null
        }
        response = await vendorsController.deleteVendorProfile(data, context)
      })
      test('then it should call deleteVendorProfile', () => {
        expect(vendorsService.deleteVendorProfile).toHaveBeenCalledWith(
          data.userId
        )
      })

      test('then it should return a success response', () => {
        expect(response).toStrictEqual({ status: 1 })
      })
    })
  })

  describe('getSingleVendor', () => {
    describe('When a  single vendor', () => {
      let response: Vendor
      let data: ServicePayload<string>
      let context: RmqContext

      beforeEach(async () => {
        data = {
          userId: '',
          data: VendorStub()._id as any
        }
        response = await vendorsController.getSingleVendor(data, context)
      })
      test('then it should call getVendor', () => {
        expect(vendorsService.getVendor).toHaveBeenCalledWith({
          userId: data.data
        })
      })

      test('then it should return a vendor', () => {
        expect(response).toStrictEqual(VendorStub())
      })
    })
  })

  describe('getAllVendors', () => {
    describe('When getting all vendors', () => {
      let response: Vendor[]
      let context: RmqContext

      beforeEach(async () => {
        response = await vendorsController.getAllVendors(context)
      })
      test('then it should call getAllVendors', () => {
        expect(vendorsService.getAllVendors).toHaveBeenCalledWith()
      })

      test('then it should return a list of vendors', () => {
        expect(response).toStrictEqual([VendorStub()])
      })
    })
  })

  describe('getAllVendors', () => {
    describe('When getting all vendors', () => {
      let response: Vendor[]
      let context: RmqContext

      beforeEach(async () => {
        response = await vendorsController.getAllVendors(context)
      })
      test('then it should call getAllVendors', () => {
        expect(vendorsService.getAllVendors).toHaveBeenCalledWith()
      })

      test('then it should return a list of vendors', () => {
        expect(response).toStrictEqual([VendorStub()])
      })
    })
  })

  describe('getAllVendorsUser', () => {
    describe('When getting all vendors', () => {
      let response: any[]
      let context: RmqContext

      beforeEach(async () => {
        response = await vendorsController.getAllVendorsUser(context)
      })
      test('then it should call getAllVendors', () => {
        expect(vendorsService.getAllVendorsUser).toHaveBeenCalledWith()
      })

      test('then it should return a list of vendors', () => {
        expect(response).toStrictEqual([VendorStub()])
      })
    })
  })

  describe('updateVendorSettings', () => {
    describe('When updating vendor settings', () => {
      let response: ResponseWithStatus
      let data: ServicePayload<UpdateVendorSettingsDto>
      let context: RmqContext

      beforeEach(async () => {
        data = {
          userId: VendorStub()._id as any,
          data: {
            operation: { startTime: '11:30' }
          }
        }
        response = await vendorsController.updateVendorSettings(data, context)
      })
      test('then it should call updateVendorSettings', () => {
        expect(vendorsService.updateSettings).toHaveBeenCalledWith(
          data.data,
          data.userId
        )
      })

      test('then it should return a success response', () => {
        expect(response).toStrictEqual({ status: 1 })
      })
    })
  })
  describe('getVendorSettings', () => {
    describe('When getting vendor settings', () => {
      let response: VendorSettings
      let data: ServicePayload<null>
      let context: RmqContext

      beforeEach(async () => {
        data = {
          userId: VendorSettingStub().vendorId as any,
          data: null
        }
        response = await vendorsController.getVendorSettings(data, context)
      })
      test('then it should call updateVendorSettings', () => {
        expect(vendorsService.getVendorSettings).toHaveBeenCalledWith(
          data.userId
        )
      })

      test('then it should return a vendor settings', () => {
        expect(response.vendorId).toStrictEqual(data.userId)
      })
    })
  })

  describe('createVendorSettings', () => {
    describe('When creating vendor settings', () => {
      let response: ResponseWithStatus
      let data: ServicePayload<UpdateVendorSettingsDto>
      let context: RmqContext

      beforeEach(async () => {
        data = {
          userId: VendorSettingStub().vendorId as any,
          data: {
            payment: {
              bankAccountName: 'GOOD VENDOR',
              bankAccountNumber: '000000000',
              bankName: 'MY BANK'
            }
          }
        }
        response = await vendorsController.createVendorSettings(data, context)
      })
      test('then it should call updateVendorSettings', () => {
        expect(vendorsService.createVendorSettings).toHaveBeenCalledWith(
          data.data,
          data.userId
        )
      })

      test('then it should return a vendor settings', () => {
        expect(response).toStrictEqual({ status: 1 })
      })
    })
  })

  describe('updateVendorLogo', () => {
    describe('When updating vendor logo', () => {
      let data: ServicePayload<string>
      let context: RmqContext

      beforeEach(async () => {
        data = {
          userId: VendorSettingStub().vendorId as any,
          data: 'https://mygoogle.com/logo.png'
        }
        await vendorsController.updateVendorLogo(data, context)
      })
      test('then it should call updateVendorSettings', () => {
        expect(vendorsService.updateVendorLogo).toHaveBeenCalledWith(
          data.data,
          data.userId
        )
      })
    })
  })
})
