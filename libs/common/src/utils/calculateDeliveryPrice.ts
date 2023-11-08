import { DeliveryPriceMeta } from '@app/common'

export function calculateDeliveryPrice (
  distanceKm: number,
  deliveryPriceMeta: DeliveryPriceMeta
): number {
  const {
    MAX_DELIVERY_FEE_PAYABLE,
    BASE_FEE,
    SHORT_DISTANCE_RATE,
    MEDIUM_DISTANCE_RATE,
    LONG_DISTANCE_RATE,
    GAS_PRICE
  } = deliveryPriceMeta

  let ratePerKm
  if (distanceKm <= 3) {
    ratePerKm = SHORT_DISTANCE_RATE
  } else if (distanceKm <= 5) {
    ratePerKm = MEDIUM_DISTANCE_RATE
  } else {
    ratePerKm = LONG_DISTANCE_RATE
  }

  const gasConsumedLiters = distanceKm / 50
  const gasCost = GAS_PRICE * gasConsumedLiters

  const deliveryPrice = BASE_FEE + ratePerKm * distanceKm + gasCost

  const roundedPrice = Math.ceil(deliveryPrice / 10) * 10

  return Math.min(roundedPrice, MAX_DELIVERY_FEE_PAYABLE)
}
