import React from 'react'

/**
 * Componente que muestra los resultados de búsqueda en un dropdown
 * 🔍 Migrado desde el archivo HTML original
 */
function SearchDropdown({ searchTerm, results, onItemClick, onClose }) {
  // Si no hay término de búsqueda o resultados, no mostrar nada
  if (!searchTerm || results.length === 0) return null

  // Función para obtener el icono apropiado según el tipo
  const getTypeIcon = (type) => {
    const icons = {
      'locations': '📍',
      'players': '👥', 
      'npcs': '🧙',
      'objects': '📦',
      'quests': '📜',
      'notes': '📝'
    }
    return icons[type] || '📋'
  }

  // Función para obtener el nombre del tipo en español
  const getTypeName = (type) => {
    const names = {
      'locations': 'LUGAR',
      'players': 'JUGADOR', 
      'npcs': 'NPC',
      'objects': 'OBJETO',
      'quests': 'MISIÓN',
      'notes': 'NOTA'
    }
    return names[type] || 'ELEMENTO'
  }

  return (
    <div className="search-dropdown">
      {results.map(result => (
        <div
          key={`${result.type}-${result.id}`}
          className="search-result-item"
          onClick={() => {
            onItemClick(result, result.type)
            onClose()
          }}
        >
          {/* Icono del elemento */}
          <span style={{ fontSize: '1.5rem' }}>
            {result.icon || result.avatar || getTypeIcon(result.type)}
          </span>
          
          {/* Información del elemento */}
          <div style={{ flex: 1 }}>
            <p style={{ 
              color: 'white', 
              fontWeight: '600',
              margin: 0,
              fontSize: '0.95rem',
              lineHeight: '1.4',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale'
            }}>
              {result.name || result.title}
            </p>
            <p style={{ 
              color: '#a1a1aa', 
              fontSize: '0.8rem',
              margin: 0,
              lineHeight: '1.3',
              fontWeight: '400',
              WebkitFontSmoothing: 'antialiased'
            }}>
              {result.role || result.class || result.status || result.type}
            </p>
          </div>
          
          {/* Etiqueta del tipo */}
          <span className="search-result-type">
            {getTypeName(result.type)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default SearchDropdown