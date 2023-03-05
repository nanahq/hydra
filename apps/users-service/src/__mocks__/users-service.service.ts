import { UserProfileStub, resStub } from '../test/stubs/user.stub'

export const ListingsService = jest.fn().mockReturnValue({
  register: jest.fn().mockResolvedValue(resStub()),
  updateUserProfile: jest.fn().mockResolvedValue(resStub()),
  getUser: jest.fn().mockResolvedValue(UserProfileStub()),
  validateUser: jest.fn().mockResolvedValue(UserProfileStub()),
  updateUserStatus: jest.fn().mockResolvedValue(resStub()),
  getUserWithPhone: jest.fn().mockResolvedValue(UserProfileStub()),
  deleteUserProfile: jest.fn().mockResolvedValue(resStub())
})
