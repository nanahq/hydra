import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity('reviews')
export class ReviewEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string

  @Column({ type: 'text' })
  public reviewBody: string

  @Column({ type: 'uuid' })
  public listingId: string

  @Column({ type: 'uuid' })
  public vendorId: string

  @Column({ type: 'uuid' })
  public orderId: string

  @Column({ type: 'int' })
  public reviewStars: number

  @UpdateDateColumn()
  public updatedAt: Date

  @CreateDateColumn()
  public createdAt: Date

  @DeleteDateColumn()
  public deletedAt: Date
}
