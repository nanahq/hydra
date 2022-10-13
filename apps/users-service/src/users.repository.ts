import { Repository, EntityRepository } from 'typeorm';

import { UserDto, UserEntity } from '@app/common';

@EntityRepository()
export class UsersRepository extends Repository<UserEntity> {
  public async createUser(user: UserDto): Promise<string> {
    const query = await this.createQueryBuilder('user')
      .insert()
      .into(UserEntity)
      .values({ ...user })
      .returning('id')
      .execute();
    return query as unknown as string;
  }
}
