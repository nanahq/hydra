import { Test } from '@nestjs/testing'
import {
  Order, OrderStatus,
  PlaceOrderDto, ResponseWithStatus,
  RmqService, ServicePayload, UpdateOrderStatusPaidRequestDto, UpdateOrderStatusRequestDto
} from '@app/common'
import { RmqContext } from '@nestjs/microservices'
import { OrdersServiceController } from '../orders-service.controller'
import { OrdersServiceService } from '../orders-service.service'
import { ResStub, OrderStub } from './stub/orders.stub'

export const RmqServiceMock = {
  ack: jest.fn()
}

jest.mock('../orders-service.service')

describe('ordersServiceController', () => {
  let ordersController: OrdersServiceController
  let ordersService: OrdersServiceService
  let context: RmqContext

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [OrdersServiceController],
      providers: [OrdersServiceService, RmqService]
    })
      .overrideProvider(RmqService)
      .useValue(RmqServiceMock)
      .compile()

    ordersController = moduleRef.get<OrdersServiceController>(
      OrdersServiceController
    )
    ordersService = moduleRef.get<OrdersServiceService>(OrdersServiceService)
    jest.clearAllMocks()
  })

  describe('Place Order', () => {
    describe('When placing new order', () => {
      let response: ResponseWithStatus
      let payload: ServicePayload<PlaceOrderDto>
      beforeEach(async () => {
        payload = {
          userId: '',
          data: {
            user: '64ff9ff02d8446b9640d06ef',
            vendor: '64f84b15982c515116f9789c',
            listing: '64ff9ff02d8446b9640d06ef',
            quantity: '5',
            totalOrderValue: 4000,
            orderType: 'ON_DEMAND',
            orderValuePayable: 600,
            deliveryAddress: 'Abuja zone five',
            primaryContact: '+2348107641933',
            isThirdParty: false,
            preciseLocation: {
              type: 'Point',
              coordinates: [
                11.982310162127954,
                8.535510571613452
              ]
            },
            options: ['Zobo', 'Kunun Aya'],
            orderDeliveryScheduledTime: '1694032653748',
            orderBreakDown: {
              orderCost: 5000,
              systemFee: 200,
              deliveryFee: 500,
              vat: 100
            }
          }
        }

        response = await ordersController.placeOrder(payload, context)
      })
      test('then it should call ordersService.placeOrder', () => {
        expect(ordersService.placeOrder).toBeCalledWith(payload)
      })

      test('then is should return a charge request', () => {
        expect(response).toStrictEqual(ResStub())
      })
    })
  })

  describe('Get Operations', () => {
    describe('when getting vendors orders', () => {
      let response: Order[]
      let payload: ServicePayload<null>

      beforeEach(async () => {
        payload = {
          userId: OrderStub().user,
          data: null
        }
        response = await ordersController.getVendorsOrders(payload, context)
      })

      test('then it should call ordersService.getAllVendorOrders', () => {
        expect(ordersService.getAllVendorOrders).toBeCalledWith(payload.userId)
      })

      test('then is should return array of vendor orders', () => {
        expect(response).toStrictEqual([OrderStub()])
      })
    })

    describe('when getting user orders', () => {
      let response: Order[]
      let payload: ServicePayload<null>

      beforeEach(async () => {
        payload = {
          userId: OrderStub().user,
          data: null
        }
        response = await ordersController.getUsersOrders(payload, context)
      })

      test('then it should call ordersService.getAllUserOrders', () => {
        expect(ordersService.getAllUserOrders).toBeCalledWith(payload.userId)
      })

      test('then is should return array of user orders', () => {
        expect(response).toStrictEqual([OrderStub()])
      })
    })
    describe('when admin getting user orders', () => {
      let response: Order[]
      let payload: ServicePayload<null>

      beforeEach(async () => {
        payload = {
          userId: OrderStub().user,
          data: null
        }
        response = await ordersController.getAllUserOrders(payload, context)
      })

      test('then it should call ordersService.getUsersOrders', () => {
        expect(ordersService.getAllUserOrders).toBeCalledWith(payload.userId)
      })

      test('then is should return array of user orders', () => {
        expect(response).toStrictEqual([OrderStub()])
      })
    })

    describe('when getting fulfilled orders', () => {
      let response: Order[]

      beforeEach(async () => {
        response = await ordersController.getAllFulfilledOrders(context)
      })

      test('then it should call ordersService.getAllFulfilledOrders', () => {
        expect(ordersService.getAllFulfilledOrders).toBeCalled()
      })

      test('then is should return array of fulfilled orders', () => {
        expect(response).toStrictEqual([OrderStub()])
      })
    })

    describe('when getting transit orders', () => {
      let response: Order[]

      beforeEach(async () => {
        response = await ordersController.getAllTransitOrders(context)
      })

      test('then it should call ordersService.getAllTransitOrders', () => {
        expect(ordersService.getAllTransitOrders).toBeCalled()
      })

      test('then is should return array of transit orders', () => {
        expect(response).toStrictEqual([OrderStub()])
      })
    })
    describe('when getting paid orders', () => {
      let response: Order[]

      beforeEach(async () => {
        response = await ordersController.getPaidOrders(context)
      })

      test('then it should call ordersService.getAllPaidOrder', () => {
        expect(ordersService.getAllPaidOrder).toBeCalled()
      })

      test('then is should return array of paid orders', () => {
        expect(response).toStrictEqual([OrderStub()])
      })
    })
    describe('when admin getting all orders', () => {
      let response: Order[]

      beforeEach(async () => {
        response = await ordersController.getOrders(context)
      })

      test('then it should call ordersService.getAllOrders', () => {
        expect(ordersService.getAllOrders).toBeCalled()
      })

      test('then is should return array of all orders', () => {
        expect(response).toStrictEqual([OrderStub()])
      })
    })
    describe('when getting ODSA pre-orders', () => {
      let response: Order[] | null

      beforeEach(async () => {
        response = await ordersController.getOdsaPreOrders(context)
      })

      test('then it should call ordersService.odsaGetPreOrders', () => {
        expect(ordersService.odsaGetPreOrders).toBeCalled()
      })

      test('then is should return array of pre orders', () => {
        expect(response).toStrictEqual([OrderStub()])
      })
    })
    describe('when getting Admin Aggregate orders', () => {
      let response: Order[] | null

      beforeEach(async () => {
        response = await ordersController.adminAggregates(context)
      })

      test('then it should call ordersService.adminMetrics', () => {
        expect(ordersService.adminMetrics).toBeCalled()
      })

      test('then is should return array of orders', () => {
        expect(response).toStrictEqual([OrderStub()])
      })
    })
    describe('when getting an order by order ID', () => {
      let response: Order | null
      let payload: ServicePayload<{ orderId: string }>
      beforeEach(async () => {
        payload = {
          userId: '',
          data: {
            orderId: OrderStub()._id as unknown as string
          }
        }
        response = await ordersController.getOrderById(payload, context)
      })

      test('then it should call ordersService.getOrderById', () => {
        expect(ordersService.getOrderById).toHaveBeenCalledWith(payload.data.orderId)
      })

      test('then is should return array of orders', () => {
        expect(response).toStrictEqual(OrderStub())
      })
    })

    describe('when getting an order by ref number', () => {
      let response: Order | null
      let payload: ServicePayload<{ ref: number }>
      beforeEach(async () => {
        payload = {
          userId: '',
          data: {
            ref: OrderStub().refId
          }
        }
        response = await ordersController.getOrderByRefNumber(payload, context)
      })

      test('then it should call ordersService.getOrderByRefId', () => {
        expect(ordersService.getOrderByRefId).toHaveBeenCalledWith(payload.data.ref)
      })

      test('then is should return array of orders', () => {
        expect(response).toStrictEqual(OrderStub())
      })
    })
  })

  describe('Update Operations', () => {
    describe('When updating order status', () => {
      let response: ResponseWithStatus
      let payload: ServicePayload<UpdateOrderStatusRequestDto>

      beforeEach(async () => {
        payload = {
          userId: '',
          data: {
            orderId: OrderStub()._id as unknown as string,
            status: OrderStatus.IN_ROUTE
          }
        }

        response = await ordersController.updateOrderStatus(payload, context)
      })

      test('then it should call ordersService.updateOrderStatus', () => {
        expect(ordersService.updateStatus).toHaveBeenCalledWith(payload.data)
      })

      test('then is should return success', () => {
        expect(response).toStrictEqual(ResStub())
      })
    })
    describe('When updating order status to paid', () => {
      let response: ResponseWithStatus
      let payload: ServicePayload<UpdateOrderStatusPaidRequestDto>

      beforeEach(async () => {
        payload = {
          userId: '',
          data: {
            orderId: OrderStub()._id as unknown as string,
            status: OrderStatus.PROCESSED,
            txRefId: OrderStub().txRefId
          }
        }

        response = await ordersController.updateOrderStatusWhenPaid(payload, context)
      })

      test('then it should call ordersService.updateStatusPaid', () => {
        expect(ordersService.updateStatusPaid).toHaveBeenCalledWith(payload.data)
      })

      test('then is should return success', () => {
        expect(response).toStrictEqual(ResStub())
      })
    })
    describe('When vendor accepting order', () => {
      let payload: { orderId: string, phone: string }

      beforeEach(async () => {
        payload = {
          orderId: OrderStub()._id as unknown as string,
          phone: OrderStub().primaryContact
        }
        await ordersController.vendorAcceptOrder(payload, context)
      })

      test('then it should call ordersService.vendorAcceptOrder', () => {
        expect(ordersService.vendorAcceptOrder).toHaveBeenCalledWith(payload.orderId, payload.phone)
      })
    })
  })
})
