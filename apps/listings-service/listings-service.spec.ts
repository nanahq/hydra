import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ListingsService } from './src/listings-service.service';
import { baseCreateQueryBuilder } from '../__test__/testing/MockQueryBuilder';
import {
  ListingEntity,
  ListingOptionEntity,
  AvailableDate,
  CustomisationOptionTypeEnum,
  FitRpcException,
  ResponseWithStatus,
} from '@app/common';

describe('Litings Service Unit Test', () => {
  const listingstoken = getRepositoryToken(ListingEntity);
  const optionToken = getRepositoryToken(ListingOptionEntity);
  const vendorToken = getRepositoryToken(ListingOptionEntity);
  let repo: Repository<ListingEntity>;
  let optionRepo: Repository<ListingOptionEntity>;
  let listingService: ListingsService;

  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        ListingsService,
        {
          provide: listingstoken,
          useValue: {
            save: jest.fn().mockReturnThis(),
            preload: jest.fn().mockReturnThis(),
            createQueryBuilder: jest.fn(() => ({
              delete: jest.fn().mockReturnThis(),
              returning: jest.fn().mockReturnThis(),
              insert: jest.fn().mockReturnThis(),
              into: jest.fn().mockReturnThis(),
              values: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              execute: jest.fn().mockReturnThis(),
              update: jest.fn().mockReturnThis(),
              set: jest.fn().mockReturnThis(),
              getOne: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockReturnThis(),
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
            })),
          },
        },
        {
          provide: optionToken,
          useValue: {},
        },
      ],
    }).compile();

    listingService = moduleRef.get<ListingsService>(ListingsService);
    repo = moduleRef.get<Repository<ListingEntity>>(listingstoken);
    optionRepo = moduleRef.get<Repository<ListingOptionEntity>>(optionToken);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  const vendor = {
    id: 'da693f8944992',
    firstName: 'Ivy',
    lastName: 'Doe',
    state: 'kano',
    businessPhoneNumber: '+2348107641833',
    businessName: 'Ivy delights',
    address: '34 gwarzo road',
    email: 'hello@ivy.com',
    password: 'pass@ivy',
  };

  const listing = {
    vendorId: 'da693f8944992',
    id: 'da693f894499',
    listingName: 'Ivy Cake',
    listingPrice: 1075,
    listingDesc: 'Yummy and sugar free',
    listingPhoto: ['https:listings.com/photos/:1'],
    listingAvailableDate: AvailableDate.THURSDAY,
    customisableOptions: [
      {
        optionName: 'Ivy Buns',
        optionCost: '300',
        optionType: CustomisationOptionTypeEnum.ADD_ON,
      },
    ],
  };

  const payload = {
    data: listing,
    userId: vendor.id,
  };

  describe('Testing init', () => {
    it('Service and Repository be defined', async () => {
      expect(listingService).toBeDefined();
      expect(repo).toBeDefined();
    });
  });

  describe('Create Listing', () => {
    it('should create a listing without errors', async () => {
      baseCreateQueryBuilder.getOne = () => null as any;
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder);
      const assertion = await listingService.create(payload);
      expect(assertion).toStrictEqual({
        status: 1,
      });
    });
  });

  describe('List listings', () => {
    it('sholud list out all listings', async () => {
      const listings = new Array();
      baseCreateQueryBuilder.getMany = () => listings.includes(listing);
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder);
      const assertion = await listingService.getAllDbListing();
      expect(assertion).toBeDefined();
    });

    it('should get a single listing using its ID', async () => {
      baseCreateQueryBuilder.getOne = () => listing;
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder);
      const assertion = await listingService.getListing({
        listingId: 'da693f894499',
      });
      expect(assertion.vendorId).toStrictEqual('da693f8944992');
    });

    it('throw execption when wrong Id is provided', async () => {
      expect.assertions(3);
      baseCreateQueryBuilder.getOne = () => null;
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder);
      try {
        await listingService.getListing({ listingId: 'FAKE_LISTINGS_ID' });
      } catch (error) {
        expect(error).toBeInstanceOf(FitRpcException);
        expect(error.message).toStrictEqual('Listing with id is not found');
        expect(error.status).toStrictEqual(404);
      }
    });
  });

  describe('Update listing', () => {
    it('should update entry on a listing', async () => {
      baseCreateQueryBuilder.getOne = () => listing;
      const assertion = await listingService.update({
        data: { listingPrice: 1001 },
        userId: 'da693f8944992',
      });
      expect(assertion).toStrictEqual({ status: 1 });
    });

    it('should throw an execption with a wrong user ID', async () => {
      // expect.assertions(3);
      baseCreateQueryBuilder.getOne = () => null;
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder);
      try {
        await listingService.update({
          data: { listingName: 'Test' },
          userId: 'FAKE_ID',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(FitRpcException);
        expect(error.message).toStrictEqual(
          'Failed to update listing. Incorrect input',
        );
        expect(error.status).toStrictEqual(400);
      }
    });
  });
  describe('Delete Listing', () => {
    it('should delete a listing', async () => {
      baseCreateQueryBuilder.execute = () => listing;
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder);
      const assertion = await listingService.deleteListing({
        data: { listingId: 'da693f894499' },
        userId: 'da693f8944992',
      });

      expect(assertion).toStrictEqual({ status: 1 });
    });

    it('should fail when ID is wrong', async () => {
      baseCreateQueryBuilder.execute = () => null;
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementationOnce(() => baseCreateQueryBuilder);
      try {
        await listingService.deleteListing({
          data: { listingId: 'da693f894499' },
          userId: 'da693f8944992',
        });
      } catch (error) {
        console.log(error);
        expect(error).toBeInstanceOf(FitRpcException);
        expect(error.message).toStrictEqual(
          'Failed to delete listing. Invalid ID',
        );
        expect(error.status).toStrictEqual(422);
      }
    });
  });
});
