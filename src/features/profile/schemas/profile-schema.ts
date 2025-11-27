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
  // Campos obrigatórios (apenas os que o usuário DEVE preencher)
  first_name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres')
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),

  last_name: z
    .string()
    .min(1, 'Sobrenome é obrigatório')
    .min(2, 'Sobrenome deve ter pelo menos 2 caracteres')
    .max(50, 'Sobrenome deve ter no máximo 50 caracteres')
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, 'Sobrenome deve conter apenas letras'),

  email: z
    .string()
    .min(1, 'E-mail é obrigatório')
    .email('E-mail inválido')
    .max(100, 'E-mail muito longo')
    .toLowerCase(),

  // Username é auto-gerado, não precisa validação
  username: z.string().optional().or(z.literal('')),

  // Campos opcionais - validam apenas se tiverem conteúdo
  cpf: z
    .string()
    .transform((val) => val?.trim() || '')
    .refine(
      (val) => val === '' || isValidCPF(val),
      { message: 'CPF inválido' }
    ),

  date_of_birth: z
    .string()
    .transform((val) => val?.trim() || '')
    .refine(
      (val) => {
        if (val === '') return true
        const dateRegex = /^\d{4}-\d{2}-\d{2}$|^\d{2}\/\d{2}\/\d{4}$/
        if (!dateRegex.test(val)) return false
        const date = new Date(val.includes('-') ? val : val.split('/').reverse().join('-'))
        return !isNaN(date.getTime())
      },
      { message: 'Data de nascimento inválida' }
    )
    .refine(
      (val) => {
        if (val === '') return true
        const date = new Date(val.includes('-') ? val : val.split('/').reverse().join('-'))
        const today = new Date()
        const age = today.getFullYear() - date.getFullYear()
        return age >= 5 && age <= 120
      },
      { message: 'Idade deve estar entre 5 e 120 anos' }
    ),

  gender: z
    .string()
    .transform((val) => val?.trim() || '')
    .refine(
      (val) => val === '' || val === 'M' || val === 'F',
      { message: 'Gênero deve ser Masculino ou Feminino' }
    ),

  phone: z
    .string()
    .transform((val) => val?.trim() || '')
    .refine(
      (val) => {
        if (val === '') return true
        const cleanPhone = val.replace(/\D/g, '')
        return cleanPhone.length >= 10 && cleanPhone.length <= 11
      },
      { message: 'Telefone inválido. Use o formato: (00) 00000-0000' }
    ),

  cep: z
    .string()
    .transform((val) => val?.trim() || '')
    .refine(
      (val) => {
        if (val === '') return true
        const cleanCEP = val.replace(/\D/g, '')
        return cleanCEP.length === 8
      },
      { message: 'CEP inválido. Use o formato: 00000-000' }
    ),

  country: z
    .string()
    .transform((val) => val?.trim() || '')
    .refine(
      (val) => val === '' || val.length <= 50,
      { message: 'País deve ter no máximo 50 caracteres' }
    ),

  state: z
    .string()
    .transform((val) => val?.trim() || '')
    .refine(
      (val) => val === '' || /^[A-Z]{2}$/.test(val),
      { message: 'Estado deve ter 2 letras maiúsculas (ex: SP)' }
    ),

  city: z
    .string()
    .transform((val) => val?.trim() || '')
    .refine(
      (val) => val === '' || val.length <= 50,
      { message: 'Cidade deve ter no máximo 50 caracteres' }
    ),

  bio: z
    .string()
    .transform((val) => val?.trim() || '')
    .refine(
      (val) => val === '' || val.length <= 500,
      { message: 'Biografia deve ter no máximo 500 caracteres' }
    ),
})

// Tipo inferido do schema
export type ProfileFormData = z.infer<typeof profileFormSchema>
