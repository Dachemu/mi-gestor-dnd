import { useState, useCallback, useEffect } from 'react'

/**
 * Hook para implementar funcionalidad undo/redo
 * Soporta atajos de teclado Ctrl+Z (undo) y Ctrl+Y / Ctrl+Shift+Z (redo)
 *
 * @param {*} initialState - Estado inicial
 * @param {number} maxHistory - Máximo número de estados en el historial (default: 50)
 * @returns {object} - { state, setState, undo, redo, canUndo, canRedo, clearHistory }
 */
export function useUndoRedo(initialState, maxHistory = 50) {
  const [history, setHistory] = useState([initialState])
  const [currentIndex, setCurrentIndex] = useState(0)

  const canUndo = currentIndex > 0
  const canRedo = currentIndex < history.length - 1

  // Estado actual
  const state = history[currentIndex]

  /**
   * Establece un nuevo estado y lo añade al historial
   */
  const setState = useCallback((newState) => {
    setHistory(prev => {
      // Eliminar estados futuros si estamos en medio del historial
      const newHistory = prev.slice(0, currentIndex + 1)

      // Añadir nuevo estado
      newHistory.push(newState)

      // Limitar tamaño del historial
      if (newHistory.length > maxHistory) {
        newHistory.shift() // Eliminar el más antiguo
        setCurrentIndex(newHistory.length - 1)
      } else {
        setCurrentIndex(newHistory.length - 1)
      }

      return newHistory
    })
  }, [currentIndex, maxHistory])

  /**
   * Deshacer último cambio
   */
  const undo = useCallback(() => {
    if (canUndo) {
      setCurrentIndex(prev => prev - 1)
    }
  }, [canUndo])

  /**
   * Rehacer cambio deshecho
   */
  const redo = useCallback(() => {
    if (canRedo) {
      setCurrentIndex(prev => prev + 1)
    }
  }, [canRedo])

  /**
   * Limpiar historial y resetear a estado inicial
   */
  const clearHistory = useCallback(() => {
    setHistory([initialState])
    setCurrentIndex(0)
  }, [initialState])

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignorar si el usuario está escribiendo en un input
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable
      ) {
        return
      }

      // Ctrl+Z o Cmd+Z - Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }

      // Ctrl+Y o Cmd+Y o Ctrl+Shift+Z - Redo
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 'y' || (e.key === 'z' && e.shiftKey))
      ) {
        e.preventDefault()
        redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [undo, redo])

  return {
    state,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory
  }
}
