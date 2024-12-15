import {
  CouponI,
  CouponType,
  WalletTransactionStatus,
  WalletTransactionType,
} from '../schemas';
import {
  CustomisationOptionTypeEnum,
  DriverType,
  ListingOption,
  LocationCoordinates,
  OrderBreakDown,
  OrderDeliveryMode,
  OrderOptions,
  OrderPaymentType,
  OrderStatus,
  OrderType,
  PaymentInfo,
  VendorOperationSetting,
} from '../typings';

export interface AddressBookDto {
  address: string;
  labelId: string;
  plot_number?: number;
  house_number?: number;
  labelName: string;
  coordinate: [string, string];
  shareableName?: string
  shareable: boolean
}

export interface UserDto {
  phoneNumber: string;
  password: string;
  firstName: string;
  lastName: string;
  status: number;
  addresses: string[];
}

export interface AddressBookLabelDto {
  name: string;
  desc?: string;
}

export interface ListingOptionEntityDto {
  optioName: string;
  optionCost: string;
  optionType: CustomisationOptionTypeEnum;
}

export interface CreateListingCategoryDto {
  name: string;
  tags: string[];
  isLive: boolean;
  type: ' PRE_ORDER' | 'ON_DEMAND';
  menu: string;
}

export interface UpdateListingCategoryDto {
  name?: string;
  tags?: string[];
  isLive?: boolean;
  isDeleted?: boolean;
  catId?: string;
}

export interface CreateListingMenuDto {
  name: string;
  price: string;
  serving: string;
  desc: string;
  photo: string;
  isLive: string;
  isAvailable: string;
  optionGroups: string;
  categoryId: string;
}

export interface CreateOptionGroupDto {
  name: string;
  min: number;
  max: number;
  options: ListingOption[];
}

export interface UpdateOptionGroupDto {
  name?: string;
  min?: number;
  max?: number;
  options?: ListingOption[];
  optionId: string;
}

export interface CreateScheduledListingDto {
  listing: string;
  quantity: number;
  availableDate: number;
}

export interface OrderDto {
  listingId: string;
  totalOrderValue: number;
  orderValueToCharge: number;
  deliveryMode: OrderDeliveryMode;
  deliveryAddress: string;
  isThirdParty: boolean;
  primaryContact: string;
  secondaryContact: string;
  orderBreakDown: OrderBreakDown;
  customizableOptions: string[];
  addOns: string[];
}

export interface CreateVendorDto {
  firstName: string;
  lastName: string;
  businessName: string;
  businessAddress: string;
  email: string;
  phone: string;
  password: string;
  location: LocationCoordinates;
}

export interface UpdateVendorProfileDto {
  status?: 'ONLINE' | 'OFFLINE';
  firstName?: string;
  lastName?: string;
  businessName?: string;
  businesssAddress?: string;
  email?: string;
  password?: string;
  location?: LocationCoordinates;
  category?: string[];
}

export interface UpdateVendorSettingsDto {
  operations?: VendorOperationSetting;
  payment?: PaymentInfo;
}

export interface ReviewDto {
  listing: string;
  order: string;
  reviewBody: string;
  vendor: string;
  reviewStars: number;
}

export interface ReasonDto {
  reason: string;
}

export interface ChargeWithBankTransferDto {
  orderId: string;
}

export interface ChargeWithUssdDto extends ChargeWithBankTransferDto {
  account_number: string;
  account_bank: string;
}

export interface InitiateCharge {
  email: string;
  amount: string;
}

export interface loginUserRequest {
  phone: string;
  password: string;
}

export interface LoginVendorRequest {
  email: string;
  password: string;
}

export interface RegisterAdminDto {
  userName: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface registerUserRequest {
  phone: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface RegisterDriverDto {
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  state: string;
  email: string;
  nin: number;
  type: DriverType;
  organization?: string;
}

export interface UpdateUserDto {
  email: string;
  phone: string;
  status: 'ONLINE' | 'OFFLINE';
  location: LocationCoordinates;
  firstName: string;
  lastName: string;
  expoNotificationToken: string;
}

export interface PaystackInstancePayload {
  customerId?: string;
  phone: string;
  virtualAccountNumber?: string;
}

export interface registerUserWallet extends registerUserRequest {
  user: string;
}

export interface verifyPhoneRequest {
  phone: string;
}

export interface PhoneVerificationPayload extends verifyPhoneRequest {
  code: string;
}

export interface UpdateAdminLevelRequestDto {
  level: any;
  id: string;
}

export interface UpdateVendorReviewDto {
  vendor: string;
  review: string;
}

export interface UpdateOrderStatusRequestDto {
  status: OrderStatus;
  orderId: string;
  streamUpdates?: boolean;
}

export interface UpdateOrderStatusPaidRequestDto {
  status: OrderStatus;
  orderId: string;
  txRefId: string;
}

export interface UpdateVendorStatus {
  id: string;
  status: 'ONLINE' | 'OFFLINE';
}

export interface CreateCouponDto {
  validFrom: string;
  validTill: string;
  useOnce: boolean;
  percentage: number;
  type: CouponType;
  value: number;
  suffix: string;
  code: string;
  listing: string;
}

export interface UpdateCouponDto {
  validFrom: string;
  validTill: string;
  expired: boolean;
  _id: string;
}

export interface GetCoupon extends Partial<CouponI> {
  code: string;
}

export interface UpdateCouponUsage {
  code: string;
  user: string;
}

export interface PreciseLocationDto {
  coordinates: [number, number];
  type: 'Point';
}

export interface OrderBreakDownDto {
  orderCost: number;
  systemFee: number;
  deliveryFee: number;
  vat: number;
}

export interface PlaceOrderDto {
  user: string;
  vendor: string;
  listing: string[];
  quantity: [
    {
      listing: string;
      quantity: number;
    },
  ];
  totalOrderValue: number;
  orderType: OrderType;
  orderValuePayable: number;
  deliveryAddress: string;
  primaryContact: string;
  isThirdParty: boolean;
  preciseLocation: PreciseLocationDto;
  options: OrderOptions[];
  orderDeliveryScheduleTime: string;
  orderBreakDown: OrderBreakDownDto;
  thirdPartyName?: string;
  coupon?: string;
  paymentType: OrderPaymentType;
  pickupAddress: string;
  precisePickupLocation: PreciseLocationDto
  
}

export interface UpdateDeliveryStatusDto {
  deliveryId: string;
  status: OrderStatus;
}

export interface CreateSubscriptionDto {
  vendor: string;
}

export interface SuscribeDto extends CreateSubscriptionDto {
  suscriberId: string;
}

export interface UpdateSuscriptionByVendorDto extends CreateSubscriptionDto {
  enabledByVendor: boolean;
}

export interface SendApprovalPushNotification extends CreateSubscriptionDto {
  token: string;
}

export interface CreateBrevoContact {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  businessName?: string;
}

export interface CreditWallet {
  amount: number;
  driver: string;
  withTranaction: boolean;
  transaction?: string;
  status: WalletTransactionStatus;
}

export interface DebitWallet {
  amount: number;
  driver: string;
  withTransaction: boolean;
  transaction?: string;
  status?: WalletTransactionStatus;
}

export interface DebitUserWallet {
  user: string;
  amountToDebit: number;
}

export interface createTransaction {
  amount: number;
  driver: string;
  transaction: string;
  type: WalletTransactionType;
  status: WalletTransactionStatus;
}

export interface UpdateTransaction {
  txId: string;
  driverId: string;
  status: WalletTransactionStatus;
}

export interface AcceptFleetInviteDto {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  inviteLink: string;
}

export interface CreateAccountWithOrganizationDto {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  organization: string;
}

export class UpdateFleetOwnershipStatusDto {
  memberId: string;
  status: boolean;
}

export class UpdateFleetMemberProfileDto {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
}