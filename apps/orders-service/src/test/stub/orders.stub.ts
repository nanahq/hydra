import { Order, OrderStatus, OrderTypes, ResponseWithStatus } from '@app/common'
import { Types } from 'mongoose'

export function OrderStub (): Order {
  const objectId = '63f93c9f248f6c43d0b76502' as unknown as Types.ObjectId
  return {
    _id: objectId,
    user: 'user_id_123',
    listing: 'listing_id_456',
    vendor: 'vendor_id_789',
    totalOrderValue: 100.0,
    orderValuePayable: 95.0,
    deliveryAddress: '123 Main St, City, Country',
    primaryContact: 'user@example.com',
    isThirdParty: false,
    createdAt: '2023-01-15T10:00:00.000Z' as any,
    updatedAt: '2023-01-15T10:00:00.000Z' as any,
    refId: 12345,
    options: ['Option1', 'Option2'],
    orderType: OrderTypes.PRE,
    preciseLocation: {
      type: 'Point',
      coordinates: [12.34, 56.78]
    },
    quantity: '2',
    specialNote: 'Special instructions for the order',
    orderStatus: OrderStatus.PROCESSED,
    orderDeliveryScheduledTime: '2023-01-16T15:00:00.000Z',
    orderBreakDown: {
      orderCost: 80.0,
      systemFee: 5.0,
      deliveryFee: 10.0,
      vat: 12.0
    },
    txRefId: 'transaction_reference_123'
  }
}

export function ResStub (): ResponseWithStatus {
  return { status: 1 }
}
