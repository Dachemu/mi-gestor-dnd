import React from 'react'

// Configuración de tipos para mostrar conexiones
const CONNECTION_TYPES = {
  locations: { name: 'Lugares', icon: '📍', color: '#3b82f6' },
  players: { name: 'Jugadores', icon: '👥', color: '#10b981' },
  npcs: { name: 'NPCs', icon: '🧙', color: '#8b5cf6' },
  quests: { name: 'Misiones', icon: '📜', color: '#f59e0b' },
  objects: { name: 'Objetos', icon: '📦', color: '#06b6d4' },
  notes: { name: 'Notas', icon: '📝', color: '#3b82f6' }
}

function ConnectionsDisplay({ 
  item, 
  itemType,
  linkedItems, 
  onRemoveConnection,
  onOpenConnectionModal 
}) {
  
  // ✅ Protección: verificar que linkedItems existe y es un objeto
  const safeLinkedItems = linkedItems && typeof linkedItems === 'object' ? linkedItems : {}
  
  // Contar total de conexiones de forma segura
  const totalConnections = Object.values(safeLinkedItems).reduce((total, items) => {
    // ✅ Verificar que items sea un array
    if (!Array.isArray(items)) return total
    return total + items.length
  }, 0)

  if (totalConnections === 0) {
    return (
      <div style={{
        background: 'rgba(31, 41, 55, 0.3)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        borderRadius: '12px',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔗</div>
        <h4 style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
          Sin conexiones
        </h4>
        <p style={{ color: 'var(--text-disabled)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Este elemento no está conectado con otros elementos de la campaña.
        </p>
        <button
          onClick={() => onOpenConnectionModal(item, itemType)}
          className="btn-primary"
          style={{ fontSize: '0.9rem' }}
        >
          🔗 Crear conexiones
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Header con estadísticas */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h4 style={{ 
          color: 'white', 
          fontSize: '1.2rem', 
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          🔗 Conexiones ({totalConnections})
        </h4>
        
        <button
          onClick={() => onOpenConnectionModal(item, itemType)}
          style={{
            background: 'rgba(139, 92, 246, 0.2)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '8px',
            color: '#8b5cf6',
            padding: '0.5rem 0.75rem',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
        >
          ✏️ Gestionar
        </button>
      </div>

      {/* Lista de conexiones por tipo */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {Object.entries(safeLinkedItems).map(([connectionType, connectedItems]) => {
          // ✅ Verificar que connectedItems sea un array y tenga elementos
          if (!Array.isArray(connectedItems) || connectedItems.length === 0) return null

          const config = CONNECTION_TYPES[connectionType]
          // ✅ Verificar que config existe
          if (!config) return null
          
          return (
            <ConnectionTypeSection
              key={connectionType}
              type={connectionType}
              config={config}
              items={connectedItems}
              onRemove={(connectedItem) => onRemoveConnection(item, itemType, connectedItem, connectionType)}
            />
          )
        })}
      </div>
    </div>
  )
}

// Sección para mostrar conexiones de un tipo específico
function ConnectionTypeSection({ type, config, items, onRemove }) {
  return (
    <div style={{
      background: 'rgba(31, 41, 55, 0.3)',
      border: '1px solid rgba(139, 92, 246, 0.2)',
      borderRadius: '12px',
      padding: '1rem'
    }}>
      {/* Header del tipo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid rgba(139, 92, 246, 0.1)'
      }}>
        <span style={{ fontSize: '1.2rem' }}>{config.icon}</span>
        <h5 style={{ 
          color: config.color, 
          fontSize: '1rem', 
          fontWeight: '600',
          margin: 0
        }}>
          {config.name} ({items.length})
        </h5>
      </div>

      {/* Lista de elementos conectados */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {items.map(connectedItem => (
          <ConnectionItem
            key={connectedItem.id}
            item={connectedItem}
            config={config}
            onRemove={() => onRemove(connectedItem)}
          />
        ))}
      </div>
    </div>
  )
}

// Item individual de conexión
function ConnectionItem({ item, config, onRemove }) {
  return (
    <div style={{
      background: 'rgba(31, 41, 55, 0.4)',
      border: '1px solid rgba(139, 92, 246, 0.1)',
      borderRadius: '8px',
      padding: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      transition: 'all 0.2s ease'
    }}>
      {/* Icono del elemento */}
      <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>
        {item.icon || config.icon}
      </span>

      {/* Información del elemento */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h6 style={{ 
          color: 'white', 
          fontSize: '0.9rem', 
          fontWeight: '600',
          margin: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {item.name || item.title}
        </h6>
        
        {/* Mostrar información adicional según el tipo */}
        {renderItemDetails(item)}
      </div>

      {/* Botón para eliminar conexión */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          if (window.confirm(`¿Desconectar "${item.name || item.title}"?`)) {
            onRemove()
          }
        }}
        style={{
          background: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '6px',
          color: '#ef4444',
          padding: '0.25rem',
          cursor: 'pointer',
          fontSize: '0.8rem',
          flexShrink: 0,
          opacity: 0.7,
          transition: 'opacity 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.opacity = 1}
        onMouseLeave={(e) => e.target.style.opacity = 0.7}
      >
        🗑️
      </button>
    </div>
  )
}

// Renderizar detalles específicos según el tipo de elemento
function renderItemDetails(item) {
  // ✅ Protección: verificar que item existe
  if (!item || typeof item !== 'object') return null

  // Para NPCs, mostrar actitud
  if (item.attitude) {
    const attitudeColors = {
      'Amistoso': '#10b981',
      'Neutral': '#f59e0b',
      'Hostil': '#ef4444'
    }
    
    return (
      <span style={{
        background: `${attitudeColors[item.attitude] || '#6b7280'}20`,
        color: attitudeColors[item.attitude] || '#6b7280',
        padding: '0.125rem 0.375rem',
        borderRadius: '8px',
        fontSize: '0.7rem',
        fontWeight: '600'
      }}>
        {item.attitude}
      </span>
    )
  }

  // Para misiones, mostrar estado
  if (item.status) {
    const statusColors = {
      'Pendiente': '#f59e0b',
      'En progreso': '#3b82f6',
      'Completada': '#10b981'
    }
    
    return (
      <span style={{
        background: `${statusColors[item.status] || '#6b7280'}20`,
        color: statusColors[item.status] || '#6b7280',
        padding: '0.125rem 0.375rem',
        borderRadius: '8px',
        fontSize: '0.7rem',
        fontWeight: '600'
      }}>
        {item.status}
      </span>
    )
  }

  // Para lugares, mostrar tipo
  if (item.type) {
    return (
      <span style={{
        color: 'var(--text-muted)',
        fontSize: '0.75rem'
      }}>
        {item.type}
      </span>
    )
  }

  // Para objetos, mostrar rareza
  if (item.rarity) {
    const rarityColors = {
      'Común': '#6b7280',
      'Poco común': '#10b981',
      'Raro': '#3b82f6',
      'Épico': '#8b5cf6',
      'Legendario': '#f59e0b',
      'Artefacto': '#ef4444'
    }
    
    return (
      <span style={{
        background: `${rarityColors[item.rarity] || '#6b7280'}20`,
        color: rarityColors[item.rarity] || '#6b7280',
        padding: '0.125rem 0.375rem',
        borderRadius: '8px',
        fontSize: '0.7rem',
        fontWeight: '600'
      }}>
        {item.rarity}
      </span>
    )
  }

  // Para notas, mostrar categoría
  if (item.category) {
    return (
      <span style={{
        color: 'var(--text-muted)',
        fontSize: '0.75rem'
      }}>
        {item.category}
      </span>
    )
  }

  // Default: mostrar descripción truncada
  if (item.description) {
    return (
      <p style={{ 
        color: 'var(--text-muted)', 
        fontSize: '0.75rem',
        margin: '0.25rem 0 0 0',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {item.description}
      </p>
    )
  }

  return null
}

export default ConnectionsDisplay