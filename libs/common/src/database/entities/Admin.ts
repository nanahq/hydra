import {
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  Entity,
  PrimaryColumn,
  BeforeInsert,
  Column
} from 'typeorm'
import { nanoid } from 'nanoid'
import * as bcrypt from 'bcrypt'
import { AdminLevel } from '@app/common/typings/AdminLevel.enum'

@Entity('admin')
export class AdminEntity {
  @PrimaryColumn({ type: 'uuid' })
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
