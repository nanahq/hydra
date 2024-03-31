import {
  ResponseWithStatus,
  Review,
  VendorReviewOverview,
  ReviewDto,
  BankTransferAccountDetails,
  UssdRequest,
  BankTransferRequest,
  VendorPayout,
  PayoutOverview,
  ServicePayload,
  Order,
  UpdateOrderStatusRequestDto,
  UpdateOrderStatusPaidRequestDto
} from '@app/common'
import { Aggregate, FilterQuery } from 'mongoose'

export interface ReviewsServiceI {
  getAllReviews: () => Promise<Review[]>
  getVendorReviews: (vendorId: string) => Promise<Review[]>
  getListingReviews: (listingId: string) => Promise<Review[]>
  findOneById: (_id: any) => Promise<Review | null>
  deleteReviewById: (reviewId: any) => Promise<{ status: number }>
  create: (data: ReviewDto) => Promise<ResponseWithStatus>
  getVendorReviewOverview: (vendorId: string) => Promise<VendorReviewOverview>
  statGetListingReviews: (listingId: string) => Promise<any>
}

export interface PaymentServiceI {
  chargeWithUssd: (payload: UssdRequest) => Promise<any>
  chargeWithBankTransfer: (
    payload: BankTransferRequest,
  ) => Promise<BankTransferAccountDetails>
  verifyPayment: (txId: string, refId: string) => Promise<void>
}

export interface VendorPayoutServiceI {
  createPayout: (data: Partial<VendorPayout>) => Promise<ResponseWithStatus>
  updatePayoutStatus: (_id: string) => Promise<ResponseWithStatus>
  getAllPayout: () => Promise<VendorPayout[]>
  getVendorPayout: (vendor: string) => Promise<VendorPayout[]>
  payoutOverview: (vendor: string) => Promise<PayoutOverview>
  handlePayoutComputation?: () => Promise<void>
  sendPayoutEmails?: () => Promise<void>
}

export interface OrdersServiceServiceI {
  placeOrder: (payload: ServicePayload<Order>) => Promise<ResponseWithStatus>
  getAllVendorOrders: (vendor: string) => Promise<Order[]>
  getAllUserOrders: (user: string) => Promise<Order[]>
  getAllFulfilledOrders: () => Promise<Order[]>
  getAllTransitOrders: () => Promise<Order[]>
  getAllPaidOrder: () => Promise<Order[]>
  getAllOrders: () => Promise<Order[]>
  getAllOrderInDb: (filterQuery: FilterQuery<Order>) => Promise<Order[]>
  getOrderByRefId: (refId: number) => Promise<Order | null>
  getOrderById: (_id: string) => Promise<Order | null>
  updateStatus: (
    dto: UpdateOrderStatusRequestDto,
  ) => Promise<ResponseWithStatus>
  updateStatusPaid: (
    dto: UpdateOrderStatusPaidRequestDto,
  ) => Promise<ResponseWithStatus>
  vendorAcceptOrder: (orderId: string, phone: string) => Promise<void>
  odsaGetPreOrders: () => Promise<Order[] | null>
  adminMetrics: () => Promise<Aggregate<any>>
}
