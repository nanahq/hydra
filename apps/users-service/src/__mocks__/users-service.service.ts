import { UserProfileStub, resStub } from '../test/stubs/user.stub'

export const UsersService = jest.fn().mockReturnValue({
  register: jest.fn().mockResolvedValue(resStub()),
  updateUserProfile: jest.fn().mockResolvedValue(resStub()),
  getUser: jest.fn().mockResolvedValue(UserProfileStub()),
  validateUser: jest.fn().mockResolvedValue({ status: 1, data: UserProfileStub() }),
  updateUserStatus: jest.fn().mockResolvedValue(resStub()),
  getUserWithPhone: jest.fn().mockResolvedValue(UserProfileStub()),
  deleteUserProfile: jest.fn().mockResolvedValue(resStub())
})
