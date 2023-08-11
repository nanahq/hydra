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

export interface UssdCharge extends BaseChargeRequest {
  account_bank: SupportedBanks,
  account_number: string
}

export interface  UssdRequest extends BankTransferRequest {
  account_bank: SupportedBanks,
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
  transfer_reference: string,
  account_expiration: number,
}



export enum SupportedBanks  {
  ACCESS_BANK = '044',
  ECO_BANK = '050',
FIDELITY_BANK  = '070',
FIRST_BANK = '011',
FCMB  =  '214',
GT_BANK =  '058',
 KEY_STONE_BANK = '082',

  STANBIC_BANK = '221',
  STERLING_BANK = '232',
  UNION_BANK = '032',
  UBA = '033',
  UNITY_BANK = '215',
  WEMA_BANK = '035',
  ZENITH_BANK = '057'
}
