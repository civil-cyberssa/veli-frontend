export interface StudentClassSummary {
  id: number
  course: number
  course_name: string
  class_name: string
  language_icon: string
  start_date: string
  finish_date: string
  time: string
  days_of_week: string[]
  duration: number
  classroom_link: string
  is_active: boolean
}

export interface OfferCourse {
  id: number
  name: string
  language_id: number
  language_name: string
  language_icon: string
  level_id: number
  level_name: string
  description: string
  is_active: boolean
}

export interface BillingOption {
  id: number
  code: string
  type: string
  cycle: string
  billing_method: string
  price: string
  allowed_installments: number[]
}

export interface ContractedOffer {
  id: number
  name: string
  course: OfferCourse
  student_classes: StudentClassSummary[]
  access_days: number | null
  access_duration_days: number | null
  grace_period_days: number
  price: string
  is_active: boolean
  plan_type: string
  billing_interval_months: number | null
  allow_cash_discount: boolean
  cash_discount_type: string | null
  cash_discount_value: string | null
  billing_options: BillingOption[]
}

export interface AvailableOffer extends ContractedOffer {
  user_has_this_offer: boolean
}

export interface ContractSummary {
  id: number
  status: string
  signed_at: string | null
  activated_at: string | null
  contract_file_url: string
}

export interface CurrentContractedOfferResponse {
  order_id: number
  checkout_status: string
  offer: ContractedOffer
  contract: ContractSummary
  course_name: string
  icon: string
  student_class: StudentClassSummary | null
}

export interface PixQrCode {
  payload: string
  success: boolean
  description: string
  encodedImage: string
  expirationDate: string
}

export interface LatestCharge {
  id: number
  status: string
  billing_method: string
  amount_gross: string
  installments: number | null
  due_date: string | null
  pix_qr_code: PixQrCode | null
  pix_copy_paste: string | null
}

export interface PendingPayment {
  order_id: number
  offer_id: number
  offer_name: string
  student_class_id: number
  course_name: string
  value: number
  installments?: number | null
  allowed_installments?: number[]
  pending_cycle_number?: number | null
  pending_cycle_total?: number | null
  checkout_status: string
  contract_acceptance_status: string
  payment_mode: string
  payment_type: string
  current_period_start: string
  current_period_end: string
  contract: ContractSummary | null
  billing_subscription: unknown | null
  latest_charge: LatestCharge | null
}

export interface PaymentHolderPayload {
  name: string
  email: string
  postal_code: string
  address_number: string
  phone: string
}

export interface CreditCardPayload {
  name: string
  number: string
  cvv: string
  expiration_date: string
}

export interface StartPaymentPayload {
  holder?: PaymentHolderPayload
  holder_is_customer: boolean
  credit_card: CreditCardPayload
  installments: number
  accept_contract: boolean
}

export interface PaymentGatewayCreditCard {
  creditCardNumber: string
  creditCardBrand: string
  creditCardToken: string
}

export interface PaymentGatewayResponseRaw {
  object: string
  id: string
  dateCreated: string
  customer: string
  installment: string | null
  checkoutSession: string | null
  paymentLink: string | null
  value: number
  netValue: number
  originalValue: number | null
  interestValue: number | null
  description: string
  billingType: string
  confirmedDate: string | null
  creditCard: PaymentGatewayCreditCard | null
  pixTransaction: unknown | null
  status: string
  dueDate: string | null
  originalDueDate: string | null
  paymentDate: string | null
  clientPaymentDate: string | null
  installmentNumber: number | null
  invoiceUrl: string | null
  invoiceNumber: string | null
  externalReference: string | null
  deleted: boolean
  anticipated: boolean
  anticipable: boolean
  creditDate: string | null
  estimatedCreditDate: string | null
  transactionReceiptUrl: string | null
  nossoNumero: string | null
  bankSlipUrl: string | null
  lastInvoiceViewedDate: string | null
  lastBankSlipViewedDate: string | null
  discount: {
    value: number
    limitDate: string | null
    dueDateLimitDays: number
    type: string
  }
  fine: {
    value: number
    type: string
  }
  interest: {
    value: number
    type: string
  }
  postalService: boolean
  escrow: unknown | null
  refunds: unknown | null
}

export interface StartPaymentResponse {
  order_id: number
  checkout_status: string
  pix_qr_code_base64: string | null
  mode: string
  charge_id: number
  gateway_charge_id: string
  pix_qr_code: string | null
  pix_copy_paste: string | null
  raw: PaymentGatewayResponseRaw
}

export interface CreateOrderPayload {
  offer_id: number
  student_class_id?: number
  billing_option_code: string
  installments: number
  preference_period?: string[]
}

export interface CreateOrderResponse {
  id?: number
  order_id?: number
  checkout_status?: string
  [key: string]: unknown
}
