import { resStub } from '../test/stubs/res.stub'
import { VendorStub } from '../test/stubs/vendor.stub'
import { VendorSettingStub } from '../test/stubs/VendorSettings.stub'

export const VendorsService = jest.fn().mockReturnValue({
  register: jest.fn().mockResolvedValue(resStub()),
  validateVendor: jest.fn().mockResolvedValue(VendorStub()),
  updateVendorStatus: jest.fn().mockResolvedValue(resStub()),
  getVendor: jest.fn().mockResolvedValue(VendorStub()),
  updateVendorProfile: jest.fn().mockResolvedValue(resStub()),
  deleteVendorProfile: jest.fn().mockResolvedValue(resStub()),
  getAllVendors: jest.fn().mockResolvedValue([VendorStub()]),
  getVendorSettings: jest.fn().mockResolvedValue(VendorSettingStub()),
  getAllVendorsUser: jest.fn().mockResolvedValue([VendorStub()]),
  updateSettings: jest.fn().mockResolvedValue(resStub()),
  createVendorSettings: jest.fn().mockResolvedValue(resStub())
})
