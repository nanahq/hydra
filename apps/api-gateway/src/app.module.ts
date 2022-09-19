import { RmqModule } from "@app/common";
import { QUEUE_SERVICE } from "@app/common/typings/QUEUE_MESSAGE";
import { DynamicModule, ValidationPipe } from "@nestjs/common";
import { INestApplication, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppMetadata } from "app.config";
import { AuthModule } from "./module.api/auth/auth.module";
import { UsersModule } from "./module.api/users/user.module";

@Module({})
export class AppModule {
    static async create (): Promise<INestApplication> {
        const app = await NestFactory.create(this.forRoot())
        this.configure(app)
        return app
    }


    static forRoot (): DynamicModule {
        return {
            module: AppModule,
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true
                }),
                RmqModule.register({name: QUEUE_SERVICE.USERS_SERVICE}),
                AppModule,
                UsersModule,
                AuthModule
            ]
        }
    }


        /**
         *  Set Apps configurations
         * @param app INestApplication
         * @returns  void
         */
    static configure (app: INestApplication): void {
        const version = this.getVersion(app)
        app.useGlobalPipes(new ValidationPipe())
        app.setGlobalPrefix(`api/${version}`)
    }

    /* 
    Get the version info from App meta data  file or enviromental variable
    @returns string 
    */

    // TODO(@siradji) improve versioning 

    static getVersion (app: INestApplication): string {
        const {API_VERSION} = AppMetadata
        return API_VERSION 
    }
}