import { OrderStatus } from '@app/common'

/*
 * Order message mapper
 * Maps an order status and returns a function which takes args and returns
 * appropriate order message.
 */

export const OrderStatusMessage: Record<
OrderStatus,
(...args: string[]) => string
> = {
  ORDER_PLACED: (listingName: string) => {
    return `Order Processed: Dear customer, your order (${listingName}) has been placed successfully. Thank you for using EatLater`
  },
  COLLECTED_FROM_VENDOR: () => {
    return ''
  },
  OUT_FOR_DELIVERY: (orderEta: string) => {
    return `Order update: Your food is on the way. Will be delivered today by ${orderEta}`
  },
  DELIVERED_TO_CUSTOMER: () => {
    return 'Order delivered: Hurray! Your food has been delivered. If you enjoy your meal, Do not forget to leave a review. Thanks for using EatLater '
  }
}
