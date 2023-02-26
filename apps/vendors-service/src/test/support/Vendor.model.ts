import { Vendor, VendorSettings } from "@app/common";
import { MockModel } from "@app/common/database/test/support/mock.model";
import { VendorStub } from "../stubs/vendor.stub";
import { VendorSettingStub } from '../stubs/VendorSettings.stub'

export class VendorModel extends MockModel<Vendor> {
   protected entityStub = VendorStub() as Vendor
}

export class VendorSettingsModel extends MockModel<VendorSettings> {
   protected entityStub = VendorSettingStub() as VendorSettings
}