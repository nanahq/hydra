import { MockModel } from '@app/common/database/test/support/mock.model'
import { User } from '@app/common'
import { UserProfileStub } from '../stubs/user.stub'

export class UserModel extends MockModel<User> {
  protected entityStub = UserProfileStub()
}
