import { RmqModule } from "@app/common";
import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";

@Module({
    imports: [
        RmqModule.register({
            name: 'USERS'
        })
    ],
    controllers: [UsersController],
    providers: []
})
export class UsersModule {}