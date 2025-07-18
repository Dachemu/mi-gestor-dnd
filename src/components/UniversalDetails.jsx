import React, { useState, useEffect } from 'react'
import ConnectionsDisplay from './ConnectionsDisplay'
import DynamicForm from './DynamicForm'
import { formatMarkdownToHtml } from '../utils/textFormatter'

/**
 * Componente de detalles universal que reemplaza todos los *Details específicos
 * Renderiza información de cualquier tipo de entidad basado en configuración
 * Maneja secciones personalizadas y diferentes tipos de renderizado
 */
function UniversalDetails({ 
  item, 
  entityType, 
  config, 
  onClose, 
  onEdit, 
  onDelete, 
  connections, 
  campaign 
}) {
  const [isEditing, setIsEditing] = useState(false)
  // Obtener elementos conectados
  const linkedItems = connections?.getLinkedItems(item) || {}

  // Función para obtener color basado en configuración
  const getFieldColor = (fieldName, value) => {
    if (!config.colors || !config.colors[fieldName]) return '#6b7280'
    
    const colorConfig = config.colors[fieldName]
    
    if (typeof colorConfig === 'function') {
      return colorConfig(value)
    }
    
    if (typeof colorConfig === 'object') {
      return colorConfig[value] || '#6b7280'
    }
    
    return colorConfig
  }

  // Renderizar diferentes tipos de contenido
  const renderFieldValue = (fieldName, value, renderType = 'text') => {
    if (!value) return null

    switch (renderType) {
      case 'html':
        return (
          <div 
            style={{ 
              color: 'var(--text-secondary)', 
              lineHeight: '1.6',
              background: 'rgba(31, 41, 55, 0.3)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid rgba(139, 92, 246, 0.1)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
            dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(value) }}
          />
        )

      case 'stats':
        // Renderizado especial para estadísticas (específico de players)
        return renderStatsSection(item)

      case 'badge':
        return (
          <span style={{
            display: 'inline-block',
            padding: '0.5rem 1rem',
            background: `${getFieldColor(fieldName, value)}20`,
            color: getFieldColor(fieldName, value),
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            {getFieldIcon(fieldName, value)} {value}
          </span>
        )

      default:
        return (
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {value}
          </p>
        )
    }
  }

  // Obtener icono para campos específicos
  const getFieldIcon = (fieldName, value) => {
    const iconMaps = {
      status: {
        'Completada': '✅',
        'En progreso': '⏳',
        'Pendiente': '⏸️',
        'Fallida': '❌'
      },
      priority: {
        'Alta': '🔥',
        'Media': '⭐',
        'Baja': '💫'
      },
      rarity: {
        'Legendario': '⭐',
        'Épico': '💜',
        'Raro': '💙',
        'Poco común': '💚',
        'Común': '⚪'
      },
      attitude: {
        'Amistoso': '😊',
        'Hostil': '😠',
        'Neutral': '😐'
      },
      importance: {
        'Alta': '🔥',
        'Media': '⭐',
        'Baja': '💫'
      }
    }

    return iconMaps[fieldName]?.[value] || ''
  }

  // Renderizado especial para estadísticas de jugadores
  const renderStatsSection = (player) => {
    const stats = [
      { key: 'hitPoints', label: 'HP', icon: '❤️', color: '#ef4444' },
      { key: 'armorClass', label: 'CA', icon: '🛡️', color: '#3b82f6' },
      { key: 'speed', label: 'pies', icon: '💨', color: '#10b981' }
    ]

    const availableStats = stats.filter(stat => player[stat.key])
    
    if (availableStats.length === 0) return null

    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
        gap: '0.5rem'
      }}>
        {availableStats.map(stat => (
          <div key={stat.key} style={{
            background: `rgba(${stat.color.slice(1).match(/.{2}/g).map(x => parseInt(x, 16)).join(', ')}, 0.2)`,
            color: stat.color,
            padding: '0.5rem',
            borderRadius: '8px',
            textAlign: 'center',
            fontSize: '0.8rem',
            fontWeight: '600'
          }}>
            <div style={{ fontSize: '1.2rem' }}>{stat.icon}</div>
            <div>{player[stat.key]} {stat.label}</div>
          </div>
        ))}
      </div>
    )
  }

  // Renderizar información básica en el header
  const renderHeader = () => {
    const primaryField = config.displayFields.primary
    const secondaryFields = config.displayFields.secondary || []
    
    return (
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '3rem' }}>
            {item.icon || item.avatar || config.icon}
          </div>
          <div>
            <h3 style={{ color: 'white', margin: 0, fontSize: '1.5rem' }}>
              {item[primaryField]}
            </h3>
            
            {/* Información secundaria con badges */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              {secondaryFields.map(fieldName => {
                const value = item[fieldName]
                if (!value) return null
                
                return (
                  <span key={fieldName} style={{
                    padding: '0.5rem 1rem',
                    background: `${getFieldColor(fieldName, value)}20`,
                    color: getFieldColor(fieldName, value),
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>
                    {getFieldIcon(fieldName, value)} {value}
                  </span>
                )
              })}
              
              {/* Campo especial de nivel para jugadores */}
              {entityType === 'players' && item.level && (
                <span style={{
                  padding: '0.5rem 1rem',
                  background: `${getFieldColor('level', item.level)}20`,
                  color: getFieldColor('level', item.level),
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  ⭐ Nivel {item.level}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Renderizar secciones de detalles
  const renderDetailSections = () => {
    return config.detailSections.map((section, index) => {
      const sectionFields = section.fields.filter(fieldName => item[fieldName])
      
      if (sectionFields.length === 0) return null

      return (
        <div key={index} style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>{section.title}</h4>
          
          {section.render === 'stats' ? (
            renderStatsSection(item)
          ) : (
            sectionFields.map(fieldName => {
              const fieldConfig = config.schema[fieldName]
              const value = item[fieldName]
              
              if (!value) return null

              return (
                <div key={fieldName} style={{ marginBottom: '1rem' }}>
                  {section.render !== 'html' && fieldConfig && (
                    <h5 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      {fieldConfig.label}
                    </h5>
                  )}
                  {renderFieldValue(fieldName, value, section.render)}
                </div>
              )
            })
          )}
        </div>
      )
    })
  }

  // Renderizar información específica para ciertos tipos
  const renderSpecialSections = () => {
    const sections = []

    // Información específica de jugadores
    if (entityType === 'players' && item.playerName) {
      sections.push(
        <div key="playerName" style={{ marginBottom: '1rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Jugador real</h4>
          <p style={{ color: 'var(--text-secondary)' }}>
            🎮 {item.playerName}
          </p>
        </div>
      )
    }

    // Información de ubicación para misiones y objetos
    if ((entityType === 'quests' || entityType === 'objects') && item.location) {
      sections.push(
        <div key="location" style={{ marginBottom: '1rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Ubicación</h4>
          <p style={{ color: 'var(--text-secondary)' }}>
            📍 {item.location}
          </p>
        </div>
      )
    }

    // Recompensa para misiones
    if (entityType === 'quests' && item.reward) {
      sections.push(
        <div key="reward" style={{ marginBottom: '1rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Recompensa</h4>
          <p style={{ color: 'var(--text-secondary)' }}>
            💰 {item.reward}
          </p>
        </div>
      )
    }

    // Fecha de creación para notas
    if (entityType === 'notes') {
      sections.push(
        <div key="timestamps" style={{ marginBottom: '2rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            📅 Creada el {new Date(item.createdAt).toLocaleDateString()} a las {new Date(item.createdAt).toLocaleTimeString()}
          </p>
          {item.modifiedAt && item.modifiedAt !== item.createdAt && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              ✏️ Última modificación: {new Date(item.modifiedAt).toLocaleDateString()} a las {new Date(item.modifiedAt).toLocaleTimeString()}
            </p>
          )}
        </div>
      )
    }

    return sections
  }

  // Función para manejar guardado desde el formulario interno
  const handleSave = (formData) => {
    const updatedItem = { ...item, ...formData, id: item.id }
    onEdit(updatedItem) // Llamar a la función de guardado del padre
    setIsEditing(false) // Volver al modo vista
  }

  // Función para cancelar edición
  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  // Función para abrir modo edición
  const handleStartEdit = () => {
    setIsEditing(true)
  }

  // Función para inyectar botones compactos en el header del modal
  const injectCompactButtons = () => {
    const actionContainer = document.getElementById('modal-compact-actions')
    const fallbackActions = document.getElementById('fallback-actions')
    
    if (!actionContainer) {
      // Si no hay container compacto, mostrar botones fallback
      if (fallbackActions) {
        fallbackActions.style.display = 'flex'
      }
      return
    }

    // Ocultar botones fallback ya que usaremos los compactos
    if (fallbackActions) {
      fallbackActions.style.display = 'none'
    }

    // Limpiar contenido previo
    actionContainer.innerHTML = ''

    if (!isEditing) {
      // Botón de editar compacto
      const editButton = document.createElement('button')
      editButton.innerHTML = '✏️'
      editButton.title = 'Editar'
      editButton.style.cssText = `
        background: rgba(139, 92, 246, 0.2);
        border: 1px solid rgba(139, 92, 246, 0.3);
        border-radius: 6px;
        color: #a78bfa;
        padding: 0.5rem;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        height: 32px;
      `
      editButton.addEventListener('mouseenter', () => {
        editButton.style.background = 'rgba(139, 92, 246, 0.3)'
        editButton.style.borderColor = 'rgba(139, 92, 246, 0.5)'
      })
      editButton.addEventListener('mouseleave', () => {
        editButton.style.background = 'rgba(139, 92, 246, 0.2)'
        editButton.style.borderColor = 'rgba(139, 92, 246, 0.3)'
      })
      editButton.addEventListener('click', handleStartEdit)
      actionContainer.appendChild(editButton)

      // Botón de eliminar compacto
      const deleteButton = document.createElement('button')
      deleteButton.innerHTML = '🗑️'
      deleteButton.title = 'Eliminar'
      deleteButton.style.cssText = `
        background: rgba(239, 68, 68, 0.2);
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: 6px;
        color: #ef4444;
        padding: 0.5rem;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        height: 32px;
      `
      deleteButton.addEventListener('mouseenter', () => {
        deleteButton.style.background = 'rgba(239, 68, 68, 0.3)'
        deleteButton.style.borderColor = 'rgba(239, 68, 68, 0.5)'
      })
      deleteButton.addEventListener('mouseleave', () => {
        deleteButton.style.background = 'rgba(239, 68, 68, 0.2)'
        deleteButton.style.borderColor = 'rgba(239, 68, 68, 0.3)'
      })
      deleteButton.addEventListener('click', onDelete)
      actionContainer.appendChild(deleteButton)
    } else {
      // Botón de guardar compacto
      const saveButton = document.createElement('button')
      saveButton.innerHTML = '💾'
      saveButton.title = 'Guardar'
      saveButton.style.cssText = `
        background: rgba(16, 185, 129, 0.2);
        border: 1px solid rgba(16, 185, 129, 0.3);
        border-radius: 6px;
        color: #10b981;
        padding: 0.5rem;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        height: 32px;
      `
      saveButton.addEventListener('mouseenter', () => {
        saveButton.style.background = 'rgba(16, 185, 129, 0.3)'
        saveButton.style.borderColor = 'rgba(16, 185, 129, 0.5)'
      })
      saveButton.addEventListener('mouseleave', () => {
        saveButton.style.background = 'rgba(16, 185, 129, 0.2)'
        saveButton.style.borderColor = 'rgba(16, 185, 129, 0.3)'
      })
      // Hacer clic en el botón de guardar compacto debe activar el submit del formulario
      saveButton.addEventListener('click', () => {
        const form = document.querySelector('form')
        if (form) {
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
        }
      })
      actionContainer.appendChild(saveButton)

      // Botón de cancelar compacto
      const cancelButton = document.createElement('button')
      cancelButton.innerHTML = '❌'
      cancelButton.title = 'Cancelar'
      cancelButton.style.cssText = `
        background: rgba(156, 163, 175, 0.2);
        border: 1px solid rgba(156, 163, 175, 0.3);
        border-radius: 6px;
        color: #9ca3af;
        padding: 0.5rem;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        height: 32px;
      `
      cancelButton.addEventListener('mouseenter', () => {
        cancelButton.style.background = 'rgba(156, 163, 175, 0.3)'
        cancelButton.style.borderColor = 'rgba(156, 163, 175, 0.5)'
      })
      cancelButton.addEventListener('mouseleave', () => {
        cancelButton.style.background = 'rgba(156, 163, 175, 0.2)'
        cancelButton.style.borderColor = 'rgba(156, 163, 175, 0.3)'
      })
      cancelButton.addEventListener('click', handleCancelEdit)
      actionContainer.appendChild(cancelButton)
    }
  }

  // Efecto para inyectar botones cuando cambia el estado de edición
  useEffect(() => {
    injectCompactButtons()
  }, [isEditing])

  // Efecto para inyectar botones cuando se monta el componente
  useEffect(() => {
    const timer = setTimeout(() => {
      injectCompactButtons()
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Si está en modo edición, mostrar el formulario
  if (isEditing) {
    return (
      <div>
        {/* Formulario de edición */}
        <DynamicForm
          entityType={entityType}
          config={config}
          item={item}
          onSave={handleSave}
          onClose={handleCancelEdit}
          showButtons={false}
        />
      </div>
    )
  }

  // Modo vista normal
  return (
    <div>
      {/* Header con información básica */}
      {renderHeader()}

      {/* Secciones especiales */}
      {renderSpecialSections()}

      {/* Secciones de detalles configurables */}
      {renderDetailSections()}

      {/* Sistema de conexiones */}
      {connections && (
        <div style={{ marginBottom: '2rem' }}>
          <ConnectionsDisplay
            item={item}
            itemType={entityType}
            linkedItems={linkedItems}
            onRemoveConnection={connections.removeConnection}
            onOpenConnectionModal={connections.openConnectionModal}
            onNavigateToItem={connections.navigateToItem}
          />
        </div>
      )}

      {/* Acciones - Ocultas cuando hay botones compactos */}
      <div 
        id="fallback-actions"
        style={{ 
          display: 'flex', 
          gap: '0.75rem',
          marginTop: '1rem'
        }}
      >
        <button
          onClick={handleStartEdit}
          className="btn-primary"
          style={{ flex: 1 }}
        >
          ✏️ Editar
        </button>
        <button
          onClick={onDelete}
          style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            color: '#ef4444',
            padding: '0.75rem 1rem',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          🗑️
        </button>
      </div>
    </div>
  )
}

export default React.memo(UniversalDetails)