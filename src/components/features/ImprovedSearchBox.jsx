import React, { useRef, useEffect } from 'react'
import { Search as SearchIcon } from 'lucide-react'
import { BaseInput } from '../ui/base'
import SearchDropdown from './GlobalSearchDropdown'
import styles from '../../pages/CampaignDashboard.module.css'

/**
 * SearchBox mejorado con mejor manejo de eventos
 * Soluciona el problema del dropdown que no se cierra
 */
export function ImprovedSearchBox({ search, navigateToItem }) {
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
    if (search.searchTerm && search.searchTerm.length >= 2) {
      search.handleSearchFocus()
    }
  }

  const handleChange = (e) => {
    const value = e.target.value
    search.handleSearchChange(value)
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
        placeholder="Buscar..."
        value={search.searchTerm}
        onChange={handleChange}
        onFocus={handleFocus}
        icon={<SearchIcon size={16} />}
        aria-label="Buscar en la campaña"
        className={styles.searchInput}
        autoComplete="off"
      />
      
      {search.showSearchDropdown && search.searchResults.length > 0 && (
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