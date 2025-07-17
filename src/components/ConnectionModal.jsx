import React, { useState, useEffect, useCallback } from 'react'
import Modal from './Modal'

// Configuración de tipos disponibles para conexiones
const CONNECTION_TYPES = {
  locations: { name: 'Lugares', icon: '📍', color: '#3b82f6' },
  players: { name: 'Jugadores', icon: '👥', color: '#10b981' },
  npcs: { name: 'NPCs', icon: '🧙', color: '#8b5cf6' },
  quests: { name: 'Misiones', icon: '📜', color: '#f59e0b' },
  objects: { name: 'Objetos', icon: '📦', color: '#06b6d4' },
  notes: { name: 'Notas', icon: '📝', color: '#ef4444' }
}

function ConnectionModal({ 
  sourceItem, 
  sourceType, 
  campaign,
  onConnect,
  onRemove,
  onClose,
  getLinkedItems,
  getAvailableItems
}) {
  const [activeTab, setActiveTab] = useState('locations')
  const [selectedItems, setSelectedItems] = useState({})

  // Inicializar elementos ya conectados
  useEffect(() => {
    if (sourceItem && getLinkedItems) {
      const linked = getLinkedItems(sourceItem)
      setSelectedItems(linked)
    }
  }, [sourceItem, getLinkedItems])

  // Alternar selección de un elemento
  const toggleSelection = useCallback((item, type) => {
    setSelectedItems(prev => {
      const typeItems = prev[type] || []
      const isSelected = typeItems.some(i => i.id === item.id)
      
      if (isSelected) {
        // Deseleccionar - eliminar conexión
        onRemove(sourceItem, sourceType, item, type)
        return {
          ...prev,
          [type]: typeItems.filter(i => i.id !== item.id)
        }
      } else {
        // Seleccionar - crear conexión
        onConnect(sourceItem, sourceType, item, type)
        return {
          ...prev,
          [type]: [...typeItems, item]
        }
      }
    })
  }, [sourceItem, sourceType, onConnect, onRemove])

  // Seleccionar todos los elementos de un tipo
  const selectAllInType = useCallback((type) => {
    const available = getAvailableItems(sourceItem, sourceType, type)
    const current = selectedItems[type] || []
    
    if (current.length === available.length) {
      // Deseleccionar todos
      current.forEach(item => {
        onRemove(sourceItem, sourceType, item, type)
      })
      setSelectedItems(prev => ({ ...prev, [type]: [] }))
    } else {
      // Seleccionar todos los disponibles
      available.forEach(item => {
        if (!current.some(selected => selected.id === item.id)) {
          onConnect(sourceItem, sourceType, item, type)
        }
      })
      setSelectedItems(prev => ({ ...prev, [type]: available }))
    }
  }, [sourceItem, sourceType, selectedItems, getAvailableItems, onConnect, onRemove])

  // Filtrar tipos disponibles (no mostrar el mismo tipo del elemento fuente)
  const availableTypes = Object.keys(CONNECTION_TYPES).filter(type => type !== sourceType)

  if (!sourceItem) return null

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`🔗 Conectar "${sourceItem.name || sourceItem.title}"`}
      size="large"
    >
      <div style={{
        maxHeight: '70vh',
        overflow: 'auto'
      }}>
        {/* Descripción */}
        <div style={{
          marginBottom: '2rem',
          borderBottom: '1px solid var(--glass-border)',
          paddingBottom: '1rem'
        }}>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '1rem' }}>
            Selecciona elementos para conectar con este {CONNECTION_TYPES[sourceType]?.name.toLowerCase().slice(0, -1)}
          </p>
        </div>

        {/* Tabs de categorías */}
        <div style={{
          display: 'flex',
          gap: 'clamp(0.25rem, 1vw, 0.5rem)',
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}>
          {availableTypes.map(type => {
            const config = CONNECTION_TYPES[type]
            const available = getAvailableItems(sourceItem, sourceType, type)
            const selected = selectedItems[type] || []
            
            return (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                style={{
                  padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeTab === type 
                    ? `${config.color}40` 
                    : 'rgba(31, 41, 55, 0.5)',
                  color: activeTab === type 
                    ? config.color 
                    : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                  fontWeight: '500'
                }}
              >
                <span>{config.icon}</span>
                <span>{config.name}</span>
                <span style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  padding: '0.125rem 0.375rem',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  {selected.length}/{available.length}
                </span>
              </button>
            )
          })}
        </div>

        {/* Contenido de la pestaña activa */}
        <div style={{ minHeight: '300px' }}>
          <ConnectionTypeContent
            type={activeTab}
            sourceItem={sourceItem}
            sourceType={sourceType}
            availableItems={getAvailableItems(sourceItem, sourceType, activeTab)}
            selectedItems={selectedItems[activeTab] || []}
            onToggleSelection={(item) => toggleSelection(item, activeTab)}
            onSelectAll={() => selectAllInType(activeTab)}
          />
        </div>

        {/* Footer con estadísticas */}
        <div style={{
          borderTop: '1px solid var(--glass-border)',
          paddingTop: '1rem',
          marginTop: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Total de conexiones: {Object.values(selectedItems).reduce((total, items) => total + items.length, 0)}
          </div>
        </div>
      </div>
    </Modal>
  )
}

// Componente para mostrar elementos de un tipo específico
function ConnectionTypeContent({
  type,
  sourceItem,
  sourceType,
  availableItems,
  selectedItems,
  onToggleSelection,
  onSelectAll
}) {
  const config = CONNECTION_TYPES[type]

  if (availableItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{config.icon}</div>
        <h4 style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
          No hay {config.name.toLowerCase()} disponibles
        </h4>
        <p style={{ color: 'var(--text-disabled)', fontSize: '0.9rem' }}>
          Crea algunos {config.name.toLowerCase()} para poder conectarlos.
        </p>
      </div>
    )
  }

  const allSelected = selectedItems.length === availableItems.length

  return (
    <div>
      {/* Header con botón "Seleccionar todos" */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h4 style={{ 
          color: 'white', 
          fontSize: '1.1rem', 
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {config.icon} {config.name} disponibles ({availableItems.length})
        </h4>
        
        <button
          onClick={onSelectAll}
          style={{
            background: allSelected 
              ? 'rgba(239, 68, 68, 0.2)' 
              : 'rgba(139, 92, 246, 0.2)',
            border: `1px solid ${allSelected 
              ? 'rgba(239, 68, 68, 0.3)' 
              : 'rgba(139, 92, 246, 0.3)'}`,
            borderRadius: '8px',
            color: allSelected ? '#ef4444' : '#8b5cf6',
            padding: '0.5rem 0.75rem',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: '600'
          }}
        >
          {allSelected ? '❌ Deseleccionar todos' : '✅ Seleccionar todos'}
        </button>
      </div>

      {/* Lista de elementos */}
      <div style={{
        display: 'grid',
        gap: '0.75rem',
        maxHeight: '300px',
        overflowY: 'auto'
      }}>
        {availableItems.map(item => {
          const isSelected = selectedItems.some(selected => selected.id === item.id)
          
          return (
            <div
              key={item.id}
              onClick={() => onToggleSelection(item)}
              style={{
                background: isSelected 
                  ? `${config.color}20` 
                  : 'rgba(31, 41, 55, 0.3)',
                border: `1px solid ${isSelected 
                  ? config.color 
                  : 'rgba(139, 92, 246, 0.2)'}`,
                borderRadius: '12px',
                padding: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}
            >
              {/* Checkbox visual */}
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '4px',
                border: `2px solid ${isSelected ? config.color : '#6b7280'}`,
                background: isSelected ? config.color : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {isSelected && <span style={{ color: 'white', fontSize: '0.8rem' }}>✓</span>}
              </div>

              {/* Icono del elemento */}
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>
                {item.icon || config.icon}
              </span>

              {/* Información del elemento */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h5 style={{ 
                  color: 'white', 
                  fontSize: '1rem', 
                  fontWeight: '600',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {item.name || item.title}
                </h5>
                {item.description && (
                  <p style={{ 
                    color: 'var(--text-muted)', 
                    fontSize: '0.8rem',
                    margin: '0.25rem 0 0 0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.description}
                  </p>
                )}
              </div>

              {/* Estado de selección */}
              <span style={{
                background: isSelected 
                  ? `${config.color}40` 
                  : 'rgba(107, 114, 128, 0.2)',
                color: isSelected ? config.color : '#9ca3af',
                padding: '0.25rem 0.5rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: '600',
                flexShrink: 0
              }}>
                {isSelected ? 'Conectado' : 'Disponible'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ConnectionModal