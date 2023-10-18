import { MockModel } from '@app/common/database/test/support/mock.model'
import { Order } from '@app/common'
import { OrderStub } from '../stub/orders.stub'

export class OrderModel extends MockModel<Order> {
  protected entityStub = OrderStub() as any
}
