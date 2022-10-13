import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AvailableDate } from '@app/common/typings/AvailableDatesEnum.enum'
import { CustomOptions } from '@app/common/typings/Custom.Interface'

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

  @Column({ type: 'simple-array', nullable: true })
    customisableOptions: CustomOptions[]

  @Column({ type: 'boolean', default: false })
    isOnDemand: boolean

  @Column({ type: 'simple-array', nullable: true })
    listingPhoto: string[]
}
