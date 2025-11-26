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

/**
 * Formata data no padrão DD/MM/YYYY
 */
export const formatDate = (value: string): string => {
  const numbers = value.replace(/\D/g, "")
  if (numbers.length <= 8) {
    return numbers
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{2})(\d)/, "$1/$2")
  }
  return value
}

/**
 * Remove formatação do CPF (retorna apenas números)
 */
export const cleanCPF = (value: string): string => {
  return value.replace(/\D/g, "")
}

/**
 * Remove formatação do telefone (retorna apenas números)
 */
export const cleanPhone = (value: string): string => {
  return value.replace(/\D/g, "")
}

/**
 * Remove formatação do CEP (retorna apenas números)
 */
export const cleanCEP = (value: string): string => {
  return value.replace(/\D/g, "")
}

/**
 * Remove formatação da data e converte DD/MM/YYYY para YYYY-MM-DD
 */
export const cleanDate = (value: string): string => {
  // Remove formatação e converte DD/MM/YYYY para YYYY-MM-DD
  const numbers = value.replace(/\D/g, "")
  if (numbers.length === 8) {
    const day = numbers.substring(0, 2)
    const month = numbers.substring(2, 4)
    const year = numbers.substring(4, 8)
    return `${year}-${month}-${day}`
  }
  // Se já estiver no formato YYYY-MM-DD, retorna como está
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }
  return value
}
