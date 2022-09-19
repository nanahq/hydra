import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { registerUserRequest } from '@app/common/dto/registerUser.dto';
import { UsersRepository } from './users.repository';
import { loginUserRequest } from '@app/common/dto/loginUser.dto';
import bcrypt from 'bcrypt'
@Injectable()
export class UsersServiceService {
  constructor(
    private readonly usersRepository: UsersRepository
  ){}

  async register (request: registerUserRequest) {
    const session = await this.usersRepository.startTransaction()
    const payload = {
      ...request, 
      name: '', 
       savedDeliveryAddress:  [], 
        state: '',
         status: 0
    }
    try {

          // Validation gate to check if provided phone number is in db
        await this.checkExistingUser(request.phoneNumber)
          payload.password = await bcrypt.hash(request.password, 10)
        const user = await this.usersRepository.create(payload as  any)
        session.commitTransaction()
        return user
    } catch (error) {
      throw new UnprocessableEntityException(error)
    }
  }

  // async validateUser ({phoneNumber, password}: loginUserRequest) {

  // }

  private async checkExistingUser(phoneNumber: string): Promise<void> {
    const user = await this.usersRepository.findOne({phoneNumber})
    if(user !== undefined) {
      throw new UnprocessableEntityException('Phone Number is  already registered.');
    }
  }
}
