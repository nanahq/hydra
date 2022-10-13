import { Repository } from 'typeorm';
import { VendorDto, VendorEntity, updateVendorStatus } from '@app/common';

export class VendorsRepository extends Repository<VendorEntity> {
  public async createVendor(vendor: VendorDto): Promise<string> {
    const query = await this.createQueryBuilder('vendor')
      .insert()
      .into(VendorEntity)
      .values({ ...vendor })
      .returning('id')
      .execute();
    return query as unknown as string;
  }

  public async getVendorByPhone(phone: string): Promise<VendorEntity | null> {
    return await this.createQueryBuilder('vendor')
      .where('vendor.businessPhoneNumber = :phone', { phone })
      .getOne();
  }

  public async getVendorById(id: string): Promise<VendorEntity | null> {
    return await this.createQueryBuilder('vendor')
      .where('vendor.id = :id', { id })
      .getOne();
  }

  public async updateVendorApprovalStatus(
    payload: updateVendorStatus,
  ): Promise<string | null> {
    const query = await this.createQueryBuilder('vendor')
      .update(VendorEntity)
      .set({
        approvalStatus: () => payload.status,
      })
      .where('vendor.id = :id', { id: payload.id })
      .returning('id')
      .execute();

    return query as any;
  }
}
