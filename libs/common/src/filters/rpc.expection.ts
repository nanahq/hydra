import {
  Catch,
  RpcExceptionFilter,
  ArgumentsHost,
  HttpStatus,
  ExceptionFilter,
  HttpException
} from '@nestjs/common'
import { Observable, throwError } from 'rxjs'
import { RpcException } from '@nestjs/microservices'
import { HttpAdapterHost } from '@nestjs/core'

export interface IRpcException {
  message: string
  status: number
}

export class FitRpcException extends RpcException implements IRpcException {
  constructor (message: string, statusCode: HttpStatus) {
    super(message)
    this.initStatusCode(statusCode)
  }

  public status: number

  private initStatusCode (statusCode): void {
    this.status = statusCode
  }
}

/**
 *  A custom exception filter to catch and throw  RPC execptions from TCP servers to client
 */
@Catch(RpcException)
export class ExceptionFilterRpc implements RpcExceptionFilter<RpcException> {
  catch (exception: RpcException, _host: ArgumentsHost): Observable<any> {
    return throwError(() => exception.getError())
  }
}

/**
 *  A Custom HttpException for gateway-service to parse exceptions and throw structured errors
 */
@Catch(HttpException)
export class FitHttpException implements ExceptionFilter {
  constructor (private readonly httpAdapterHost: HttpAdapterHost) {}

  catch (exception: IRpcException, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost
    const ctx = host.switchToHttp()

    const httpStatus =
      exception.status !== undefined && typeof exception.status === 'number'
        ? exception.status
        : HttpStatus.INTERNAL_SERVER_ERROR

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message: exception.message
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus)
  }
}
