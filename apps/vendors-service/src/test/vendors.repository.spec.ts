
import { getModelToken } from '@nestjs/mongoose'
import { Test } from '@nestjs/testing'
import { FilterQuery } from 'mongoose'
import { VendorRepository, VendorSettingsRepository } from '../vendors.repository'
import { Vendor, VendorSettings } from '@app/common'
import { VendorModel, VendorSettingsModel } from './support/Vendor.model'
import { VendorStub } from './stubs/vendor.stub'
import { VendorSettingStub } from './stubs/VendorSettings.stub'

describe('VendorsRepository', () => {
  let vendorRepository: VendorRepository
  describe('find operations', () => {
    let vendorModel: VendorModel
    let userFilterQuery: FilterQuery<Vendor>

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [
          VendorRepository,
          {
            provide: getModelToken(Vendor.name),
            useClass: VendorModel
          }
        ]
      }).compile()

      vendorRepository = moduleRef.get<VendorRepository>(VendorRepository)
      vendorModel = moduleRef.get<VendorModel>(getModelToken(Vendor.name))

      userFilterQuery = {
        _id: VendorStub()._id
      }

      jest.clearAllMocks()
    })

    describe('findOne', () => {
      describe('when findOne is called', () => {
        let vendor: Vendor | null

        beforeEach(async () => {
          jest.spyOn(vendorModel, 'findOne')
          vendor = await vendorRepository.findOne(userFilterQuery)
        })

        test('then it should return a vendor', () => {
          expect(vendor).toEqual(VendorStub())
        })
      })
    })

    describe('find', () => {
      describe('when find is called', () => {
        let vendors: Vendor[]

        beforeEach(async () => {
          jest.spyOn(vendorModel, 'find')
          vendors = await vendorRepository.find(userFilterQuery)
        })

        test('then it should return all vendors', () => {
          expect(vendors).toEqual([VendorStub()])
        })
      })
    })

    describe('findOneAndUpdate', () => {
      describe('when findOneAndUpdate is called', () => {
        let vendor: Vendor

        beforeEach(async () => {
          jest.spyOn(vendorModel, 'findOneAndUpdate')
          vendor = await vendorRepository.findOneAndUpdate(userFilterQuery, VendorStub())
        })

        test('then it should return a vendor', () => {
          expect(vendor).toEqual(VendorStub())
        })
      })
    })
  })

  // describe('create operations', () => {
  //     let vendorModel: VendorModel
  //     beforeEach(async () => {
  //         const moduleRef = await Test.createTestingModule({
  //             providers: [
  //                 VendorRepository,
  //                 {
  //                     provide: getModelToken(Vendor.name),
  //                     useValue: VendorModel,
  //                 }
  //             ],
  //         })
  //             .compile();
  //         vendorModel = moduleRef.get<VendorModel>(getModelToken(Vendor.name));
  //         vendorRepository = moduleRef.get<VendorRepository>(VendorRepository);
  //     });
  //
  //     describe('create', () => {
  //         describe('when create is called', () => {
  //             let vendor: Vendor;
  //             const {_id, ...rest} = VendorStub()
  //             const payload:any = {
  //                 ...rest
  //             }
  //             beforeEach(async () => {
  //                 jest.spyOn(VendorModel.prototype, 'create');
  //                 vendor = await vendorRepository.create(payload);
  //             })
  //             test('then it should return a user', () => {
  //                 expect(Vendor).toEqual(VendorStub());
  //             })
  //         })
  //     })
  // })
})

describe('VendorsSettingsRepository', () => {
  let vendorSettingsRepository: VendorSettingsRepository
  describe('find operations', () => {
    let vendorSettingsModel: VendorSettingsModel
    let userFilterQuery: FilterQuery<VendorSettings>

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [
          VendorSettingsRepository,
          {
            provide: getModelToken(VendorSettings.name),
            useClass: VendorSettingsModel
          }
        ]
      }).compile()

      vendorSettingsRepository = moduleRef.get<VendorSettingsRepository>(VendorSettingsRepository)
      vendorSettingsModel = moduleRef.get<VendorSettingsModel>(getModelToken(VendorSettings.name))

      userFilterQuery = {
        vendorId: VendorSettingStub().vendorId
      }

      jest.clearAllMocks()
    })

    describe('findOne', () => {
      describe('when findOne is called', () => {
        let vendorSettings: VendorSettings | null

        beforeEach(async () => {
          jest.spyOn(vendorSettingsModel, 'findOne')
          vendorSettings = await vendorSettingsRepository.findOne(userFilterQuery)
        })

        test('then it should return a vendor', () => {
          expect(vendorSettings).toEqual(VendorSettingStub())
        })
      })
    })

    describe('find', () => {
      describe('when find is called', () => {
        let vendorSettings: VendorSettings[]

        beforeEach(async () => {
          jest.spyOn(vendorSettingsModel, 'find')
          vendorSettings = await vendorSettingsRepository.find(userFilterQuery)
        })

        test('then it should return all vendors', () => {
          expect(vendorSettings).toEqual([VendorSettingStub()])
        })
      })
    })

    describe('findOneAndUpdate', () => {
      describe('when findOneAndUpdate is called', () => {
        let vendorSettings: VendorSettings

        beforeEach(async () => {
          jest.spyOn(vendorSettingsModel, 'findOneAndUpdate')
          vendorSettings = await vendorSettingsRepository.findOneAndUpdate(userFilterQuery, VendorStub())
        })

        test('then it should return a vendor', () => {
          expect(vendorSettings).toEqual(VendorSettingStub())
        })
      })
    })
  })

  // describe('create operations', () => {
  //     let vendorSettingsModel: VendorSettingsModel
  //     let vendorSettingsRepository: VendorSettingsRepository
  //     beforeEach(async () => {
  //         const moduleRef = await Test.createTestingModule({
  //             providers: [
  //                 VendorSettingsRepository,
  //                 {
  //                     provide: getModelToken(VendorSettings.name),
  //                     useValue: VendorSettingsModel,
  //                 }
  //             ],
  //         })
  //             .compile();
  //         vendorSettingsModel = moduleRef.get<VendorSettingsModel>(getModelToken(VendorSettings.name));
  //         vendorSettingsRepository = moduleRef.get<VendorSettingsRepository>(VendorSettingsRepository);
  //     });
  //
  //     describe('create', () => {
  //         describe('when create is called', () => {
  //             let vendorSettings: VendorSettings;
  //             beforeEach(async () => {
  //                 jest.spyOn(VendorSettingsModel.prototype, 'create')
  //                 vendorSettings = await vendorSettingsRepository.create(VendorSettingStub());
  //             })
  //             test('then it should return a user', () => {
  //                 expect(vendorSettings).toEqual(VendorStub());
  //             })
  //         })
  //     })
  // })
})
