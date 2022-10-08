import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn
} from 'typeorm'
import { nanoid } from 'nanoid'
import * as bcrypt from 'bcrypt'
import { VendorApprovalStatusEnum } from '@app/common/typings/VendorApprovalStatus.enum'

@Entity('vendor')
export class VendorEntity {
  @PrimaryColumn({ type: 'text' })
  public id: string

  @Column({ type: 'text' })
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

  @BeforeInsert()
  private async beforeInsert (): Promise<void> {
    this.id = nanoid()
    this.password = await bcrypt.hash(this.password, 10)
  }
}
