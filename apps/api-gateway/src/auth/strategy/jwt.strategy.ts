import { QUEUE_MESSAGE } from "@app/common/typings/QUEUE_MESSAGE";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ClientProxy } from "@nestjs/microservices";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt } from "passport-jwt";
import { Strategy } from "passport-local";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        configService: ConfigService,
        private readonly usersClient: ClientProxy
    ){
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: any): string => {
                    return request?.Autentication
                }
            ]),
            secretOrKey: configService.get<string>('JWT_SECRET')
        })
    }

    async validate({userId}: {userId: string}): Promise<any> {
            const user =  this.usersClient.send(QUEUE_MESSAGE.GET_USER, {userId})
            return user
    }
}