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
  ORDER_PLACED: () => {
    return 'Order Processed: Dear customer, your order has been placed successfully. You can use the mobile app to track your order live. Thank you for using Nana'
  },
  COLLECTED_FROM_VENDOR: () => {
    return ''
  },
  OUT_FOR_DELIVERY: () => {
    return 'Order update: Your will be delivered in one minute. You need your phone with you to be able to collect your order. Thank you'
  },
  DELIVERED_TO_CUSTOMER: () => {
    return 'Order delivered: Hurray! Your food has been delivered. If you enjoy your meal, Do not forget to leave a review. Thanks for using EatLater '
  },
  ORDER_ACCEPTED: () => {
    return 'Great news! Your order has been accepted by the vendor! Track your order live on the EatLater app for a seamless experience. Thank you for choosing EatLater! 🚀'
  },
  PAYMENT_PENDING: () => {
    return 'Great news! Your order has been accepted by the vendor! Track your order live on the EatLater app for a seamless experience. Thank you for choosing EatLater! 🚀'
  }
}
