import { HttpStatus, Inject, Injectable } from '@nestjs/common'

import {
  FitRpcException,
  Order,
  OrderStatus,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  RandomGen,
  ResponseWithStatus,
  ServicePayload,
  UpdateOrderStatusRequestDto
} from '@app/common'
import { ClientProxy, RpcException } from '@nestjs/microservices'
import { lastValueFrom } from 'rxjs'
import { OrderRepository } from './order.repository'

@Injectable()
export class OrdersServiceService {
  constructor (
    private readonly orderRepository: OrderRepository,
    @Inject(QUEUE_SERVICE.NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy
  ) {}

  public async placeOrder ({
    data,
    userId
  }: ServicePayload<Order>): Promise<ResponseWithStatus> {
    const createOrderPayload: Partial<Order> = {
      ...data,
      user: userId,
      refId: RandomGen.genRandomNum(),
      orderStatus: OrderStatus.PROCESSED
    }

    const _newOrder = await this.orderRepository.create(createOrderPayload)

    if (_newOrder === null) {
      throw new FitRpcException(
        'Can not create your order at this time',
        HttpStatus.BAD_REQUEST
      )
    }

    try {
      // Send order confirmation message
      await lastValueFrom(
        this.notificationClient.emit(QUEUE_MESSAGE.ORDER_STATUS_UPDATE, {
          phoneNumber: _newOrder.primaryContact,
          status: OrderStatus.PROCESSED
        })
      )
    } catch (error) {
      throw new RpcException(error)
    }

    return { status: 1 }
  }

  public async getAllVendorOrders (vendorId: string): Promise<Order[]> {
    try {
      const _orders = await this.orderRepository.find({ vendorId })
      return _orders
    } catch (error) {
      throw new FitRpcException(
        'Can not process request. Try again later',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async getAllUserOrders (userId: string): Promise<Order[]> {
    try {
      const _orders = await this.orderRepository.find({ userId })
      return _orders
    } catch (error) {
      throw new FitRpcException(
        'Can not process request. Try again later',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async getAllOrderInDb (): Promise<Order[]> {
    try {
      const _orders = await this.orderRepository.find({})
      return _orders
    } catch (error) {
      throw new FitRpcException(
        'Can not process request. Try again later',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async getOrderByRefId (refId: number): Promise<Order | null> {
    try {
      return await this.orderRepository.findOne({ refId })
    } catch (error) {
      throw new FitRpcException(
        'Can not process request. Try again later',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async getOrderById (_id: any): Promise<Order | null> {
    try {
      return await this.orderRepository.findOne({ _id })
    } catch (error) {
      throw new FitRpcException(
        'Can not process request. Try again later',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async updateStatus ({
    status,
    orderId
  }: UpdateOrderStatusRequestDto): Promise<ResponseWithStatus> {
    const order = (await this.orderRepository.findOneAndUpdate({ _id: orderId }, { status }))

    await lastValueFrom(
      this.notificationClient.emit(QUEUE_MESSAGE.ORDER_STATUS_UPDATE, {
        phoneNumber: order.primaryContact,
        status,
        listingId: order.listing
      })
    )

    return { status: 1 }
  }
}
