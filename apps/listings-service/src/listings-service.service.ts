import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, InsertResult, Repository, UpdateResult } from 'typeorm';
import { ListingEntity } from '@app/common/database/entities/Listing';
import { FitRpcException } from '@app/common/filters/rpc.expection';
import { ListingDto } from '@app/common/database/dto/listing.dto';
import { ResponseWithStatus, ServicePayload } from '@app/common';

@Injectable()
export class ListingsServiceService {
  constructor(
    @InjectRepository(ListingEntity)
    private readonly listingRepository: Repository<ListingEntity>,
  ) {}

  async getAllListings(vendorId: string): Promise<ListingEntity[]> {
    const getRequest = await this.getListings(vendorId);

    if (getRequest === null) {
      throw new FitRpcException(
        'Something went wrong fetching all listings.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return getRequest;
  }

  async create(data: ServicePayload<ListingDto>): Promise<ResponseWithStatus> {
    const createRequest = await this.createListing(data);
    if (createRequest === null) {
      throw new FitRpcException(
        'Failed to create a new listing. Incorrect input',
        HttpStatus.BAD_REQUEST,
      );
    }

    return { status: 1 };
  }

  async update(
    data: ServicePayload<Partial<ListingEntity>>,
  ): Promise<ResponseWithStatus> {
    const req = await this.updateListing(data);

    if (req === null) {
      throw new FitRpcException(
        'Failed to update listing. Incorrect input',
        HttpStatus.BAD_REQUEST,
      );
    }

    return { status: 1 };
  }

  async getListing(condition: {
    listingId: string;
    vendorId: string;
  }): Promise<ListingEntity> {
    const _listing = await this.getListingById(condition);

    if (_listing === null) {
      throw new FitRpcException(
        'Listing with id is not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return _listing;
  }

  async deleteListing(
    payload: ServicePayload<{ listingId: string }>,
  ): Promise<ResponseWithStatus> {
    const deleteRequest = await this.deleteListingById(payload);

    if (deleteRequest === null) {
      throw new FitRpcException(
        'Failed to delete listing. Invalid ID',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    return { status: 1 };
  }

  private async getListingById(listing: {
    listingId: string;
    vendorId: string;
  }): Promise<ListingEntity | null> {
    return await this.listingRepository
      .createQueryBuilder('listings')
      .where('listings.id = :id', { id: listing.listingId })
      .andWhere('listings.vendorId = :vid', { vid: listing.vendorId })
      .getOne();
  }

  private async getListings(vendorId: string): Promise<ListingEntity[] | null> {
    return await this.listingRepository
      .createQueryBuilder('listings')
      .where('listings.vendorId = :id', { id: vendorId })
      .getMany();
  }

  private async deleteListingById(
    payload: ServicePayload<{ listingId: string }>,
  ): Promise<DeleteResult | null> {
    return await this.listingRepository
      .createQueryBuilder('listings')
      .delete()
      .where('id = :id', { id: payload.data.listingId })
      .andWhere('vendorId = :vid', { vid: payload.userId })
      .execute();
  }

  private async createListing(
    payload: ServicePayload<ListingDto>,
  ): Promise<InsertResult | null> {
    return await this.listingRepository
      .createQueryBuilder('listings')
      .insert()
      .into(ListingEntity)
      .values({
        ...payload.data,
        vendorId: payload.userId,
      })
      .returning('id')
      .execute();
  }

  private async updateListing(
    payload: ServicePayload<Partial<ListingEntity>>,
  ): Promise<UpdateResult | null> {
    const listingId = payload.data.id;
    delete payload.data.id; // remove ID to avoid changing it
    delete payload.data.vendorId; // remove vendor ID to avoid changing vendor

    return await this.listingRepository
      .createQueryBuilder('listings')
      .update(ListingEntity)
      .set({ ...payload.data })
      .where('id = :id', { id: listingId })
      .andWhere('vendorId = :vid', { vid: payload.userId })
      .returning('id')
      .execute();
  }
}
