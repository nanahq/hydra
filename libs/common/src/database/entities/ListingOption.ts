import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { ListingEntity } from '@app/common/database/entities/Listing'
import { CustomisationOptionTypeEnum } from '@app/common/typings/CustomisationOptionType.enum'

@Entity({ name: 'listingOptions' })
export class ListingOptionEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string

  @Column({ type: 'text' })
  public optionName: string

  @Column({ type: 'text' })
  public optionCost: string

  @Column({ type: 'enum', enum: CustomisationOptionTypeEnum })
  public optionType: CustomisationOptionTypeEnum

  @ManyToOne(
    () => ListingEntity,
    (ListingEntity) => ListingEntity.customisableOptions,
    {
      cascade: ['insert', 'update', 'remove'],
      onDelete: 'CASCADE'
    }
  )
  public listing: ListingEntity
}
