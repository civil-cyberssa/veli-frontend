// Re-export component directly (avoid barrel export issues)
export { ProfileEditForm } from './components/profile-edit-form'

// Hooks
export { useStudentProfile } from './hooks/use-student-profile'

// Types
export type {
  Language,
  User,
  StudentProfile,
  StudentData,
  UseStudentProfileReturn,
  ProfileFormData,
} from './types'

// Schema and validation
export { profileFormSchema } from './schemas/profile-schema'
export type { ProfileFormData as ProfileFormDataSchema } from './schemas/profile-schema'

// Utils - Formatação
export { formatCPF, formatPhone, formatCEP, formatDate } from './utils/format'
export { cleanCPF, cleanPhone, cleanCEP, cleanDate } from './utils/format'
export { fetchAddressByCEP } from './utils/viacep'
export type { ViaCEPResponse } from './utils/viacep'
