import { Test, TestingModule } from '@nestjs/testing';
import { AdminServiceController } from './admin-service.controller';
import { AdminServiceService } from './admin-service.service';

describe('AdminServiceController', () => {
  let adminServiceController: AdminServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AdminServiceController],
      providers: [AdminServiceService],
    }).compile();

    adminServiceController = app.get<AdminServiceController>(
      AdminServiceController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(adminServiceController.getHello()).toBe('Hello World!');
    });
  });
});
