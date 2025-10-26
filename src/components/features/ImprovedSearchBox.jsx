import React, { useRef, useEffect } from 'react'
import { Search as SearchIcon } from 'lucide-react'
import BaseInput from '../ui/base/BaseInput'
import SearchDropdown from './GlobalSearchDropdown'
import styles from '../../pages/CampaignDashboard.module.css'

/**
 * SearchBox mejorado con mejor manejo de eventos
 * Soluciona el problema del dropdown que no se cierra
 */
export function ImprovedSearchBox({ search, navigateToItem, activeTab = 'dashboard' }) {
  const searchBoxRef = useRef(null)

  // Manejar clicks fuera del componente
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        search.closeSearch()
      }
    }

    // Solo agregar listener si el dropdown está visible
    if (search.showSearchDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('focusin', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('focusin', handleClickOutside)
    }
  }, [search.showSearchDropdown, search])

  // Manejar tecla Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && search.showSearchDropdown) {
        search.closeSearch()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [search.showSearchDropdown, search])

  const handleFocus = () => {
    if (search.searchTerm && search.searchTerm.length >= 1) {
      search.handleSearchFocus()
    }
  }

  const handleChange = (e) => {
    const value = e.target.value
    search.handleSearchChange(value)
  }

  // Determinar si debemos mostrar el dropdown
  // Simplificado: mostrar si hay término de búsqueda de 2+ caracteres
  const shouldShowDropdown = search.searchTerm && search.searchTerm.length >= 2

  // Placeholder dinámico según la pestaña
  const getPlaceholder = () => {
    if (activeTab === 'dashboard') {
      return 'Buscar en toda la campaña...'
    }
    const tabNames = {
      'locations': 'Buscar en lugares...',
      'players': 'Buscar en jugadores...',
      'npcs': 'Buscar en NPCs...',
      'objects': 'Buscar en objetos...',
      'quests': 'Buscar en misiones...',
      'notes': 'Buscar en notas...'
    }
    return tabNames[activeTab] || 'Buscar...'
  }

  const handleItemClick = (item, itemType) => {
    navigateToItem(item, itemType)
    search.closeSearch()
  }

  return (
    <div ref={searchBoxRef} className={styles.searchBox}>
      <BaseInput
        type="text"
        size="sm"
        placeholder={getPlaceholder()}
        value={search.searchTerm}
        onChange={handleChange}
        onFocus={handleFocus}
        icon={<SearchIcon size={16} />}
        aria-label={`Buscar en ${activeTab === 'dashboard' ? 'la campaña' : 'la sección actual'}`}
        className={styles.searchInput}
        autoComplete="off"
      />
      
      {shouldShowDropdown && (
        <SearchDropdown
          searchTerm={search.searchTerm}
          results={search.searchResults}
          onItemClick={handleItemClick}
          onClose={search.closeSearch}
        />
      )}
    </div>
  )
}