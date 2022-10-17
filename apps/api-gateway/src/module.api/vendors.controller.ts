import { ClientProxy } from '@nestjs/microservices'
import { Controller, Get, HttpException, Inject, Param, UseGuards } from '@nestjs/common'
import { IRpcException, QUEUE_MESSAGE, QUEUE_SERVICE, ServicePayload, VendorEntity } from '@app/common'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { catchError, lastValueFrom } from 'rxjs'

@Controller('vendors')
export class VendorsController  {
    constructor (
       @Inject(QUEUE_SERVICE.VENDORS_SERVICE) private readonly vendorsClient: ClientProxy
    ) {
    }

    @Get('get-all')
    @UseGuards(JwtAuthGuard)
    async getVendors (): Promise<VendorEntity[]> {
        return await lastValueFrom<VendorEntity[]>(
            this.vendorsClient.send(QUEUE_MESSAGE.GET_ALL_VENDORS_USERS, {})
                .pipe(
                    catchError((error: IRpcException) => {
                        throw new HttpException(error.message, error.status)
                    })
                )
        )
    }

    @Get('get-one/:vendorId')
    @UseGuards(JwtAuthGuard)
    async getVendor (
        @Param('vendorId') vendorId: string
    ): Promise<Partial<VendorEntity>> {
        const payload: ServicePayload<string> = {
            userId: '',
            data: vendorId
        }
        const vendor = await lastValueFrom<VendorEntity>(
            this.vendorsClient.send(QUEUE_MESSAGE.GET_VENDOR, payload)
                .pipe(
                    catchError((error: IRpcException) => {
                        throw new HttpException(error.message, error.status)
                    })
                )
        )

        const {id, state, businessName} = vendor

        return {
            id,
            state,
            businessName
        }
    }
}
