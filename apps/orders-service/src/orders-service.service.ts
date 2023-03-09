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
import { catchError, lastValueFrom } from 'rxjs'
import { OrderRepository } from './order.repository'
import { FilterQuery } from 'mongoose'

@Injectable()
export class OrdersServiceService {
  constructor (
    private readonly orderRepository: OrderRepository,
    @Inject(QUEUE_SERVICE.NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy,

    @Inject(QUEUE_SERVICE.USERS_SERVICE)
    private readonly userClient: ClientProxy
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

      await lastValueFrom(
        this.userClient.emit(QUEUE_MESSAGE.UPDATE_USER_ORDER_COUNT, { orderId: _newOrder._id, userId })
      )
    } catch (error) {
      throw new RpcException(error)
    }

    return { status: 1 }
  }

  public async getAllVendorOrders (vendor: string): Promise<Order[]> {
    try {
      const _orders = await this.orderRepository.findAndPopulate({ vendor }, 'listing vendor') as any
      return _orders
    } catch (error) {
      throw new FitRpcException(
        'Can not process request. Try again later',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async getAllUserOrders (user: string): Promise<Order[]> {
    try {
      return await this.orderRepository.findAndPopulate({ user }, 'user listing vendor')
    } catch (error) {
      throw new FitRpcException(
        'Can not process request. Try again later',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async getAllOrderInDb (filterQuery: FilterQuery<Order>): Promise<Order[]> {
    try {
      const _orders = await this.orderRepository.findAndPopulate(filterQuery, 'vendor') as any
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
      return await this.orderRepository.findOneAndPopulate({ refId }, 'user listing vendor')
    } catch (error) {
      throw new FitRpcException(
        'Can not process request. Try again later',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async getOrderById (_id: any): Promise<Order | null> {
    try {
      return await this.orderRepository.findOneAndPopulate({ _id }, 'user listing vendor')
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
    await this.orderRepository.findOneAndUpdate({ _id: orderId }, { orderStatus: status })
    return { status: 1 }
  }

  public async vendorAcceptOrder (orderId: string, phone: string): Promise<void> {
    try {
      await this.orderRepository.findOneAndUpdate({ _id: orderId }, { orderStatus: OrderStatus.ACCEPTED })
      await lastValueFrom(
        this.notificationClient.emit(QUEUE_MESSAGE.VENDOR_ACCEPT_ORDER, { phone })
          .pipe(
            catchError((error) => {
              throw error
            })
          )
      )
    } catch (error) {
      throw new FitRpcException('failed to process order', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
