import { HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { InsertResult, Repository, UpdateResult } from 'typeorm'
import {
  FitRpcException,
  OrderDto,
  OrderEntity,
  OrderStatus,
  RandomGen,
  ResponseWithStatus,
  ServicePayload,
  UpdateOrderStatusRequestDto
} from '@app/common'
import { RpcException } from '@nestjs/microservices'

@Injectable()
export class OrdersServiceService {
  constructor (
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>
  ) {}

  public async placeOrder ({
    data,
    userId
  }: ServicePayload<OrderDto>): Promise<ResponseWithStatus> {
    const createOrderPayload: Partial<OrderEntity> = {
      ...data,
      userId,
      refId: RandomGen.genRandomNum(),
      orderStatus: OrderStatus.PROCESSED
    }

    const _newOrder = await this.createOrder(createOrderPayload)

    if (_newOrder === null) {
      throw new FitRpcException(
        'Can not create your order at this time',
        HttpStatus.BAD_REQUEST
      )
    }

    return { status: 1 }
  }

  public async getVendorOrders (vendorId: string): Promise<OrderEntity[]> {
    const _orders = await this.getOrdersByVendorId(vendorId)

    if (_orders === null) {
      throw new FitRpcException(
        'Can not find orders with that vendor id',
        HttpStatus.NOT_FOUND
      )
    }

    return _orders
  }

  public async getUserOrders (userId: string): Promise<OrderEntity[]> {
    const _orders = await this.getOrdersByUserId(userId)

    if (_orders === null) {
      throw new FitRpcException(
        'Can not find orders with that user id',
        HttpStatus.NOT_FOUND
      )
    }

    return _orders
  }

  public async getAllOrderInDb (): Promise<OrderEntity[]> {
    const _order = await this.getAllOrders()

    if (_order === null) {
      throw new FitRpcException('Orders are empty', HttpStatus.NOT_FOUND)
    }

    return _order
  }

  public async getOrderByRefId (refId: number): Promise<OrderEntity> {
    const _order = await this.getSingleOrderByRefNumber(refId)

    if (_order === null) {
      throw new FitRpcException(
        'Can not find orders with that ref id',
        HttpStatus.NOT_FOUND
      )
    }

    return _order
  }

  public async getOrderById (orderId: string): Promise<OrderEntity> {
    const _order = await this.getSingleOrderById(orderId)

    if (_order === null) {
      throw new FitRpcException(
        'Can not find order with the given id',
        HttpStatus.NOT_FOUND
      )
    }

    return _order
  }

  public async updateStatus ({
    status,
    listingId
  }: UpdateOrderStatusRequestDto): Promise<ResponseWithStatus> {
    await this.updateOrderStatus(status, listingId)
    return { status: 1 }
  }

  private async updateOrderStatus (
    status: OrderStatus,
    id: string
  ): Promise<UpdateResult> {
    try {
      return await this.orderRepository
        .createQueryBuilder('order')
        .update(OrderEntity)
        .set({
          orderStatus: status
        })
        .where('id = :id', { id })
        .execute()
    } catch (error) {
      throw new RpcException(error)
    }
  }

  private async getSingleOrderById (id: string): Promise<OrderEntity | null> {
    return await this.orderRepository
      .createQueryBuilder()
      .where('id = :id', { id })
      .getOne()
  }

  private async getSingleOrderByRefNumber (
    refNumber: number
  ): Promise<OrderEntity | null> {
    return await this.orderRepository
      .createQueryBuilder('order')
      .where('order.refId = :id', { id: refNumber })
      .getOne()
  }

  private async getOrdersByVendorId (
    vendorId: string
  ): Promise<OrderEntity[] | null> {
    return await this.orderRepository
      .createQueryBuilder('order')
      .where('order.vendorId = :vendorId', { vendorId })
      .getMany()
  }

  private async getOrdersByUserId (
    userId: string
  ): Promise<OrderEntity[] | null> {
    return await this.orderRepository
      .createQueryBuilder('order')
      .where('order.userId = :userId', { userId })
      .getMany()
  }

  private async getAllOrders (): Promise<OrderEntity[] | null> {
    return await this.orderRepository.createQueryBuilder().getMany()
  }

  private async createOrder (
    data: Partial<OrderEntity>
  ): Promise<InsertResult | null> {
    try {
      return await this.orderRepository
        .createQueryBuilder('order')
        .insert()
        .into(OrderEntity)
        .values(data)
        .returning('id')
        .execute()
    } catch (error) {
      throw new RpcException(error)
    }
  }
}
