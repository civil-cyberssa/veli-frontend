"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { searchCountries, searchCities, BRAZILIAN_STATES } from "../utils/geodb"
import { useDebounce } from "../hooks/use-debounce"

interface LocationAutocompleteProps {
  type: "country" | "state" | "city"
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  countryCode?: string
  maxLength?: number
}

export function LocationAutocomplete({
  type,
  value,
  onChange,
  placeholder,
  disabled,
  className,
  countryCode = "BR",
  maxLength,
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debouncedValue = useDebounce(value, 300)

  const fetchSuggestions = useCallback(async (searchValue: string) => {
    if (!searchValue || searchValue.length < 2) {
      setSuggestions([])
      return
    }

    setIsLoading(true)

    try {
      if (type === "country") {
        const countries = await searchCountries(searchValue)
        setSuggestions(countries.map((c) => c.name))
      } else if (type === "state") {
        // Para estados brasileiros, usa lista local primeiro
        if (countryCode === "BR") {
          const filtered = BRAZILIAN_STATES
            .filter((state) =>
              state.name.toLowerCase().includes(searchValue.toLowerCase()) ||
              state.code.toLowerCase().includes(searchValue.toLowerCase())
            )
            .map((state) => state.code)
          setSuggestions(filtered)
        }
      } else if (type === "city") {
        const cities = await searchCities(searchValue, countryCode)
        setSuggestions(cities.map((c) => c.name))
      }
    } catch (error) {
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [type, countryCode])

  useEffect(() => {
    if (debouncedValue && showSuggestions) {
      fetchSuggestions(debouncedValue)
    }
  }, [debouncedValue, fetchSuggestions, showSuggestions])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setShowSuggestions(true)
  }

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion)
    setShowSuggestions(false)
    setSuggestions([])
  }

  const handleFocus = () => {
    setShowSuggestions(true)
    if (value && value.length >= 2) {
      fetchSuggestions(value)
    }
  }

  const handleBlur = () => {
    // Delay para permitir clique na sugestão
    setTimeout(() => {
      setShowSuggestions(false)
    }, 200)
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <Input
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={className}
          maxLength={maxLength}
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
              onMouseDown={(e) => {
                e.preventDefault()
                handleSuggestionClick(suggestion)
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
