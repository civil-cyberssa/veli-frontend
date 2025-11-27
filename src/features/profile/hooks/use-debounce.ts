import { useState, useEffect } from 'react'

/**
 * Hook para debounce de valores
 * Útil para evitar chamadas excessivas à API durante digitação
 *
 * @param value Valor a ser debounced
 * @param delay Delay em milissegundos (padrão: 500ms)
 * @returns Valor debounced
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Define um timeout para atualizar o valor debounced
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Limpa o timeout se o valor mudar antes do delay
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
