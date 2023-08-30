import { Order, OrderGroup } from '@app/common'
import * as moment from 'moment'

export function groupOrdersByDeliveryTime (
  orders: Order[],
  numberOfAvailableDrivers: number
): OrderGroup[] {
  const groupedOrders: OrderGroup[] = []
  let currentGroupId = 1
  let currentGroup: OrderGroup | null = null
  let currentDriverCount = 0

  for (const order of orders) {
    if (currentGroup == null) {
      currentGroup = {
        groupId: currentGroupId,
        orders: [order],
        maxDeliveryTime: parseInt(order.orderDeliveryScheduledTime)
      }
      currentDriverCount++
    } else {
      const lastOrder = currentGroup.orders[currentGroup.orders.length - 1]
      const timeDiffMinutes = moment
        .duration(
          moment(parseInt(order.orderDeliveryScheduledTime)).diff(
            moment(parseInt(lastOrder.orderDeliveryScheduledTime))
          )
        )
        .asMinutes()

      if (
        timeDiffMinutes < 45 &&
        timeDiffMinutes > 20 &&
        currentGroup.orders.length < 10 &&
        currentDriverCount < numberOfAvailableDrivers
      ) {
        currentGroup.orders.push(order)
        currentGroup.maxDeliveryTime = Math.max(
          currentGroup.maxDeliveryTime,
          parseInt(order.orderDeliveryScheduledTime)
        )
        currentDriverCount++
      } else {
        groupedOrders.push(currentGroup)
        currentGroupId++
        currentGroup = {
          groupId: currentGroupId,
          orders: [order],
          maxDeliveryTime: parseInt(order.orderDeliveryScheduledTime)
        }
        currentDriverCount = 1
      }
    }
  }

  if (currentGroup != null) {
    groupedOrders.push(currentGroup)
  }

  return groupedOrders
}
