import { getModelToken } from '@nestjs/mongoose'
import { Test } from '@nestjs/testing'
import { FilterQuery } from 'mongoose'
import { OrderRepository } from '../order.repository'
import { OrderModel } from './support/order.model'
import { OrderStub } from './stub/orders.stub'
import { Order } from '@app/common'

describe('Orders Services - Repository', () => {
  let ordersRepository: OrderRepository

  describe('operations', () => {
    let orderModel: OrderModel
    let orderFilterQuery: FilterQuery<Order>

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [
          OrderRepository,
          {
            provide: getModelToken(Order.name),
            useClass: OrderModel
          }
        ]
      }).compile()

      ordersRepository = moduleRef.get<OrderRepository>(OrderRepository)
      orderModel = moduleRef.get<OrderModel>(getModelToken(Order.name))

      orderFilterQuery = {
        _id: OrderStub()._id
      }

      jest.clearAllMocks()
    })

    describe('findOne', () => {
      describe('when findOne is called', () => {
        let order: Order | null

        beforeEach(async () => {
          jest.spyOn(orderModel, 'findOne')
          order = await ordersRepository.findOne(orderFilterQuery)
        })

        test('then it should return a orders ', () => {
          expect(order).toEqual(OrderStub())
        })
      })
    })

    describe('find', () => {
      describe('when find is called', () => {
        let order: Order[]

        beforeEach(async () => {
          jest.spyOn(orderModel, 'find')
          order = await ordersRepository.find(orderFilterQuery)
        })

        test('then it should return a order', () => {
          expect(order).toEqual([OrderStub()])
        })
      })
    })

    describe('findOneAndUpdate', () => {
      describe('when findOneAndUpdate is called', () => {
        let order: Order
        beforeEach(async () => {
          jest.spyOn(orderModel, 'findOne')
          order = await ordersRepository.findOneAndUpdate(orderFilterQuery, {
            ...OrderStub()
          })
        })

        test('then it should return an updated order', () => {
          expect(order).toEqual(OrderStub())
        })
      })
    })

    describe('create operations', () => {
      beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
          providers: [
            OrderRepository,
            {
              provide: getModelToken(Order.name),
              useValue: OrderModel
            }
          ]
        }).compile()

        ordersRepository = moduleRef.get<OrderRepository>(OrderRepository)
      })

      describe('create', () => {
        describe('when create is called', () => {
          let order: Order
          let saveSpy: jest.SpyInstance
          let constructorSpy: jest.SpyInstance

          beforeEach(async () => {
            saveSpy = jest.spyOn(OrderModel.prototype, 'save')
            constructorSpy = jest.spyOn(OrderModel.prototype, 'constructorSpy')
            order = await ordersRepository.create({
              listing: OrderStub().listing
            })
          })

          test('then it should call the orderModel', () => {
            expect(saveSpy).toHaveBeenCalled()
            expect(constructorSpy).toHaveBeenCalled()
          })

          test('then it should return a order', () => {
            expect(order).toEqual(OrderStub())
          })
        })
      })
    })
  })
})
