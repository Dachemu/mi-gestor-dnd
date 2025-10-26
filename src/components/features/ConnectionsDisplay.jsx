import React from 'react'

// Configuración de tipos con iconos y colores
const CONNECTION_TYPES = {
  locations: { name: 'Lugares', icon: '📍', color: '#3b82f6' },
  players: { name: 'Jugadores', icon: '👥', color: '#10b981' },
  npcs: { name: 'NPCs', icon: '🧙', color: '#4f46e5' },
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
        border: '1px solid rgba(79, 70, 229, 0.2)',
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
            background: 'rgba(79, 70, 229, 0.2)',
            border: '1px solid rgba(79, 70, 229, 0.3)',
            borderRadius: '8px',
            color: '#6366f1',
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
    <div className="connections-container">
      {/* Header compacto con título y botón */}
      <div className="connections-header">
        <h4 className="connections-title">
          🔗 Conexiones ({totalConnections})
        </h4>
        <button
          onClick={() => onOpenConnectionModal(item, itemType)}
          className="connect-btn"
        >
          ➕
        </button>
      </div>

      {/* Grid compacto de conexiones */}
      <div className="connections-grid">
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

      {/* Estilos CSS-in-JS para diseño compacto */}
      <style jsx>{`
        .connections-container {
          background: rgba(31, 41, 55, 0.3);
          border: 1px solid rgba(79, 70, 229, 0.2);
          border-radius: 12px;
          padding: 1rem;
        }

        .connections-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(79, 70, 229, 0.1);
        }

        .connections-title {
          color: white;
          font-size: 0.95rem;
          font-weight: 600;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .connect-btn {
          background: rgba(79, 70, 229, 0.2);
          border: 1px solid rgba(79, 70, 229, 0.3);
          border-radius: 6px;
          color: #6366f1;
          padding: 0.4rem 0.6rem;
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .connect-btn:hover {
          background: rgba(79, 70, 229, 0.3);
        }

        .connections-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.75rem;
        }

        @media (max-width: 768px) {
          .connections-grid {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }

          .connections-container {
            padding: 0.75rem;
          }

          .connections-title {
            font-size: 0.85rem;
          }

          .connect-btn {
            padding: 0.3rem 0.5rem;
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  )
}

// Sección para mostrar conexiones de un tipo específico - VERSION COMPACTA
function ConnectionTypeSection({ _type, config, items, onRemove, onNavigate }) {
  // Estado para controlar la expansión de conexiones
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  // Limitar a mostrar máximo 3 elementos para compactación
  const maxItems = 3;
  const displayItems = isExpanded ? items : items.slice(0, maxItems);
  const hasMore = items.length > maxItems;

  return (
    <div className="connection-type-section">
      {/* Header compacto del tipo */}
      <div className="connection-type-header">
        <span className="connection-type-icon">{config.icon}</span>
        <h5 className="connection-type-title" style={{ color: config.color }}>
          {config.name} ({items.length})
        </h5>
      </div>

      {/* Lista compacta de elementos conectados */}
      <div className="connection-items">
        {displayItems.map(connectedItem => (
          <ConnectionItem
            key={connectedItem.id}
            item={connectedItem}
            config={config}
            onRemove={() => onRemove(connectedItem)}
            onNavigate={() => onNavigate(connectedItem)}
            compact={true}
          />
        ))}
        {hasMore && !isExpanded && (
          <div 
            className="connection-more clickable"
            onClick={() => setIsExpanded(true)}
            title="Click para ver todas las conexiones"
          >
            + {items.length - maxItems} más...
          </div>
        )}
        {isExpanded && hasMore && (
          <div 
            className="connection-more clickable"
            onClick={() => setIsExpanded(false)}
            title="Click para ocultar conexiones adicionales"
          >
            ▲ Mostrar menos
          </div>
        )}
      </div>

      {/* Estilos para la sección compacta */}
      <style jsx>{`
        .connection-type-section {
          background: rgba(31, 41, 55, 0.4);
          border: 1px solid rgba(79, 70, 229, 0.15);
          border-radius: 8px;
          padding: 0.75rem;
        }

        .connection-type-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(79, 70, 229, 0.08);
        }

        .connection-type-icon {
          font-size: 1rem;
        }

        .connection-type-title {
          font-size: 0.85rem;
          font-weight: 600;
          margin: 0;
        }

        .connection-items {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .connection-more {
          font-size: 0.75rem;
          color: #4f46e5;
          text-align: center;
          padding: 0.25rem;
          background: rgba(79, 70, 229, 0.1);
          border-radius: 4px;
          font-weight: 500;
        }

        .connection-more.clickable {
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid rgba(79, 70, 229, 0.2);
        }

        .connection-more.clickable:hover {
          background: rgba(79, 70, 229, 0.2);
          color: #6366f1;
          transform: translateY(-1px);
          border-color: rgba(79, 70, 229, 0.4);
        }

        .connection-more.clickable:active {
          transform: translateY(0);
        }

        @media (max-width: 768px) {
          .connection-type-section {
            padding: 0.5rem;
          }

          .connection-type-header {
            margin-bottom: 0.5rem;
          }

          .connection-type-title {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  )
}

// Item individual de conexión - VERSION COMPACTA
function ConnectionItem({ item, config, onRemove, onNavigate, _compact = false }) {
  const displayName = item.name || item.title || 'Sin nombre';
  const displayDetail = item.role || item.class || item.status || item.type;
  
  return (
    <div 
      className="connection-item"
      onClick={onNavigate}
      onMouseEnter={(e) => {
        // Cambiar color de todo el texto al hacer hover
        const nameElement = e.currentTarget.querySelector('.connection-item-name')
        const detailElement = e.currentTarget.querySelector('.connection-item-detail')
        if (nameElement) nameElement.style.color = config.color
        if (detailElement) detailElement.style.color = config.color
      }}
      onMouseLeave={(e) => {
        // Restaurar colores originales
        const nameElement = e.currentTarget.querySelector('.connection-item-name')
        const detailElement = e.currentTarget.querySelector('.connection-item-detail')
        if (nameElement) nameElement.style.color = 'white'
        if (detailElement) detailElement.style.color = '#9ca3af'
      }}
    >
      {/* Icono del elemento */}
      <span className="connection-item-icon">
        {item.icon || item.avatar || config.icon}
      </span>

      {/* Información del elemento */}
      <div className="connection-item-info">
        <div className="connection-item-name">
          {displayName}
        </div>
        {displayDetail && (
          <div className="connection-item-detail">
            {displayDetail}
          </div>
        )}
      </div>

      {/* Botón compacto para eliminar conexión */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        className="connection-item-remove"
        title="Eliminar conexión"
      >
        ✕
      </button>

      {/* Estilos para el item compacto */}
      <style jsx>{`
        .connection-item {
          background: rgba(31, 41, 55, 0.5);
          border: 1px solid rgba(79, 70, 229, 0.08);
          border-radius: 6px;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .connection-item:hover {
          background: rgba(79, 70, 229, 0.1);
          border-color: rgba(79, 70, 229, 0.2);
          transform: translateY(-1px);
        }

        .connection-item-icon {
          font-size: 1rem;
          flex-shrink: 0;
        }

        .connection-item-info {
          flex: 1;
          transition: color 0.2s ease;
          min-width: 0;
        }

        .connection-item-name {
          color: white;
          font-weight: 600;
          font-size: 0.8rem;
          margin-bottom: 0.1rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .connection-item-detail {
          color: #9ca3af;
          font-size: 0.7rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .connection-item-remove {
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 4px;
          color: #ef4444;
          padding: 0.2rem;
          cursor: pointer;
          font-size: 0.6rem;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .connection-item-remove:hover {
          background: rgba(239, 68, 68, 0.3);
          transform: scale(1.1);
        }

        @media (max-width: 768px) {
          .connection-item {
            padding: 0.4rem;
            gap: 0.4rem;
          }

          .connection-item-icon {
            font-size: 0.9rem;
          }

          .connection-item-name {
            font-size: 0.75rem;
          }

          .connection-item-detail {
            font-size: 0.65rem;
          }

          .connection-item-remove {
            width: 16px;
            height: 16px;
            font-size: 0.55rem;
          }
        }
      `}</style>
    </div>
  )
}

export default React.memo(ConnectionsDisplay)