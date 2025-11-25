/**
 * Formata CPF no padrão 000.000.000-00
 */
export const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, "")
  if (numbers.length <= 11) {
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
  }
  return value
}

/**
 * Formata telefone no padrão (00) 00000-0000
 */
export const formatPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, "")
  if (numbers.length <= 11) {
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
  }
  return value
}

/**
 * Formata CEP no padrão 00000-000
 */
export const formatCEP = (value: string): string => {
  const numbers = value.replace(/\D/g, "")
  if (numbers.length <= 8) {
    return numbers.replace(/(\d{5})(\d)/, "$1-$2")
  }
  return value
}
