import { CanActivate, ExecutionContext, Inject, UnauthorizedException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ContextType } from '@nestjs/common';
import {} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices';
import { catchError, Observable, tap } from 'rxjs';
import { QUEUE_MESSAGE } from '../typings/QUEUE_MESSAGE';

export const API_SERVICE = 'api_service'

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
       @Inject(API_SERVICE) private apiClient: ClientProxy
    ){}
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const authentication = this.getAuthentication(context)
        return this.apiClient.send(QUEUE_MESSAGE.VALIDATE_USER,  {
            Authentication: authentication
        }).pipe(
            tap((res) => {
                this.addUser(res, context)
            }),
            catchError(() => {
                throw new UnauthorizedException()
            })
        )
    }

    private getAuthentication (ctx: ExecutionContext): string {
        let authentication: string
        const {isHttpContext, isRpcContext} = getContextType(ctx)

        if(isRpcContext) {
            authentication = ctx.switchToRpc().getData().Authentication as string
        } else if (isHttpContext) {
            authentication = ctx.switchToHttp().getRequest().cookies?.Autentication
        }

        if(!authentication) {
            throw new UnauthorizedException('No value to check for authentication')
        }
        return authentication
    }

    private addUser (user: any, ctx: ExecutionContext): void {
        const {isHttpContext, isRpcContext} = getContextType(ctx)
        if(isRpcContext) { 
            ctx.switchToRpc().getData().user = user
        } else if (isHttpContext) {
            ctx.switchToHttp().getRequest().user = user
        }
    }
}


function getContextType (ctx: ExecutionContext):  {isHttpContext: boolean, isRpcContext: boolean} {
    return {
        isHttpContext: ctx.getType() === 'http',
        isRpcContext: ctx.getType() === 'rpc',
    }
}