export type LanguageInfo = {
  name?: string
  code?: string
  short_name?: string
  flag?: string
  flag_icon?: string
  icon?: string
}

export type LanguageCarrier = {
  language?: LanguageInfo
  language_flag?: string
  language_icon?: string
  language_code?: string
  module?: LanguageCarrier & { name?: string }
  name?: string
}

const isTwoLetterCode = (value: string) => /^[A-Za-z]{2}$/.test(value)

export const getFlagFromCountryCode = (code?: string): string => {
  if (!code) return ""
  const normalized = code.trim().toUpperCase()

  if (isTwoLetterCode(normalized)) {
    const [first, second] = normalized
    const base = 127397
    return String.fromCodePoint(first.charCodeAt(0) + base) + String.fromCodePoint(second.charCodeAt(0) + base)
  }

  return ""
}

const normalizeFlagValue = (flag?: string): string => {
  if (!flag) return ""

  const trimmed = flag.trim()

  if (isTwoLetterCode(trimmed)) {
    const codeFlag = getFlagFromCountryCode(trimmed)
    if (codeFlag) return codeFlag
  }

  return trimmed
}

// Map course names to country flags
export const getFlagFromCourseName = (courseName: string): string => {
  const lowerCourseName = courseName.toLowerCase()

  if (lowerCourseName.includes('francês') || lowerCourseName.includes('frances')) return '🇫🇷'
  if (lowerCourseName.includes('inglês') || lowerCourseName.includes('ingles') || lowerCourseName.includes('english')) return '🇬🇧'
  if (lowerCourseName.includes('espanhol') || lowerCourseName.includes('spanish')) return '🇪🇸'
  if (lowerCourseName.includes('alemão') || lowerCourseName.includes('alemao') || lowerCourseName.includes('german')) return '🇩🇪'
  if (lowerCourseName.includes('italiano') || lowerCourseName.includes('italian')) return '🇮🇹'
  if (lowerCourseName.includes('português') || lowerCourseName.includes('portugues') || lowerCourseName.includes('portuguese')) return '🇵🇹'
  if (lowerCourseName.includes('japonês') || lowerCourseName.includes('japones') || lowerCourseName.includes('japanese')) return '🇯🇵'
  if (lowerCourseName.includes('chinês') || lowerCourseName.includes('chines') || lowerCourseName.includes('chinese')) return '🇨🇳'
  if (lowerCourseName.includes('coreano') || lowerCourseName.includes('korean')) return '🇰🇷'

  return ''
}

export const getFlagFromLanguageMetadata = (event?: LanguageCarrier) => {
  if (!event) return ""

  const languageCandidates = [event.language, event.module?.language]

  for (const source of languageCandidates) {
    const directFlag = normalizeFlagValue(source?.flag || source?.flag_icon || source?.icon)
    if (directFlag) return directFlag

    const codeFlag = getFlagFromCountryCode(source?.code || source?.short_name)
    if (codeFlag) return codeFlag
  }

  const directEventFlag = normalizeFlagValue(
    event.language_flag ||
      event.language_icon ||
      event.module?.language_flag ||
      event.module?.language_icon
  )
  if (directEventFlag) return directEventFlag

  const codeFlag = getFlagFromCountryCode(event.language_code || event.module?.language_code)
  if (codeFlag) return codeFlag

  const nameFallback = event.language?.name || event.module?.language?.name || event.module?.name
  return nameFallback ? getFlagFromCourseName(nameFallback) : ""
}
