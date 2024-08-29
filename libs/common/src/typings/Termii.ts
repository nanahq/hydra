export enum message_type {

}

export enum TERMII_URLS {
  SEND_TOKEN = 'api/sms/otp/send',
  VERIFY_TOKEN = 'api/sms/otp/verify'
}

export interface TermiiPayload {
  api_key: string
  message_type: 'NUMERIC' | 'ALPHANUMERIC'
  to: string
  from: string
  channel: 'dnd' | 'Whatsapp' | 'generic' | 'email'
  pin_attempts: number
  pin_time_to_live: number
  pin_length: number
  pin_placeholder: string
  message_text: string
  pin_type: 'NUMERIC' | 'ALPHANUMERIC'
}

export interface TermiiResponse {
  smsStatus: string
  phone_number: string
  pinId: string
  pin_id: string
  to: string
  status: string
}

export interface TermiiVerificationPayload {
  apiKey: string
  pinId: string
  pin: string
}

export interface TermiiVerificationResponse {
  pinId: string
  verified: string
  msisdn: string
}
