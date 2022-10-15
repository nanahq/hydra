import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { AvailableDate } from '@app/common/typings/AvailableDatesEnum.enum'
import { ListingOptionEntity } from '@app/common/database/entities/ListingOption'

@Entity({ name: 'listings' })
export class ListingEntity {
  @PrimaryGeneratedColumn('uuid')
    id: string

  @Column({ type: 'text' })
    listingName: string

  @Column({ type: 'int' })
    listingPrice: number

  @Column({ type: 'text' })
    vendorId: string

  @Column({ type: 'text' })
    listingDesc: string

  @Column({ type: 'enum', enum: AvailableDate })
    listingAvailableDate: AvailableDate

  @OneToMany(
    () => ListingOptionEntity,
    (ListingOptionEntity) => ListingOptionEntity.listing,
    {
      eager: true,
      nullable: true,
      cascade: ['insert', 'update'],
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    }
  )
    customisableOptions: ListingOptionEntity[]

  @Column({ type: 'boolean', default: false })
    isOnDemand: boolean

  @Column({ type: 'simple-array', nullable: true })
    listingPhoto: string[]
}
