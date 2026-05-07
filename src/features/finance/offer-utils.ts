import type { BillingOption } from '@/src/features/finance/types'

export const periodOptions = [
  { value: 'morning', label: 'Manhã' },
  { value: 'afternoon', label: 'Tarde' },
  { value: 'night', label: 'Noite' },
] as const

export const billingGroupLabels: Record<string, string> = {
  one_time: 'Pagamento único',
  recurring: 'Mensal',
}

export const billingTabLabels: Record<string, string> = {
  one_time: 'Pagamento total',
  recurring: 'Pagamento mensal',
}

export const billingMethodLabels: Record<string, string> = {
  pix: 'Pix',
  credit_card: 'Cartão de crédito',
}

export function groupBillingOptions(options: BillingOption[]) {
  return options.reduce<Record<string, BillingOption[]>>((groups, option) => {
    const key = option.type
    if (!groups[key]) groups[key] = []
    groups[key].push(option)
    return groups
  }, {})
}
