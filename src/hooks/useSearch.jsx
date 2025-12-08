import { useState, useMemo, useCallback } from 'react'
import { useDebounce } from '../utils/debounce'

/**
 * Hook personalizado para manejar la funcionalidad de búsqueda
 * 🔍 Busca en todos los tipos de elementos de la campaña
 * Optimizado con índice de búsqueda para mejor rendimiento
 */
export function useSearch(campaign) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [activeFilter, setActiveFilter] = useState(null) // null = todas las pestañas

  // Debounce del término de búsqueda para optimizar rendimiento
  const debouncedSearchTerm = useDebounce(searchTerm, 150)

  // Crear índice de búsqueda una sola vez cuando cambia la campaña
  const searchIndex = useMemo(() => {
    const index = new Map()

    const indexEntity = (entities, type) => {
      if (!entities) return

      entities.forEach(entity => {
        // Crear texto de búsqueda combinando todos los campos relevantes
        const searchableText = [
          entity.name,
          entity.title,
          entity.description,
          entity.content,
          entity.class,
          entity.race,
          entity.role,
          entity.location,
          entity.type,
          entity.status
        ].filter(Boolean).join(' ').toLowerCase()

        index.set(`${type}-${entity.id}`, {
          ...entity,
          type,
          searchableText
        })
      })
    }

    // Indexar todas las entidades
    indexEntity(campaign.locations, 'locations')
    indexEntity(campaign.players, 'players')
    indexEntity(campaign.npcs, 'npcs')
    indexEntity(campaign.objects, 'objects')
    indexEntity(campaign.quests, 'quests')
    indexEntity(campaign.notes, 'notes')

    return index
  }, [campaign])

  // Búsqueda optimizada usando el índice
  const searchResults = useMemo(() => {
    if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
      return []
    }

    const searchLower = debouncedSearchTerm.toLowerCase()
    const results = []

    // Buscar en el índice pre-procesado
    for (const [key, item] of searchIndex) {
      // Filtrar por tipo si hay filtro activo
      if (activeFilter && item.type !== activeFilter) {
        continue
      }

      // Buscar en el texto indexado
      if (item.searchableText.includes(searchLower)) {
        results.push(item)

        // Limitar a 10 resultados para mejor performance
        if (results.length >= 10) break
      }
    }

    return results
  }, [searchIndex, debouncedSearchTerm, activeFilter])

  // Funciones para manejar la búsqueda
  const handleSearchChange = (value) => {
    setSearchTerm(value)
    setShowSearchDropdown(!!value)
  }

  const handleSearchFocus = () => {
    if (searchTerm) {
      setShowSearchDropdown(true)
    }
  }

  const handleSearchBlur = (e) => {
    // Delay para permitir clicks en dropdown
    setTimeout(() => {
      if (!e.currentTarget.contains(document.activeElement)) {
        setShowSearchDropdown(false)
      }
    }, 200)
  }

  const closeSearch = () => {
    setSearchTerm('')
    setShowSearchDropdown(false)
  }

  // Función para actualizar el filtro basado en la pestaña activa
  const setFilter = useCallback((tabId) => {
    // Si estamos en dashboard, mostrar todas las secciones (null)
    // Si estamos en una pestaña específica, filtrar por ese tipo
    if (tabId === 'dashboard') {
      setActiveFilter(null)
    } else {
      setActiveFilter(tabId)
    }
  }, [])

  return {
    searchTerm,
    searchResults,
    showSearchDropdown,
    activeFilter,
    handleSearchChange,
    handleSearchFocus,
    handleSearchBlur,
    closeSearch,
    setFilter
  }
}