type FunctionKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T]

export function unitAssertion<T, K extends FunctionKeys<T>, L, M, N> (
  service: T,
  methodName: K,
  payload: M,
  response: L,
  match: N
): void {
  test(`then it should call ${methodName.toString()}`, () => {
    expect(service[methodName]).toBeCalledWith(payload)
  })

  test('then it should return a charge request', () => {
    expect(response).toStrictEqual(match)
  })
}
