import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

import { VendorApprovalStatusEnum } from '@app/common/typings/VendorApprovalStatus.enum'

@Entity('vendor')
export class VendorEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string

  @Column({ type: 'text', select: false })
  public password: string

  @Column({ type: 'text' })
  public businessPhoneNumber: string

  @Column({ type: 'text' })
  public businessName: string

  @Column({ type: 'text' })
  public firstName: string

  @Column({ type: 'text' })
  public lastName: string

  @Column({ type: 'text' })
  public email: string

  @Column({ type: 'text', nullable: true })
  public settlementBankName: string

  @Column({ type: 'int', nullable: true })
  public settlementBankAccount: string

  @Column({ type: 'text' })
  public state: string

  @Column({ type: 'text' })
  public address: string

  @Column({
    type: 'text',
    default: VendorApprovalStatusEnum.PENDING
  })
  public approvalStatus: string

  @UpdateDateColumn()
  public updatedAt: Date

  @DeleteDateColumn()
  public deletedAt: Date

  @CreateDateColumn()
  public createdAt: Date
}
