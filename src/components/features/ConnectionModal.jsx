import React, { useState, useEffect, useCallback } from 'react'
import BaseModal from '../ui/base/BaseModal'

// Configuración de tipos disponibles para conexiones
const CONNECTION_TYPES = {
  locations: { name: 'Lugares', icon: '📍', color: '#3b82f6' },
  players: { name: 'Jugadores', icon: '👥', color: '#10b981' },
  npcs: { name: 'NPCs', icon: '🧙', color: '#4f46e5' },
  quests: { name: 'Misiones', icon: '📜', color: '#f59e0b' },
  objects: { name: 'Objetos', icon: '📦', color: '#06b6d4' },
  notes: { name: 'Notas', icon: '📝', color: '#ef4444' }
}

function ConnectionModal({
  sourceItem,
  sourceType,
  _campaign,
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

  // Mostrar todos los tipos disponibles, incluyendo el mismo tipo del elemento fuente
  const availableTypes = Object.keys(CONNECTION_TYPES)

  if (!sourceItem) return null

  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      title={`🔗 Conectar "${sourceItem.name || sourceItem.title}"`}
      size="lg"
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 400px',
        gap: '1.5rem',
        height: '70vh',
        overflow: 'hidden'
      }}>
        {/* Panel izquierdo - Selección */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Descripción */}
          <div style={{
            marginBottom: '1rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--glass-border)'
          }}>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
              Selecciona elementos para conectar
            </p>
          </div>

          {/* Tabs de categorías */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            flexShrink: 0
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
                    padding: '0.6rem 0.9rem',
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
                    fontSize: '0.85rem',
                    fontWeight: '500'
                  }}
                >
                  <span>{config.icon}</span>
                  <span>{config.name}</span>
                  <span style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    padding: '0.125rem 0.375rem',
                    fontSize: '0.7rem',
                    fontWeight: '600'
                  }}>
                    {selected.length}/{available.length}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Contenido de la pestaña activa */}
          <div style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
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
        </div>

        {/* Panel derecho - Conexiones actuales */}
        <div style={{
          borderLeft: '1px solid var(--glass-border)',
          paddingLeft: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <h4 style={{
            color: 'white',
            fontSize: '1.1rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexShrink: 0
          }}>
            🔗 Conexiones actuales
            <span style={{
              background: 'rgba(79, 70, 229, 0.2)',
              borderRadius: '12px',
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#6366f1'
            }}>
              {Object.values(selectedItems).reduce((total, items) => total + items.length, 0)}
            </span>
          </h4>

          {/* Lista de conexiones con scroll */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {Object.values(selectedItems).every(items => items.length === 0) ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                color: 'var(--text-muted)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>
                  🔗
                </div>
                <p style={{ fontSize: '0.9rem' }}>
                  No hay conexiones aún
                </p>
                <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                  Selecciona elementos de la izquierda
                </p>
              </div>
            ) : (
              Object.entries(CONNECTION_TYPES).map(([type, config]) => {
                const connections = selectedItems[type] || []
                if (connections.length === 0) return null

                return (
                  <div key={type} style={{
                    background: `${config.color}08`,
                    border: `1px solid ${config.color}30`,
                    borderRadius: '12px',
                    padding: '1rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.75rem'
                    }}>
                      <span style={{ fontSize: '1.2rem' }}>{config.icon}</span>
                      <span style={{
                        color: config.color,
                        fontWeight: '600',
                        fontSize: '0.95rem'
                      }}>
                        {config.name}
                      </span>
                      <span style={{
                        background: `${config.color}25`,
                        borderRadius: '12px',
                        padding: '0.125rem 0.4rem',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        color: config.color
                      }}>
                        {connections.length}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}>
                      {connections.map(item => (
                        <div
                          key={item.id}
                          style={{
                            background: `${config.color}15`,
                            border: `1px solid ${config.color}30`,
                            borderRadius: '8px',
                            padding: '0.5rem 0.75rem',
                            color: 'white',
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s ease',
                            position: 'relative',
                            paddingRight: '2rem'
                          }}
                        >
                          <span>{item.icon || config.icon}</span>
                          <span style={{
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {item.name || item.title}
                          </span>
                          {/* Botón de eliminar */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleSelection(item, type)
                            }}
                            style={{
                              position: 'absolute',
                              right: '0.5rem',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'rgba(239, 68, 68, 0.2)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              borderRadius: '4px',
                              color: '#ef4444',
                              width: '20px',
                              height: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              fontSize: '0.7rem',
                              padding: 0,
                              transition: 'all 0.15s ease',
                              opacity: 0.7
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.opacity = '1'
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.opacity = '0.7'
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
                            }}
                            title="Eliminar conexión"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </BaseModal>
  )
}

// Componente para mostrar elementos de un tipo específico
function ConnectionTypeContent({
  type,
  _sourceItem,
  _sourceType,
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
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header con botón "Seleccionar todos" */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        flexShrink: 0
      }}>
        <h4 style={{
          color: 'white',
          fontSize: '1rem',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {config.icon} {config.name}
          <span style={{
            background: `${config.color}20`,
            borderRadius: '12px',
            padding: '0.125rem 0.4rem',
            fontSize: '0.7rem',
            fontWeight: '600',
            color: config.color
          }}>
            {availableItems.length}
          </span>
        </h4>

        <button
          onClick={onSelectAll}
          style={{
            background: allSelected
              ? 'rgba(239, 68, 68, 0.2)'
              : 'rgba(79, 70, 229, 0.2)',
            border: `1px solid ${allSelected
              ? 'rgba(239, 68, 68, 0.3)'
              : 'rgba(79, 70, 229, 0.3)'}`,
            borderRadius: '8px',
            color: allSelected ? '#ef4444' : '#4f46e5',
            padding: '0.5rem 0.75rem',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: '600',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.8'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1'
          }}
        >
          {allSelected ? '❌ Deseleccionar' : '✅ Seleccionar todos'}
        </button>
      </div>

      {/* Lista de elementos */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        display: 'grid',
        gap: '0.75rem',
        alignContent: 'start'
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
                  : 'rgba(79, 70, 229, 0.2)'}`,
                borderRadius: '12px',
                padding: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.9rem'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'rgba(31, 41, 55, 0.5)'
                  e.currentTarget.style.borderColor = 'rgba(79, 70, 229, 0.3)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'rgba(31, 41, 55, 0.3)'
                  e.currentTarget.style.borderColor = 'rgba(79, 70, 229, 0.2)'
                }
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
                flexShrink: 0,
                transition: 'all 0.2s ease'
              }}>
                {isSelected && <span style={{ color: 'white', fontSize: '0.8rem', fontWeight: 'bold' }}>✓</span>}
              </div>

              {/* Icono del elemento */}
              <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>
                {item.icon || config.icon}
              </span>

              {/* Información del elemento */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h5 style={{
                  color: 'white',
                  fontSize: '0.95rem',
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
                    fontSize: '0.75rem',
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
                padding: '0.3rem 0.6rem',
                borderRadius: '6px',
                fontSize: '0.7rem',
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