import { DeliveryPriceMeta } from '@app/common'

export function calculateDeliveryPrice (
  distanceKm: number,
  deliveryPriceMeta: DeliveryPriceMeta
): number {
  const {
    MIN_DELIVERY_PRICE,
    MEDIUM_DISTANCE_RATE,
    LONG_DISTANCE_RATE
  } = deliveryPriceMeta

  let fee = MIN_DELIVERY_PRICE

  if (distanceKm <= 1) {
    return roundUp(MIN_DELIVERY_PRICE)
  }

  if (distanceKm <= 5.5) {
    fee = (distanceKm - 1) * MEDIUM_DISTANCE_RATE + MIN_DELIVERY_PRICE
  } else {
    fee = (distanceKm - 1) * LONG_DISTANCE_RATE + MIN_DELIVERY_PRICE
  }

  return roundUp(fee)
}

function roundUp (value: number): number {
  if (value <= 49) {
    return 50
  } else if (value <= 99) {
    return 100
  }

  const remainder = value % 100
  return remainder <= 50 ? value - remainder + 50 : value - remainder + 100
}
