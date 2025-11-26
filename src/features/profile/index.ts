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

// Utils
export { formatCPF, formatPhone, formatCEP } from './utils/format'
export { fetchAddressByCEP } from './utils/viacep'
export type { ViaCEPResponse } from './utils/viacep'
