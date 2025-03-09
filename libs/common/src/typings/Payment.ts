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
  isWalletOrder?: boolean
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
  PAYMENT_SUCCESS = 'charge.success',
}

interface TransactionData {
  id: number
  domain: string
  status: string
  reference: string
  receipt_number: null | string
  amount: number
  message: null | string
  gateway_response: string
  paid_at: null | string
  created_at: string
  channel: string
  currency: string
  ip_address: string
  metadata: {
    transaction_ref: string
  }
  log: null
  fees: null
  fees_split: null
  authorization: {}
  customer: {
    id: number
    first_name: null
    last_name: null
    email: string
    customer_code: string
    phone: null
    metadata: null
    risk_action: string
    international_format_phone: null
  }
  plan: null
  split: {}
  order_id: null
  paidAt: null
  createdAt: string
  requested_amount: number
  pos_transaction_data: null
  source: null
  fees_breakdown: null
  transaction_date: string
  plan_object: {}
  subaccount: {}
}

export interface TransactionVerificationResponse {
  status: boolean
  message: string
  data: TransactionData
}
export interface ChargeSuccessEvent {
  event: 'charge.success'
  data: {
    id: number
    domain: string
    status: string
    reference: string
    amount: number
    message: string | null
    gateway_response: string
    paid_at: string
    created_at: string
    channel: string
    currency: string
    ip_address: string
    metadata: number
    log: {
      time_spent: number
      attempts: number
      authentication: string
      errors: number
      success: boolean
      mobile: boolean
      input: any[] // You might want to create a specific interface for input
      channel: string | null
      history: Array<{
        type: string
        message: string
        time: number
      }>
    }
    fees: any | null // You might want to create a specific interface for fees
    customer: {
      id: number
      first_name: string
      last_name: string
      email: string
      customer_code: string
      phone: string | null
      metadata: any | null // You might want to create a specific interface for metadata
      risk_action: string
    }
    authorization: {
      authorization_code: string
      bin: string
      last4: string
      exp_month: string
      exp_year: string
      card_type: string
      bank: string
      country_code: string
      brand: string
      account_name: string
    }
    plan: Record<string, never> // Assuming the plan object is always empty
  }
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
  VERIFY_TRANSACTION = 'transaction/verify',
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
