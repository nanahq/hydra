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

export interface UssdCharge extends BaseChargeRequest {
  account_bank: SupportedBanks
  account_number: string
}

export const PaystackWebhookIps = [
  '52.31.139.75',
  '52.49.173.169',
  '52.214.14.220'
]
export interface UssdRequest extends BankTransferRequest {
  account_bank: SupportedBanks
  account_number: string
}

export interface OrderInitiateCharge {
  userId: string
  orderId: string
  amount: string
  email: string
}
export interface BankTransferRequest {
  userId: string
  orderId: string
}

export interface PaystackCharge {
  email: string
  amount: number

  metadata?: any
}

export interface PaystackChargeResponse {
  status: boolean
  message: string
  data: PaystackChargeResponseData
}
export interface PaystackChargeResponseData {
  authorization_url: string
  access_code: string
  reference: string
}

export enum PaystackEvents {
  PAYMENT_SUCCESS = 'paymentrequest.success'
}

export interface PaymentRequestSuccessEvent {
  event: PaystackEvents
  data: {
    id: number
    domain: string
    amount: number
    currency: string
    due_date: string | null
    has_invoice: boolean
    invoice_number: string | null
    description: string
    pdf_url: string | null
    line_items: any[] // You might want to create a specific interface for line items
    tax: any[] // You might want to create a specific interface for tax
    request_code: string
    status: 'success'
    paid: boolean
    paid_at: string
    metadata: any | null // You might want to create a specific interface for metadata
    notifications: Array<{
      sent_at: string
      channel: string
    }>
    offline_reference: string
    customer: number
    created_at: string
  }
}
export interface BaseChargeRequest {
  tx_ref: string
  amount: string
  email: string
  currency: string
}

export enum PAYSTACK_URLS {
  INITIATE_CHARGE = 'transaction/initialize',
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
