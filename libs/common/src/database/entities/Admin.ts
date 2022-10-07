import {
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  Entity,
  PrimaryColumn,
  Column
} from 'typeorm'
import { AdminLevel } from '@app/common/typings/AdminLevel.enum'

@Entity('admin')
export class AdminEntity {
  @PrimaryColumn({ type: 'text' })
  public id: string

  @Column()
  public userName: string

  @Column({ type: 'text' })
  public password: string

  @Column({ type: 'text' })
  public firstName: string

  @Column({ type: 'text' })
  public lastName: string

  @Column({ type: 'enum', enum: AdminLevel, default: AdminLevel.SILVER })
  public level: AdminLevel

  @UpdateDateColumn()
  public updatedAt: Date

  @DeleteDateColumn()
  public deletedAt: Date

  @CreateDateColumn()
  public createdAt: Date
}
