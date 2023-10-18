import { OrdersServiceServiceI } from '@app/common'
import { OrderStub, ResStub } from '../test/stub/orders.stub'

export const mockValue: OrdersServiceServiceI = {
  adminMetrics: jest.fn().mockResolvedValue([OrderStub()]),
  getAllOrderInDb: jest.fn().mockResolvedValue([OrderStub()]),
  getAllFulfilledOrders: jest.fn().mockResolvedValue([OrderStub()]),
  getAllOrders: jest.fn().mockResolvedValue([OrderStub()]),
  getAllPaidOrder: jest.fn().mockResolvedValue([OrderStub()]),
  getAllTransitOrders: jest.fn().mockResolvedValue([OrderStub()]),
  getAllUserOrders: jest.fn().mockResolvedValue([OrderStub()]),
  getAllVendorOrders: jest.fn().mockResolvedValue([OrderStub()]),
  getOrderById: jest.fn().mockResolvedValue(OrderStub()),
  getOrderByRefId: jest.fn().mockResolvedValue(OrderStub()),
  odsaGetPreOrders: jest.fn().mockResolvedValue([OrderStub()]),
  placeOrder: jest.fn().mockResolvedValue(ResStub()),
  updateStatus: jest.fn().mockResolvedValue(ResStub()),
  updateStatusPaid: jest.fn().mockResolvedValue(ResStub()),
  vendorAcceptOrder: jest.fn().mockResolvedValue(ResStub())
}

export const OrdersServiceService = jest.fn().mockReturnValue(mockValue)
