import { StartedTestContainer } from 'testcontainers'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { VendorsModule } from '../../vendors.module'
import { ClientProxy } from '@nestjs/microservices'
import {
  RabbitmqInstance,
  stopRabbitmqContainer
} from '@app/common/test/utils/rabbitmq.instace'
import { MongodbInstance } from '@app/common/test/utils/mongodb.instance'
import Docker from 'dockerode'
import {
  CreateVendorDto,
  LocationCoordinates,
  LoginVendorRequest,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  ResponseWithStatus,
  RmqModule,
  RmqService,
  ServicePayload,
  UpdateVendorSettingsDto,
  Vendor,
  VendorApprovalStatus,
  VendorSettings
} from '@app/common'
import { catchError, lastValueFrom } from 'rxjs'
import {
  VendorRepository,
  VendorSettingsRepository
} from '../../vendors.repository'
import * as bcrypt from 'bcryptjs'
import { ReasonDto } from '@app/common/database/dto/reason.dto'

describe('Vendors - E2E', () => {
  const port = 5673
  const rmqConnectionUri = `amqp://localhost:${port}`
  let app: INestApplication
  let mongo: StartedTestContainer
  let rabbitMq: Docker.Container
  let client: ClientProxy
  let repository: VendorRepository
  let vendorSettingsRepository: VendorSettingsRepository
  beforeAll(async () => {
    rabbitMq = await RabbitmqInstance(port)

    mongo = await MongodbInstance()

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        VendorsModule,
        RmqModule.register({
          name: QUEUE_SERVICE.VENDORS_SERVICE,
          fallbackUri: rmqConnectionUri
        })
      ]
    }).compile()

    app = moduleFixture.createNestApplication()
    const rmq = app.get<RmqService>(RmqService)
    app.connectMicroservice(
      rmq.getOption(QUEUE_SERVICE.VENDORS_SERVICE, false, rmqConnectionUri)
    )
    await app.startAllMicroservices()
    await app.init()

    client = app.get(QUEUE_SERVICE.VENDORS_SERVICE)
    repository = moduleFixture.get<VendorRepository>(VendorRepository)
    vendorSettingsRepository = moduleFixture.get<VendorSettingsRepository>(
      VendorSettingsRepository
    )
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
  describe('create operations', () => {
    afterEach(async () => {
      await repository.deleteMany()
      await vendorSettingsRepository.deleteMany()
    })
    describe('Register a new vendor', () => {
      let payload: CreateVendorDto
      let response: ResponseWithStatus
      beforeEach(async () => {
        payload = {
          email: 'manager@cpr.com',
          businessAddress: 'Ummi plaza suite c22',
          businessName: 'CPR delights',
          password: await bcrypt.hash('12345678', 10),
          firstName: 'Suraj',
          lastName: 'Auwal',
          phone: '+23481047474774'
        }
      })

      it('should successfully create a new vendor', async () => {
        response = await lastValueFrom<ResponseWithStatus>(
          client.send(QUEUE_MESSAGE.CREATE_VENDOR, payload).pipe(
            catchError((error) => {
              throw error
            })
          )
        )

        const vendors: Vendor[] = await repository.find({})
        expect(response).toStrictEqual({ status: 1 })
        expect(vendors.length).toStrictEqual(1)
      })

      // Exceptions assertions

      it('should throw an exception if registering with an existing email ', async () => {
        await repository.create(payload)

        try {
          await lastValueFrom<ResponseWithStatus>(
            client.send(QUEUE_MESSAGE.CREATE_VENDOR, payload)
          )
          fail(
            'Should throw an error when existing email is used to register a vendor'
          )
        } catch (error: any) {
          expect(error.message).toStrictEqual(
            'Email already registered. You can reset your password if forgotten'
          )
          expect(error.status).toStrictEqual(HttpStatus.CONFLICT)
        }
      })

      it('should throw an exception if registering with an existing phone ', async () => {
        await repository.create({ ...payload, email: 'test@nana.com' })

        try {
          await lastValueFrom<ResponseWithStatus>(
            client.send(QUEUE_MESSAGE.CREATE_VENDOR, payload)
          )
          fail(
            'Should throw an error when existing phone is used to register a vendor'
          )
        } catch (error: any) {
          expect(error.message).toStrictEqual(
            'Phone number already registered. You can reset your password if forgotten'
          )
          expect(error.status).toStrictEqual(HttpStatus.CONFLICT)
        }
      })
    })

    describe('create vendor settings', () => {
      let createSettingPayload: ServicePayload<UpdateVendorSettingsDto>

      let vendor: Vendor

      beforeEach(async () => {
        vendor = await repository.create({
          email: 'manager@cpr.com',
          businessAddress: 'Ummi plaza suite c22',
          businessName: 'CPR delights',
          password: await bcrypt.hash('12345678', 10),
          firstName: 'Suraj',
          lastName: 'Auwal',
          phone: '+23481047474774'
        })

        createSettingPayload = {
          userId: vendor._id.toString(),
          data: {
            payment: {
              bankAccountName: 'Julius Ceaser',
              bankAccountNumber: '1234567890',
              bankName: 'MY BANK'
            },
            operations: {
              startTime: Date.now().toLocaleString(),
              deliveryType: 'PRE_ORDER',
              minOrder: 2000,
              cutoffTime: Date.now().toLocaleString(),
              placementTime: Date.now().toLocaleString(),
              preparationTime: 30
            }
          }
        }
      })
      it('should create vendors settings', async () => {
        let _vendor: Vendor = await repository.findOneAndPopulate(
          { _id: vendor._id },
          ['settings']
        )

        expect(_vendor.settings).toStrictEqual(undefined)

        const response = await lastValueFrom<ResponseWithStatus>(
          client
            .send(QUEUE_MESSAGE.CREATE_VENDOR_SETTINGS, createSettingPayload)
            .pipe(
              catchError((error) => {
                throw error
              })
            )
        )

        expect(response).toStrictEqual({ status: 1 })

        _vendor = await repository.findOneAndPopulate({ _id: vendor._id }, [
          'settings'
        ])

        expect(_vendor.settings.payment).toStrictEqual({
          _id: expect.anything(),
          bankAccountName: createSettingPayload.data.payment?.bankAccountName,
          bankAccountNumber:
            createSettingPayload.data.payment?.bankAccountNumber,
          bankName: createSettingPayload.data.payment?.bankName
        })
        expect(_vendor.settings.operations).toStrictEqual({
          _id: expect.anything(),
          startTime: createSettingPayload.data.operations?.startTime,
          deliveryType: createSettingPayload.data.operations?.deliveryType,
          minOrder: createSettingPayload.data.operations?.minOrder,
          cutoffTime: createSettingPayload.data.operations?.cutoffTime,
          placementTime: createSettingPayload.data.operations?.placementTime,
          preparationTime:
            createSettingPayload.data.operations?.preparationTime
        })
      })
    })
  })

  describe('get operations', () => {
    let vendor: Vendor
    let vendor2: Vendor
    let settings: VendorSettings
    const password = '12345678'
    beforeEach(async () => {
      vendor = await repository.create({
        email: 'manager@cpr.com',
        businessAddress: 'Ummi plaza suite c22',
        businessName: 'CPR delights',
        password: await bcrypt.hash(password, 10),
        firstName: 'Suraj',
        lastName: 'Auwal',
        phone: '+23481047474774'
      })

      vendor2 = await repository.create({
        email: 'email@cpr.com',
        businessAddress: 'Ummi plaza suite c22',
        businessName: 'Kelly delights',
        password: await bcrypt.hash(password, 10),
        firstName: 'Kelly',
        lastName: 'Yahuza',
        phone: '+2348104774774',
        acc_status: VendorApprovalStatus.APPROVED
      })

      settings = await vendorSettingsRepository.create({
        vendor: vendor2._id.toString(),
        payment: {
          bankAccountName: 'Julius Ceaser',
          bankAccountNumber: '1234567890',
          bankName: 'MY BANK'
        },
        operations: {
          startTime: Date.now().toLocaleString(),
          deliveryType: 'PRE_ORDER',
          minOrder: 2000,
          cutoffTime: Date.now().toLocaleString(),
          placementTime: Date.now().toLocaleString(),
          preparationTime: 30
        }
      })
    })

    afterEach(async () => {
      await repository.deleteMany()
      await vendorSettingsRepository.deleteMany()
    })

    it('should get vendor by ID [JWT]', async () => {
      const v = await lastValueFrom<Vendor>(
        client.send(QUEUE_MESSAGE.GET_VENDOR_JWT, vendor._id.toString()).pipe(
          catchError((error) => {
            throw error
          })
        )
      )

      expect(v.email).toStrictEqual(vendor.email)
      expect(v.phone).toStrictEqual(vendor.phone)
      expect(v.firstName).toStrictEqual(vendor.firstName)
    })

    it('should get vendor by ID ', async () => {
      const payload: ServicePayload<string> = {
        userId: '',
        data: vendor._id.toString()
      }
      const v = await lastValueFrom<Vendor>(
        client.send(QUEUE_MESSAGE.GET_VENDOR, payload).pipe(
          catchError((error) => {
            throw error
          })
        )
      )

      expect(v.email).toStrictEqual(vendor.email)
      expect(v.phone).toStrictEqual(vendor.phone)
      expect(v.firstName).toStrictEqual(vendor.firstName)
    })

    it('should get vendor by email [login with email and password]', async () => {
      const loginRequest: LoginVendorRequest = {
        email: vendor.email,
        password
      }

      const v = await lastValueFrom<Vendor>(
        client.send(QUEUE_MESSAGE.GET_VENDOR_LOCAL, loginRequest).pipe(
          catchError((error) => {
            throw error
          })
        )
      )

      expect(v.email).toStrictEqual(vendor.email)
      expect(v.phone).toStrictEqual(vendor.phone)
      expect(v.firstName).toStrictEqual(vendor.firstName)
    })

    it('should get all vendors ', async () => {
      const vendors = await lastValueFrom<Vendor[]>(
        client.send(QUEUE_MESSAGE.GET_ALL_VENDORS, {}).pipe(
          catchError((error) => {
            throw error
          })
        )
      )

      expect(vendors).toBeDefined()
      expect(vendors.length).toStrictEqual(2)
      expect(vendors[0]._id.toString()).toStrictEqual(vendor._id.toString())
    })

    it('should get all vendors [users] ', async () => {
      const vendorsAll: Vendor[] = await repository.find({})

      expect(vendorsAll.length).toStrictEqual(2)
      expect(
        vendorsAll.some((v) => v.acc_status !== VendorApprovalStatus.APPROVED)
      ).toBeTruthy()

      const vendors = await lastValueFrom<Vendor[]>(
        client.send(QUEUE_MESSAGE.GET_ALL_VENDORS_USERS, {}).pipe(
          catchError((error) => {
            throw error
          })
        )
      )

      expect(vendors).toBeDefined()
      expect(vendors.length).toStrictEqual(1)
      expect(vendors[0]._id.toString()).toStrictEqual(vendor2._id.toString())
    })

    it('should get vendor settings', async () => {
      const vendorWithNoSetting: Vendor = await repository.findOneAndPopulate(
        { _id: vendor._id },
        ['settings']
      )
      expect(vendorWithNoSetting.settings).toBeUndefined()

      const vendorSetting = await lastValueFrom<VendorSettings>(
        client
          .send(QUEUE_MESSAGE.GET_VENDOR_SETTINGS, {
            userId: vendor2._id.toString(),
            data: null
          })
          .pipe(
            catchError((error) => {
              throw error
            })
          )
      )

      expect(vendorSetting.payment).toStrictEqual({
        _id: expect.anything(),
        bankAccountName: settings.payment?.bankAccountName,
        bankAccountNumber: settings.payment?.bankAccountNumber,
        bankName: settings.payment?.bankName
      })
      expect(vendorSetting.operations).toStrictEqual({
        _id: expect.anything(),
        startTime: settings.operations?.startTime,
        deliveryType: settings.operations?.deliveryType,
        minOrder: settings.operations?.minOrder,
        cutoffTime: settings.operations?.cutoffTime,
        placementTime: settings.operations?.placementTime,
        preparationTime: settings.operations?.preparationTime
      })
    })

    // Errors assertions
    it('should throw an unauthorized exception when ID is not found ', async () => {
      const FAKE_ID = '63f7f2d0a0f1d5158f43cb7b'
      try {
        await lastValueFrom<Vendor>(
          client.send(QUEUE_MESSAGE.GET_VENDOR_JWT, FAKE_ID)
        )
        fail('Should throw exception with wrong ID')
      } catch (error) {
        expect(error.message).toStrictEqual(
          `Provided vendor id is not found: ${FAKE_ID}`
        )
        expect(error.status).toStrictEqual(HttpStatus.UNAUTHORIZED)
      }
    })

    it('should throw an unauthorized exception when email is not found ', async () => {
      const FAKE_EMAIL = '63f7f2d0a0f1d5158f43cb7b'

      const loginRequest: LoginVendorRequest = {
        email: FAKE_EMAIL,
        password
      }

      try {
        await lastValueFrom<Vendor>(
          client.send(QUEUE_MESSAGE.GET_VENDOR_LOCAL, loginRequest)
        )
        fail('Should throw exception with wrong Email')
      } catch (error) {
        expect(error.message).toStrictEqual(
          'Incorrect email address. Please recheck and try again'
        )
        expect(error.status).toStrictEqual(HttpStatus.UNAUTHORIZED)
      }
    })

    it('should throw an unauthorized exception when incorrect password is use ', async () => {
      const loginRequest: LoginVendorRequest = {
        email: vendor.email,
        password: 'FAKE'
      }

      try {
        await lastValueFrom<Vendor>(
          client.send(QUEUE_MESSAGE.GET_VENDOR_LOCAL, loginRequest)
        )
        fail('Should throw exception with incorrect password')
      } catch (error) {
        expect(error.message).toStrictEqual(
          'Incorrect password. Please recheck and try again'
        )
        expect(error.status).toStrictEqual(HttpStatus.UNAUTHORIZED)
      }
    })
  })
  describe('update operations', () => {
    let vendor: Vendor
    let settings: VendorSettings

    beforeEach(async () => {
      vendor = await repository.create({
        email: 'manager@cpr.com',
        businessAddress: 'Ummi plaza suite c22',
        businessName: 'CPR delights',
        password: await bcrypt.hash('12345678', 10),
        firstName: 'Suraj',
        lastName: 'Auwal',
        phone: '+23481047474774'
      })

      settings = await vendorSettingsRepository.create({
        vendor: vendor._id.toString(),
        payment: {
          bankAccountName: 'Julius Ceaser',
          bankAccountNumber: '1234567890',
          bankName: 'MY BANK'
        },
        operations: {
          startTime: Date.now().toLocaleString(),
          deliveryType: 'PRE_ORDER',
          minOrder: 2000,
          cutoffTime: Date.now().toLocaleString(),
          placementTime: Date.now().toLocaleString(),
          preparationTime: 30
        }
      })
    })

    afterEach(async () => {
      await repository.deleteMany()
      await vendorSettingsRepository.deleteMany()
    })

    describe('updates', () => {
      it('should update vendor online| offline status ', async () => {
        const _vendor1 = await repository.findOne({
          _id: vendor._id.toString()
        })

        expect(_vendor1.status).toStrictEqual('ONLINE') // Assert default

        const response = await lastValueFrom<ResponseWithStatus>(
          client
            .send(QUEUE_MESSAGE.UPDATE_VENDOR_STATUS, {
              id: vendor._id.toString(),
              status: 'OFFLINE'
            })
            .pipe(
              catchError((error) => {
                throw error
              })
            )
        )

        expect(response).toStrictEqual({ status: 1 })

        const _vendor2 = await repository.findOne({
          _id: vendor._id.toString()
        })

        expect(_vendor2.status).toStrictEqual('OFFLINE') // Assert default
      })

      it('should update vendor profile', async () => {
        const _vendor1: Vendor = await repository.findOne({
          _id: vendor._id.toString()
        })

        expect(_vendor1.firstName).toStrictEqual('Suraj') // Assert default
        expect(_vendor1.phone).toStrictEqual('+23481047474774') // Assert default

        const response = await lastValueFrom<ResponseWithStatus>(
          client
            .send(QUEUE_MESSAGE.UPDATE_VENDOR_PROFILE, {
              userId: vendor._id.toString(),
              data: { phone: '+23481047474789', firstName: 'Malik' }
            })
            .pipe(
              catchError((error) => {
                throw error
              })
            )
        )

        expect(response).toStrictEqual({ status: 1 })

        const _vendor2 = await repository.findOne({
          _id: vendor._id.toString()
        })

        expect(_vendor2.firstName).toStrictEqual('Malik') // Assert updated
        expect(_vendor2.phone).toStrictEqual('+23481047474789') // Assert updated
      })

      it('should update vendor business logo', async () => {
        const payload: ServicePayload<string> = {
          userId: vendor._id.toString(),
          data: 'https://myimage.com/image.jpg'
        }
        const _vendor1: Vendor = await repository.findOne({
          _id: vendor._id.toString()
        })

        expect(_vendor1?.businessLogo).toStrictEqual(undefined) // Assert default

        const response = await lastValueFrom<ResponseWithStatus>(
          client.send(QUEUE_MESSAGE.UPDATE_VENDOR_LOGO, payload).pipe(
            catchError((error) => {
              throw error
            })
          )
        )
        expect(response).toStrictEqual({ status: 1 })
        const _vendor2: Vendor = await repository.findOne({
          _id: vendor._id.toString()
        })
        expect(_vendor2.businessLogo).toStrictEqual(
          'https://myimage.com/image.jpg'
        ) // Assert updated
      })

      it('should update vendor restaurant image', async () => {
        const _vendor1: Vendor = await repository.findOne({
          _id: vendor._id.toString()
        })

        expect(_vendor1?.restaurantImage).toStrictEqual(undefined) // Assert default

        const response = await lastValueFrom<ResponseWithStatus>(
          client
            .send(QUEUE_MESSAGE.UPDATE_VENDOR_IMAGE, {
              userId: vendor._id.toString(),
              data: 'https://myimage.com/image.jpg'
            })
            .pipe(
              catchError((error) => {
                throw error
              })
            )
        )

        expect(response).toStrictEqual({ status: 1 })

        const _vendor2 = await repository.findOne({
          _id: vendor._id.toString()
        })

        expect(_vendor2.restaurantImage).toStrictEqual(
          'https://myimage.com/image.jpg'
        ) // Assert updated
      })

      it('should update vendor settings ', async () => {
        const settings1: VendorSettings =
          await vendorSettingsRepository.findOne({
            _id: settings._id.toString()
          })

        expect(settings1?.payment.bankAccountName).toStrictEqual(
          settings.payment.bankAccountName
        ) // Assert default

        const response = await lastValueFrom<ResponseWithStatus>(
          client
            .send(QUEUE_MESSAGE.UPDATE_VENDOR_SETTING, {
              userId: vendor._id.toString(),
              data: { payment: { bankAccountName: 'ZENITH BANK' } }
            })
            .pipe(
              catchError((error) => {
                throw error
              })
            )
        )

        expect(response).toStrictEqual({ status: 1 })

        const settings2: VendorSettings =
          await vendorSettingsRepository.findOne({
            _id: settings._id.toString()
          })

        expect(settings2.payment.bankAccountName).toStrictEqual('ZENITH BANK') // Assert updated
      })

      it('should approve vendor', async () => {
        const _vendor1: Vendor = await repository.findOne({
          _id: vendor._id.toString()
        })

        expect(_vendor1.acc_status).toStrictEqual(VendorApprovalStatus.PENDING) // Assert default

        const response = await lastValueFrom<ResponseWithStatus>(
          client
            .send(QUEUE_MESSAGE.VENDOR_APPROVE, {
              userId: vendor._id.toString()
            })
            .pipe(
              catchError((error) => {
                throw error
              })
            )
        )

        expect(response).toStrictEqual({ status: 1 })

        const _vendor2 = await repository.findOne({
          _id: vendor._id.toString()
        })
        expect(_vendor2.acc_status).toStrictEqual(
          VendorApprovalStatus.APPROVED
        )
      })
      it('should reject vendor', async () => {
        const _vendor1: Vendor = await repository.findOne({
          _id: vendor._id.toString()
        })

        expect(_vendor1.acc_status).toStrictEqual(VendorApprovalStatus.PENDING) // Assert default

        const reason: ReasonDto = {
          reason: 'Not enough social rating'
        }
        const response = await lastValueFrom<ResponseWithStatus>(
          client
            .send(QUEUE_MESSAGE.VENDOR_DISAPPROVE, {
              userId: vendor._id.toString(),
              data: reason
            })
            .pipe(
              catchError((error) => {
                throw error
              })
            )
        )

        expect(response).toStrictEqual({ status: 1 })

        const _vendor2 = await repository.findOne({
          _id: vendor._id.toString()
        })
        expect(_vendor2.acc_status).toStrictEqual(
          VendorApprovalStatus.DISAPPROVED
        )
        expect(_vendor2.rejection_reason).toStrictEqual(reason.reason)
      })
    })
  })

  describe('delete operations', () => {
    let vendor: Vendor
    beforeEach(async () => {
      vendor = await repository.create({
        email: 'manager@cpr.com',
        businessAddress: 'Ummi plaza suite c22',
        businessName: 'CPR delights',
        password: await bcrypt.hash('12345678', 10),
        firstName: 'Suraj',
        lastName: 'Auwal',
        phone: '+23481047474774',
        settings: '63f7f2d0a0f1d5158f43cb7b'
      })
    })

    it('should delete profile', async () => {
      const _vendor1 = await repository.findOne({ _id: vendor._id.toString() })

      expect(_vendor1).toBeDefined() // Assert default
      expect(_vendor1.isDeleted).toStrictEqual(false) // Assert default

      const response = await lastValueFrom<ResponseWithStatus>(
        client
          .send(QUEUE_MESSAGE.DELETE_VENDOR_PROFILE, {
            userId: vendor._id.toString(),
            data: null
          })
          .pipe(
            catchError((error) => {
              throw error
            })
          )
      )

      expect(response).toStrictEqual({ status: 1 })

      const vendors: Vendor[] = await repository.find({})
      expect(vendors[0].isDeleted).toStrictEqual(true) // Assert default
    })
  })

  describe('Location - Coord operations', () => {
    let vendor1: Vendor
    let vendor2: Vendor
    let vendor3: Vendor

    beforeEach(async () => {
      vendor1 = await repository.create({
        email: 'manager@Siziling.com',
        businessAddress: 'Ummi plaza suite c22',
        businessName: 'Siziling Grills',
        password: await bcrypt.hash('12345678', 10),
        firstName: 'Suraj',
        lastName: 'Auwal',
        phone: '+23481047474774',
        settings: '63f7f2d0a0f1d5158f43cb7b',
        location: {
          type: 'Point',
          coordinates: [11.999201857001092, 8.564033772121808]
        }
      })
      vendor2 = await repository.create({
        email: 'manager@Yahuza.com',
        businessAddress: 'Ummi plaza suite c22',
        businessName: 'Yahuza',
        password: await bcrypt.hash('12345678', 10),
        firstName: 'Suraj',
        lastName: 'Auwal',
        phone: '+23481047474772',
        settings: '63f7f2d0a0f1d5158f43cb7b',
        location: {
          type: 'Point',
          coordinates: [11.986654144742642, 8.541619182307176]
        }
      })
      vendor3 = await repository.create({
        email: 'manager@Shaban.com',
        businessAddress: 'Ummi plaza suite c22',
        businessName: 'Shaban',
        password: await bcrypt.hash('12345678', 10),
        firstName: 'Suraj',
        lastName: 'Auwal',
        phone: '+23481047474773',
        settings: '63f7f2d0a0f1d5158f43cb7b',
        location: {
          type: 'Point',
          coordinates: [11.977087785371152, 8.535503614677415]
        }
      })
    })

    it('should get vendors within  3k of specified point ', async () => {
      const userLocation: LocationCoordinates = {
        type: 'Point',
        coordinates: [11.982653944440587, 8.53611196845496]
      } // not more than 3000 meters from all vendors but vendor1

      const response = await lastValueFrom<Vendor[]>(
        client
          .send(QUEUE_MESSAGE.GET_NEAREST_VENDORS, { data: { userLocation } })
          .pipe(
            catchError((error) => {
              throw error
            })
          )
      )

      expect(response.length).toStrictEqual(2)
      expect(
        response.some((v) => v.businessName === vendor2.businessName)
      ).toStrictEqual(true) // Yahuza restaurant
      expect(
        response.some((v) => v.businessName === vendor3.businessName)
      ).toStrictEqual(true) // Shaban restaurant
      expect(
        response.some((v) => v.businessName === vendor1.businessName)
      ).toStrictEqual(false) // Sizzling grills restaurant
    })
  })
})
