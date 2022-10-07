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

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryColumn({ type: 'text' })
  public id: string

  @Column()
  public phoneNumber: string

  @Column({ type: 'text', select: false })
  public password: string

  @Column({ type: 'text' })
  public firstName: string

  @Column({ type: 'text' })
  public lastName: string

  @Column({ type: 'text' })
  public state: string

  @Column({ nullable: true, default: 0, type: 'int' })
  public status: number

  @Column({ type: 'text', array: true })
  public addresses: string[]

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
