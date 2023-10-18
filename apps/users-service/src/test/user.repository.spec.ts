import { getModelToken } from '@nestjs/mongoose'
import { Test } from '@nestjs/testing'
import { FilterQuery } from 'mongoose'
import { UserRepository } from '../users.repository'
import { UserModel } from './support/user.model'
import { UserProfileStub } from './stubs/user.stub'
import { User } from '@app/common'

describe('User Services - Repository', () => {
  let userRepository: UserRepository

  describe(' operations', () => {
    let userModel: UserModel
    let userFilterQuery: FilterQuery<User>

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [
          UserRepository,
          {
            provide: getModelToken(User.name),
            useClass: UserModel
          }
        ]
      }).compile()

      userRepository = moduleRef.get<UserRepository>(UserRepository)
      userModel = moduleRef.get<UserModel>(getModelToken(User.name))

      userFilterQuery = {
        _id: UserProfileStub()._id
      }

      jest.clearAllMocks()
    })

    describe('findOne', () => {
      describe('when findOne is called', () => {
        let user: User | null

        beforeEach(async () => {
          jest.spyOn(userModel, 'findOne')
          user = await userRepository.findOne(userFilterQuery)
        })

        test('then it should return a user ', () => {
          expect(user).toEqual(UserProfileStub())
        })
      })
    })

    describe('find', () => {
      describe('when find is called', () => {
        let user: User[]

        beforeEach(async () => {
          jest.spyOn(userModel, 'find')
          user = await userRepository.find(userFilterQuery)
        })

        test('then it should return a user', () => {
          expect(user).toEqual([UserProfileStub()])
        })
      })
    })

    describe('findOneAndUpdate', () => {
      describe('when findOneAndUpdate is called', () => {
        let user: User
        beforeEach(async () => {
          jest.spyOn(userModel, 'findOne')
          user = await userRepository.findOneAndUpdate(userFilterQuery, {
            ...UserProfileStub()
          })
        })

        test('then it should return a user Menu', () => {
          expect(user).toEqual(UserProfileStub())
        })
      })
    })

    describe('create operations', () => {
      beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
          providers: [
            UserRepository,
            {
              provide: getModelToken(User.name),
              useValue: UserModel
            }
          ]
        }).compile()

        userRepository = moduleRef.get<UserRepository>(UserRepository)
      })

      describe('create', () => {
        describe('when create is called', () => {
          let user: User
          let saveSpy: jest.SpyInstance
          let constructorSpy: jest.SpyInstance

          beforeEach(async () => {
            saveSpy = jest.spyOn(UserModel.prototype, 'save')
            constructorSpy = jest.spyOn(UserModel.prototype, 'constructorSpy')
            user = await userRepository.create(UserProfileStub())
          })

          test('then it should call the userModel', () => {
            expect(saveSpy).toHaveBeenCalled()
            expect(constructorSpy).toHaveBeenCalled()
          })

          test('then it should return a user', () => {
            expect(user).toEqual(UserProfileStub())
          })
        })
      })
    })
  })
})
