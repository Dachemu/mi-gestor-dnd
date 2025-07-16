import React from 'react'

// Configuración de tipos con iconos y colores
const CONNECTION_TYPES = {
  locations: { name: 'Lugares', icon: '📍', color: '#3b82f6' },
  players: { name: 'Jugadores', icon: '👥', color: '#10b981' },
  npcs: { name: 'NPCs', icon: '🧙', color: '#8b5cf6' },
  quests: { name: 'Misiones', icon: '📜', color: '#f59e0b' },
  objects: { name: 'Objetos', icon: '📦', color: '#06b6d4' },
  notes: { name: 'Notas', icon: '📝', color: '#ec4899' }
}

/**
 * Componente para mostrar y navegar entre conexiones de elementos
 * ✨ NUEVO: Incluye navegación al hacer clic en elementos conectados
 */
function ConnectionsDisplay({ 
  item, 
  itemType, 
  linkedItems = {}, 
  onRemoveConnection, 
  onOpenConnectionModal,
  onNavigateToItem // ✨ NUEVA función para navegación
}) {
  // Contar total de conexiones
  const totalConnections = Object.values(linkedItems).reduce((total, items) => {
    return total + (Array.isArray(items) ? items.length : 0)
  }, 0)

  // Si no hay conexiones, mostrar mensaje con botón para conectar
  if (totalConnections === 0) {
    return (
      <div style={{
        background: 'rgba(31, 41, 55, 0.3)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        borderRadius: '12px',
        padding: '1.5rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.6 }}>
          🔗
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Sin conexiones aún
        </p>
        <button
          onClick={() => onOpenConnectionModal(item, itemType)}
          style={{
            background: 'rgba(139, 92, 246, 0.2)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '8px',
            color: '#a78bfa',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}
        >
          ➕ Conectar elementos
        </button>
      </div>
    )
  }

  return (
    <div style={{
      background: 'rgba(31, 41, 55, 0.3)',
      border: '1px solid rgba(139, 92, 246, 0.2)',
      borderRadius: '12px',
      padding: '1.5rem'
    }}>
      {/* Header con título y botón para agregar conexiones */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid rgba(139, 92, 246, 0.1)'
      }}>
        <h4 style={{ 
          color: 'white', 
          fontSize: '1.1rem', 
          fontWeight: '600',
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
            color: '#a78bfa',
            padding: '0.5rem 0.75rem',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: '600'
          }}
        >
          ➕ Conectar
        </button>
      </div>

      {/* Secciones por tipo de conexión */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {Object.entries(CONNECTION_TYPES).map(([type, config]) => {
          const connectedItems = linkedItems[type] || []
          
          if (connectedItems.length === 0) return null

          return (
            <ConnectionTypeSection
              key={type}
              type={type}
              config={config}
              items={connectedItems}
              onRemove={(connectedItem) => onRemoveConnection(item, itemType, connectedItem, type)}
              onNavigate={(connectedItem) => onNavigateToItem && onNavigateToItem(connectedItem, type)}
            />
          )
        })}
      </div>
    </div>
  )
}

// Sección para mostrar conexiones de un tipo específico
function ConnectionTypeSection({ type, config, items, onRemove, onNavigate }) {
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
            onNavigate={() => onNavigate(connectedItem)}
          />
        ))}
      </div>
    </div>
  )
}

// Item individual de conexión - ✨ MEJORADO con navegación
function ConnectionItem({ item, config, onRemove, onNavigate }) {
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
        {item.icon || item.avatar || config.icon}
      </span>

      {/* Información del elemento - ✨ CLICKEABLE para navegar */}
      <div 
        onClick={onNavigate}
        style={{ 
          flex: 1,
          cursor: 'pointer',
          transition: 'color 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = config.color
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'white'
        }}
      >
        <div style={{ 
          color: 'white', 
          fontWeight: '600',
          fontSize: '0.9rem',
          marginBottom: '0.25rem'
        }}>
          {item.name || item.title}
        </div>
        <div style={{ 
          color: 'var(--text-muted)', 
          fontSize: '0.8rem'
        }}>
          {item.role || item.class || item.status || item.type || 'Ver detalles →'}
        </div>
      </div>

      {/* Botón para eliminar conexión */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        style={{
          background: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '6px',
          color: '#ef4444',
          padding: '0.25rem',
          cursor: 'pointer',
          fontSize: '0.7rem',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
        title="Eliminar conexión"
      >
        ✕
      </button>
    </div>
  )
}

export default React.memo(ConnectionsDisplay)