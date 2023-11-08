export interface ResponseWithStatus {
  status: 0 | 1
}

export interface ResponseWithStatusAndData<T> {
  status: 0 | 1
  data: T
}
