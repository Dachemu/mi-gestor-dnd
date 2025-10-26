import { useState, useMemo, useCallback } from 'react'
import { useDebounce } from '../utils/debounce'

/**
 * Hook personalizado para manejar la funcionalidad de búsqueda
 * 🔍 Busca en todos los tipos de elementos de la campaña
 * Soporta filtrado por tipo de entidad según la pestaña activa
 */
export function useSearch(campaign) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [activeFilter, setActiveFilter] = useState(null) // null = todas las pestañas

  // Debounce del término de búsqueda para optimizar rendimiento
  const debouncedSearchTerm = useDebounce(searchTerm, 150)

  // Función que realiza la búsqueda en todos los elementos o filtrada por tipo
  const searchResults = useMemo(() => {
    if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
      return []
    }

    const results = []
    const searchLower = debouncedSearchTerm.toLowerCase()

    // Si hay un filtro activo (pestaña específica), solo buscar en ese tipo
    const shouldSearchType = (type) => {
      return !activeFilter || activeFilter === type
    }

    // Buscar en lugares
    if (shouldSearchType('locations') && campaign.locations) {
      campaign.locations.forEach(location => {
        if (location.name?.toLowerCase().includes(searchLower) ||
            location.description?.toLowerCase().includes(searchLower)) {
          results.push({
            ...location,
            type: 'locations'
          })
        }
      })
    }

    // Buscar en jugadores
    if (shouldSearchType('players') && campaign.players) {
      campaign.players.forEach(player => {
        if (player.name?.toLowerCase().includes(searchLower) ||
            player.class?.toLowerCase().includes(searchLower) ||
            player.race?.toLowerCase().includes(searchLower)) {
          results.push({
            ...player,
            type: 'players'
          })
        }
      })
    }

    // Buscar en NPCs
    if (shouldSearchType('npcs') && campaign.npcs) {
      campaign.npcs.forEach(npc => {
        if (npc.name?.toLowerCase().includes(searchLower) ||
            npc.role?.toLowerCase().includes(searchLower) ||
            npc.location?.toLowerCase().includes(searchLower)) {
          results.push({
            ...npc,
            type: 'npcs'
          })
        }
      })
    }

    // Buscar en objetos
    if (shouldSearchType('objects') && campaign.objects) {
      campaign.objects.forEach(object => {
        if (object.name?.toLowerCase().includes(searchLower) ||
            object.type?.toLowerCase().includes(searchLower) ||
            object.description?.toLowerCase().includes(searchLower)) {
          results.push({
            ...object,
            type: 'objects'
          })
        }
      })
    }

    // Buscar en misiones
    if (shouldSearchType('quests') && campaign.quests) {
      campaign.quests.forEach(quest => {
        if (quest.title?.toLowerCase().includes(searchLower) ||
            quest.description?.toLowerCase().includes(searchLower) ||
            quest.status?.toLowerCase().includes(searchLower)) {
          results.push({
            ...quest,
            type: 'quests'
          })
        }
      })
    }

    // Buscar en notas
    if (shouldSearchType('notes') && campaign.notes) {
      campaign.notes.forEach(note => {
        if (note.title?.toLowerCase().includes(searchLower) ||
            note.content?.toLowerCase().includes(searchLower)) {
          results.push({
            ...note,
            type: 'notes'
          })
        }
      })
    }

    // Limitar resultados a los primeros 10 para mejor performance
    return results.slice(0, 10)
  }, [campaign, debouncedSearchTerm, activeFilter])

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