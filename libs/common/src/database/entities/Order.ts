import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { OrderStatus } from '@app/common/typings/OrderStatus.enum'
import { OrderDeliveryMode } from '@app/common/typings/OrderDeliveryMode.enum'
import { OrderBreakDown } from '@app/common/database/dto/order.dto'

@Entity('Order')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string

  @Column('uuid')
  public userId: string

  @Column('uuid')
  public listingId: string

  @Column('uuid')
  public vendorId: string

  @Column('int')
  public totalOrderValue: number

  @Column('int')
  public orderValueToCharge: number

  @Column('text')
  public orderStatus: OrderStatus

  @Column('text')
  public deliveryMode: OrderDeliveryMode

  @Column('text')
  public deliveryAddress: string

  @Column({ type: 'boolean', default: false })
  public isThirdParty: boolean

  @Column('text')
  public primaryContact: string

  @Column({ type: 'text', nullable: true })
  public secondaryContact: string

  @Column({ type: 'text', nullable: true, array: true })
  public customizableOptions: string[]

  @Column({ type: 'text', nullable: true, array: true })
  public addOns: string[]

  @Column({ type: 'jsonb', nullable: true })
  public orderBreakDown: OrderBreakDown

  @Column('int')
  public refId: number
}
