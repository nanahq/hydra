export enum OrderStatus {
  PROCESSED = 'ORDER_PLACED', // default order status
  ACCEPTED = 'ORDER_ACCEPTED', // default
  COLLECTED = 'COLLECTED_FROM_VENDOR', // Only vendors can updated/use this
  IN_ROUTE = 'OUT_FOR_DELIVERY', // Only admin/rider can update/use this
  FULFILLED = 'DELIVERED_TO_CUSTOMER',
}
