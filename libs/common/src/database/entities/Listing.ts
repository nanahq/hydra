import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ListingOptionEntity } from '@app/common/database/entities/ListingOption';
import { AvailableDate } from '@app/common/typings/AvailableDatesEnum.enum';

@Entity({ name: 'listings' })
export class ListingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  listingName: string;

  @Column({ type: 'int' })
  listingPrice: number;

  @Column({ type: 'text' })
  vendorId: string;

  @Column({ type: 'text' })
  listingDesc: string;

  @Column({
    type: 'enum',
    enum: AvailableDate,
  })
  listingAvailableDate: AvailableDate;

  @OneToMany(
    () => ListingOptionEntity,
    (ListingOptionEntity) => ListingOptionEntity.listing,
    {
      eager: true,
      nullable: true,
      cascade: ['insert', 'update'],
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  customisableOptions: ListingOptionEntity[];

  @Column({
    type: 'boolean',
    default: false,
  })
  isOnDemand: boolean;

  @Column({
    type: 'simple-array',
    nullable: true,
  })
  listingPhoto: string[];

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;

  @CreateDateColumn()
  public createdAt: Date;
}
