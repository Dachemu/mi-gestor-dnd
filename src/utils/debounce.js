import { useState, useEffect } from 'react'

/**
 * Utilidad para crear funciones debounced
 * Retrasa la ejecución de una función hasta que hayan pasado `delay` ms
 * desde la última vez que fue invocada
 */
export function debounce(func, delay) {
  let timeoutId
  
  return function debounced(...args) {
    // Cancelar el timeout anterior
    clearTimeout(timeoutId)
    
    // Programar nueva ejecución
    timeoutId = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

/**
 * Hook para crear una versión debounced de un valor
 */

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}