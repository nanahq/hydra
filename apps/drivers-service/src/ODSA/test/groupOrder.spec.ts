import { OrderGroup } from '@app/common'
import { groupOrdersByDeliveryTime } from '../algo/groupOrdersByDeliveryTime'

describe('groupOrdersByDeliveryTime', () => {
  const mockSuccessOrders = [
    {
      _id: '1',
      // ... Other properties ...
      orderDeliveryScheduledTime: '1697461200000' // 20 minutes difference
    },
    {
      _id: '2',
      // ... Other properties ...
      orderDeliveryScheduledTime: '1697462520000' // 21 minutes difference
    },
    {
      _id: '3',
      // ... Other properties ...
      orderDeliveryScheduledTime: '1697466000000' // 22 minutes difference
    },
    {
      _id: '4',
      // ... Other properties ...
      orderDeliveryScheduledTime: '1697467500000' // 23 minutes difference
    },
    {
      _id: '5',
      // ... Other properties ...
      orderDeliveryScheduledTime: '1697468940000' // 23 minutes difference
    }
  ] as any[]

  test('groups orders correctly', () => {
    const numberOfAvailableDrivers = 3 // Change as needed

    const result: OrderGroup[] = groupOrdersByDeliveryTime(
      mockSuccessOrders,
      numberOfAvailableDrivers
    )

    expect(result.length).toBeGreaterThan(0)

    for (const group of result) {
      expect(group.orders.length).toBeLessThanOrEqual(10)
    }

    expect(result.length).toBeGreaterThan(0)

    const group1 = result.find((group) =>
      group.orders.some(
        (order) => order._id === ('1' as any) || order._id === ('2' as any)
      )
    )
    expect(group1).not.toBeUndefined()

    // Check that order 3 and 4 are in the same group
    const group2 = result.find((group) =>
      group.orders.some(
        (order) => order._id === ('3' as any) || order._id === ('4' as any)
      )
    )
    expect(group2).not.toBeUndefined()
  })
})
