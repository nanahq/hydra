import { Body, Controller, Get } from "@nestjs/common";

@Controller('/auth')
export class AuthController {

    @Get('/login')
    async login ( ) {
        return 'Hello world'
    }
}