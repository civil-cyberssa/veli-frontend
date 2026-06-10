export const weekdayMap: Record<string, string> = {
  Mon: 'Seg',
  Tue: 'Ter',
  Wed: 'Qua',
  Thu: 'Qui',
  Fri: 'Sex',
  Sat: 'Sáb',
  Sun: 'Dom',
}

export const checkoutStatusMap: Record<string, string> = {
  draft: 'Rascunho',
  pending_contract: 'Contrato pendente',
  pending_payment: 'Aguardando pagamento',
  processing: 'Processando',
  paid: 'Pago',
  active: 'Ativo',
  canceled: 'Cancelado',
  expired: 'Expirado',
}

export const contractStatusMap: Record<string, string> = {
  pending_signature: 'Assinatura pendente',
  accepted: 'Aceito',
  active: 'Ativo',
}

export const paymentTypeMap: Record<string, string> = {
  pix: 'Pix',
  credit: 'Cartão',
  credit_card: 'Cartão',
}

export const paymentModeMap: Record<string, string> = {
  one_time: 'Pagamento único',
  monthly: 'Mensal',
  recurring: 'Recorrente',
}

export const chargeStatusMap: Record<string, string> = {
  pending: 'Pendente',
  waiting_payment: 'Aguardando pagamento',
  processing: 'Processando',
  confirmed: 'Confirmado',
  paid: 'Pago',
  overdue: 'Vencido',
  canceled: 'Cancelado',
  expired: 'Expirado',
  refunded: 'Reembolsado',
  failed: 'Falhou',
}

export function formatCurrency(value: string | number | null | undefined) {
  const amount = typeof value === 'number' ? value : Number(value ?? 0)

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount)
}

export function formatDate(date: string | null | undefined) {
  if (!date) return 'Não informado'

  if (date.includes('/') && date.length <= 10) return date

  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateTime(date: string | null | undefined) {
  if (!date) return 'Não informado'

  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatWeekdays(days: string[] = []) {
  return days.map((day) => weekdayMap[day] ?? day).join(' • ')
}

export function digitsOnly(value: string) {
  return value.replace(/\D/g, '')
}

export function formatCardNumber(value: string) {
  return digitsOnly(value)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
    .trim()
}

export function formatExpiry(value: string) {
  const digits = digitsOnly(value).slice(0, 6)

  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

export function maskCardNumber(value: string) {
  const digits = digitsOnly(value)
  const masked = digits.padEnd(16, '•').slice(0, 16)
  return masked.replace(/(.{4})/g, '$1 ').trim()
}
