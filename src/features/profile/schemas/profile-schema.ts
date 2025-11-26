import { z } from 'zod'

// Função auxiliar para validar CPF
function isValidCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '')

  if (cleanCPF.length !== 11) return false

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false

  // Validação dos dígitos verificadores
  let sum = 0
  let remainder: number

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i)
  }

  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false

  sum = 0
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i)
  }

  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false

  return true
}

// Schema de validação do formulário de perfil
export const profileFormSchema = z.object({
  // Campos obrigatórios
  first_name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres')
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),

  last_name: z
    .string()
    .min(2, 'Sobrenome deve ter pelo menos 2 caracteres')
    .max(50, 'Sobrenome deve ter no máximo 50 caracteres')
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, 'Sobrenome deve conter apenas letras'),

  email: z
    .string()
    .email('E-mail inválido')
    .min(5, 'E-mail muito curto')
    .max(100, 'E-mail muito longo')
    .toLowerCase(),

  // Campos opcionais com validação
  username: z
    .string()
    .min(3, 'Nome de usuário deve ter pelo menos 3 caracteres')
    .max(30, 'Nome de usuário deve ter no máximo 30 caracteres')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Nome de usuário deve conter apenas letras, números, _ e -')
    .optional()
    .or(z.literal('')),

  cpf: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true
        return isValidCPF(val)
      },
      { message: 'CPF inválido' }
    )
    .or(z.literal('')),

  date_of_birth: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true
        // Valida formato YYYY-MM-DD ou DD/MM/YYYY
        const dateRegex = /^\d{4}-\d{2}-\d{2}$|^\d{2}\/\d{2}\/\d{4}$/
        if (!dateRegex.test(val)) return false

        // Valida se é uma data válida
        const date = new Date(val.includes('-') ? val : val.split('/').reverse().join('-'))
        return !isNaN(date.getTime())
      },
      { message: 'Data de nascimento inválida' }
    )
    .refine(
      (val) => {
        if (!val || val === '') return true
        const date = new Date(val.includes('-') ? val : val.split('/').reverse().join('-'))
        const today = new Date()
        const age = today.getFullYear() - date.getFullYear()
        return age >= 5 && age <= 120
      },
      { message: 'Idade deve estar entre 5 e 120 anos' }
    )
    .or(z.literal('')),

  gender: z
    .enum(['M', 'F'], {
      message: 'Selecione um gênero válido',
    })
    .optional()
    .or(z.literal('')),

  phone: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true
        const cleanPhone = val.replace(/\D/g, '')
        // Telefone brasileiro: 10 ou 11 dígitos (com DDD)
        return cleanPhone.length >= 10 && cleanPhone.length <= 11
      },
      { message: 'Telefone inválido. Use o formato: (00) 00000-0000' }
    )
    .or(z.literal('')),

  cep: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true
        const cleanCEP = val.replace(/\D/g, '')
        return cleanCEP.length === 8
      },
      { message: 'CEP inválido. Use o formato: 00000-000' }
    )
    .or(z.literal('')),

  country: z
    .string()
    .max(50, 'País deve ter no máximo 50 caracteres')
    .optional()
    .or(z.literal('')),

  state: z
    .string()
    .max(2, 'Estado deve ter 2 caracteres')
    .regex(/^[A-Z]{0,2}$/, 'Estado deve conter apenas letras maiúsculas')
    .optional()
    .or(z.literal('')),

  city: z
    .string()
    .max(50, 'Cidade deve ter no máximo 50 caracteres')
    .optional()
    .or(z.literal('')),

  bio: z
    .string()
    .max(500, 'Biografia deve ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
})

// Tipo inferido do schema
export type ProfileFormData = z.infer<typeof profileFormSchema>
