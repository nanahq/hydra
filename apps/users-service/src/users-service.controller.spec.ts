import { Test, TestingModule } from '@nestjs/testing';
import { UsersServiceController } from './users-service.controller';
import { UsersServiceService } from './users-service.service';

describe('UsersServiceController', () => {
  let usersServiceController: UsersServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UsersServiceController],
      providers: [UsersServiceService],
    }).compile();

    usersServiceController = app.get<UsersServiceController>(UsersServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(usersServiceController.getHello()).toBe('Hello World!');
    });
  });
});
