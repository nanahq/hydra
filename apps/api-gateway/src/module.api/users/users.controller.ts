import { registerUserRequest } from "@app/common/dto/registerUser.dto";
import { QUEUE_MESSAGE, QUEUE_SERVICE } from "@app/common/typings/QUEUE_MESSAGE";
import { Body, Controller, Inject, Post } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { lastValueFrom } from "rxjs";

@Controller('/users')
export class UsersController {
constructor(
    @Inject(QUEUE_SERVICE.USERS_SERVICE) private usersClient: ClientProxy 
){}

@Post('/register')
async registerNewUser(@Body() request:  registerUserRequest) {
    try {
     const newUser =    await lastValueFrom(
            this.usersClient.send(QUEUE_MESSAGE.CREATE_USER, {...request})
          )
          return newUser
    } catch (error) {
        console.log(error);
        
        // throw new 
    }
  return 1
}
}