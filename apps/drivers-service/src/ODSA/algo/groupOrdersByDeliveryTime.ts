import { OrderGroup, OrderI } from '@app/common'
import * as moment from 'moment'

/**
 *  Groups order by delivery time
 *  constraint: Groups order that [delivery time difference is less 45 minutes adn greater than 20 minutes]
 * @param orders
 * @param numberOfAvailableDrivers
 */
export function groupOrdersByDeliveryTime (
  orders: OrderI[],
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
        maxDeliveryTime: order.orderDeliveryScheduledTime
      }
      currentDriverCount++
    } else {
      const lastOrder = currentGroup.orders[currentGroup.orders.length - 1]
      const timeDiffMinutes = moment
        .duration(
          moment(order.orderDeliveryScheduledTime).diff(
            moment(lastOrder.orderDeliveryScheduledTime)
          )
        )
        .asMinutes()

      if (
        timeDiffMinutes < 45 &&
        timeDiffMinutes > 20 &&
        currentGroup.orders.length < 10 &&
        currentDriverCount < numberOfAvailableDrivers
      ) {
        const groupMaxDelivery = moment(currentGroup.maxDeliveryTime)
        const scheduleTime = moment(order.orderDeliveryScheduledTime)
        currentGroup.orders.push(order)
        currentGroup.maxDeliveryTime = moment
          .max(groupMaxDelivery, scheduleTime)
          .toISOString()

        currentDriverCount++
      } else {
        groupedOrders.push(currentGroup)
        currentGroupId++
        currentGroup = {
          groupId: currentGroupId,
          orders: [order],
          maxDeliveryTime: order.orderDeliveryScheduledTime
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
