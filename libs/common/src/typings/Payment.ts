export interface SupportedPaymentType {
  BANK_TRANSFER: 'BANK_TRANSFER'
  CREDIT_CARD: 'CREDIT_CARD'
}

export interface PaymentDetails {
  type?: SupportedPaymentType
  accountNumber?: number | string
  payee?: string
  creditCard?: string
}

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

export interface BankTransferRequest {
  userId: string
  orderId: string
}

export interface BankTransferCharge {
  tx_ref: string
  amount: string
  email: string
  currency: string
}

export interface BankTransferAccountDetails {
  transfer_account: string
  transfer_bank: string
  transfer_amount: number
  transfer_reference: string,
  account_expiration: number,
}
