export interface RideHistory {
  driverId: string
  pickupLocation: {
    type: string
    coordinates: [number]
  }
  dropoffLocation: {
    type: string
    coordinates: [number]
  }
  distance: number
  duration: number
  fare: number
  status: RideStatus
  driverRating: number
  createdAt: string
  updatedAt: string
}

export type RideStatus = 'cancelled' | 'on-trip' | 'completed'

export interface vehicle {
  name: string
  model: string
  plateNumber: string
  color: string
}
