import { useState, useEffect } from 'react'

/**
 * Debounce a value by delay ms
 * @param {any} value
 * @param {number} delay
 * @returns {any} debounced value
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
