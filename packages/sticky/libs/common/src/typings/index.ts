import { ListingCategoryI, OrderI, ReviewI, VendorI } from '../schemas'

export interface TokenPayload {
  userId: string
}

export interface VendorWithListing {
  vendor: VendorI
  listing: ListingCategoryI
}

export interface ReviewToken {
  listingId: string
}

export type OrderType = 'PRE_ORDER' | 'ON_DEMAND'

export enum OrderTypes {
  PRE = 'PRE_ORDER',
  INSTANT = 'ON_DEMAND',
}

export interface SendPayoutEmail {
  vendorName: string
  vendorId: string
  vendorEmail: string
  payoutDate: string
  payoutAmount: string
}
export enum CustomisationOptionTypeEnum {
  ADD_ON = 'ADD_ON',
  CUSTOMISE = 'CUSTOMISE',
}

export enum AdminLevel {
  DIAMOND = 'DIAMOND',
  GOLD = 'GOLD',
  SILVER = 'SILVER',
}

export enum AvailableDate {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export interface CustomOptions {
  optionName: string
  optionPrice: number
  optionIsFree: boolean
}

export interface SendVendorSignUpEmail {
  vendorName: string
  vendorEmail: string
}
export interface ResponseWithStatus {
  status: 0 | 1
}

export enum VendorApprovalStatusEnum {
  PENDING = 'REVIEWING', // Default
  APPROVED = 'CLEARED',
  DISAPPROVED = 'RETURNED',
}

export interface PayoutOverview {
  '24_hours': number
  '7_days': number
  '30_days': number
}

export type VendorOperationType = 'PRE_ORDER' | 'ON_DEMAND' | 'PRE_AND_INSTANT'

export type DriverType = 'DELIVER_PRE_ORDER' | 'DELIVER_ON_DEMAND'

export interface OrderGroup {
  groupId: number
  orders: OrderI[]
  maxDeliveryTime: number
}

export interface DriverWithLocation {
  driverId: string | any
  coordinates: string[]
}

export interface ListingOption {
  name: string
  price: string
}

export interface PaymentInfo {
  bankName: string
  bankAccountName: string
  bankAccountNumber: string
}

export interface VendorOperationSetting {
  startTime?: string
  cutoffTime?: string
  placementTime?: string
  minOrder?: number
  preparationTime?: number
  deliveryType?: VendorOperationType
}

export interface LocationCoordinates {
  coordinates: [string, string]
}

export interface ListingMenuReview {
  rating: string
  numberOfReviews: number
  reviews: ReviewI[]
}

export interface VendorReviewOverview {
  rating: string
  numberOfReviews: number
  riskFactor: 'HIGH' | 'MEDIUM' | 'LOW'
}

export interface UpdateUserDto {
  email: string

  phone: string

  status: 'ONLINE' | 'OFFLINE'

  location: LocationCoordinates
}

export interface UpdateAdminLevelRequestDto {
  level: any

  id: string
}

export interface UpdateVendorStatus {
  id: string

  status: 'ONLINE' | 'OFFLINE'
}

export interface verifyPhoneRequest {
  phone: string
}

export interface UpdateOrderStatusRequestDto {
  status: OrderStatus

  orderId: string
}

export interface UpdateOrderStatusPaidRequestDto {
  status: OrderStatus

  orderId: string

  txRefId: string
}

export interface registerUserRequest {
  phone: string

  password: string
}

export interface RegisterDriverDto {
  phone: string

  password: string

  firstName: string

  lastName: string

  state: string

  email: string
}

export interface RegisterAdminDTO {
  userName: string

  password: string

  firstName: string

  lastName: string
}

export interface SupportedPaymentType {
  BANK_TRANSFER: 'BANK_TRANSFER'
  USSD: 'USSD'
}

export interface PaymentDetails {
  type?: SupportedPaymentType
}

export type PaymentStatus = 'PENDING' | 'FAILED' | 'SUCCESS'
export interface CreditCardCharge {
  card_number: string
  cvv: string
  expiry_month: string
  expiry_year: string
  currency: 'NGN'
  amount: string
  email: string
  tx_ref: string
}

export interface CreditChargeRequest {
  card_number: string
  cvv: string
  expiry_month: string
  expiry_year: string
  listingId: string
  orderId: string
  userId: string
}
export interface OrderBreakDown {
  orderCost: number
  systemFee: number
  deliveryFee: number
  vat: number
}

export interface UssdCharge extends BaseChargeRequest {
  account_bank: SupportedBanks
  account_number: string
}

export interface UssdRequest extends BankTransferRequest {
  account_bank: SupportedBanks
  account_number: string
}

export interface BankTransferRequest {
  userId: string
  orderId: string
}

export interface BaseChargeRequest {
  tx_ref: string
  amount: string
  email: string
  currency: string
}

export interface BankTransferAccountDetails {
  transfer_account: string
  transfer_bank: string
  transfer_amount: number
  transfer_reference: string
  account_expiration: number
}

export enum SupportedBanks {
  ACCESS_BANK = '044',
  ECO_BANK = '050',
  FIDELITY_BANK = '070',
  FIRST_BANK = '011',
  FCMB = '214',
  GT_BANK = '058',
  KEY_STONE_BANK = '082',

  STANBIC_BANK = '221',
  STERLING_BANK = '232',
  UNION_BANK = '032',
  UBA = '033',
  UNITY_BANK = '215',
  WEMA_BANK = '035',
  ZENITH_BANK = '057',
}

export interface loginUserRequest {
  phone: string

  password: string
}

export interface LoginVendorRequest {
  businessEmail: string

  password: string
}

export interface OrderStatusUpdateDto {
  phoneNumber: string

  status: OrderStatus
}

export interface PhoneVerificationPayload extends verifyPhoneRequest {
  code: string
}

export enum OrderStatus {
  PROCESSED = 'ORDER_PLACED', // default order status
  ACCEPTED = 'ORDER_ACCEPTED', // default
  COLLECTED = 'COLLECTED_FROM_VENDOR', // Only vendors can updated/use this
  IN_ROUTE = 'OUT_FOR_DELIVERY', // Only admin/rider can update/use this
  FULFILLED = 'DELIVERED_TO_CUSTOMER',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  COURIER_PICKUP = 'COURIER_PICKUP',
}

export enum OrderDeliveryMode {
  PICKUP = 'ORDER_PICK_UP',
  DELIVERY = 'ORDER_DELIVERY',
}

export interface CreateVendorDto {
  firstName: string

  lastName: string

  businessEmail: string

  businessName: string

  businessAddress: string

  email: string

  phone: string

  password: string
}

export interface UpdateVendorProfileDto {
  status: 'ONLINE' | 'OFFLINE'

  firstName: string

  lastName: string

  businessEmail: string

  businessName: string

  businessAddress: string

  businessLogo: string

  email: string

  phone: string

  password: string

  location: LocationCoordinates
}

export interface UpdateVendorSettingsDto {
  operation?: VendorOperationSetting

  payment?: PaymentInfo
}

export interface OrderDto {
  listingId: string

  totalOrderValue: number

  orderValueToCharge: number

  deliveryMode: OrderDeliveryMode

  deliveryAddress: string

  isThirdParty: boolean

  primaryContact: string

  secondaryContact: string

  orderBreakDown: OrderBreakDown

  customizableOptions: string[]

  addOns: string[]
}

export interface ListingOptionEntityDto {
  optionName: string

  optionCost: string

  optionType: CustomisationOptionTypeEnum
}

export interface CreateListingCategoryDto {
  name: string

  tags: string[]

  isLive: boolean

  menu?: string
}

export interface UpdateListingCategoryDto {
  name?: string

  tags?: string[]

  isLive?: boolean

  isDeleted?: boolean

  catId?: string
}

export interface CreateListingMenuDto {
  name: string

  price: string

  serving: string

  desc: string

  photo: string

  isLive: string

  isAvailable: string

  optionGroups: string

  categoryId: string
}

export interface CreateOptionGroupDto {
  name: string

  min: number

  max: number

  options: ListingOption[]
}

export interface UpdateOptionGroupDto {
  name?: string

  min?: number

  max?: number

  options?: ListingOption[]

  optionId?: string
}

// Interfaces

export interface ChargeWithBankTransferDto {
  orderId: string
}

export interface ChargeWithUssdDto extends ChargeWithBankTransferDto {
  account_bank: string

  account_number: string
}

export interface ReviewDto {
  listingId: string

  orderId: string

  reviewBody: string

  vendorId: string

  reviewStars: number
}

export interface AddressBookLabelDto {
  name: string

  desc?: string
}

export interface AddressBookDto {
  address: string

  labelId: string

  plot_number?: number

  house_number?: number

  coordinates: [string, string]
}

export interface UserDto {

  phoneNumber: string

  password: string

  firstName: string

  lastName: string

  status: number

  addresses: string[]
}