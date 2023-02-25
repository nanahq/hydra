import { VendorSettings } from '@app/common'
import { Types } from "mongoose";

export const VendorSettingStub = (): Partial<VendorSettings> | VendorSettings => {
    return {
        "vendorId": "63f7f2d0a0f1d5158f43cb7b" ,
        operations: undefined,
        payment: undefined
    }
}