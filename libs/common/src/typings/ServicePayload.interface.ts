export interface ServicePayload<T> {
  userId: string
  data: T
}

export interface MultiPurposeServicePayload<T> {
  id: string
  data: T
}
