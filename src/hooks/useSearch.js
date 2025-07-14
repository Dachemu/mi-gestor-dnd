import { useState, useMemo } from 'react'

/**
 * Hook personalizado para manejar la funcionalidad de búsqueda
 * 🔍 Busca en todos los tipos de elementos de la campaña
 */
export function useSearch(campaign) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)

  // Función que realiza la búsqueda en todos los elementos
  const searchResults = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) {
      return []
    }

    const results = []
    const searchLower = searchTerm.toLowerCase()

    // Buscar en lugares
    if (campaign.locations) {
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
    if (campaign.players) {
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
    if (campaign.npcs) {
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
    if (campaign.objects) {
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
    if (campaign.quests) {
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
    if (campaign.notes) {
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
  }, [campaign, searchTerm])

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

  return {
    searchTerm,
    searchResults,
    showSearchDropdown,
    handleSearchChange,
    handleSearchFocus,
    handleSearchBlur,
    closeSearch
  }
}