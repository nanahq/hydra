// mock-client-proxy.ts

import { of, Observable } from 'rxjs'

// eslint-disable-next-line func-style
export const createClientProxyMock = (): any => {
  const clientProxy = {
    connect: jest.fn(),
    close: jest.fn(),
    emit: jest.fn((pattern: string, data: any): Observable<string> => {
      // Customize behavior here based on the pattern and data
      if (pattern === 'your_pattern' && data === 'some_data') {
        return of('mock_response')
      }
      return of('default_mock_response')
    }) as any,
    // Mock other methods like send, publish, rpc as needed
    send: jest.fn(),
    publish: jest.fn()
  }

  // Set up custom behavior using jest.fn()

  return clientProxy
}
