import React, { useState, useEffect } from 'react'
import DOMPurify from 'dompurify'
import ConnectionsDisplay from './ConnectionsDisplay'
import DynamicForm from './DynamicForm'
// TiptapEditor ya genera HTML, no necesitamos formatear markdown
import BaseBadge from '../ui/base/BaseBadge'

/**
 * Componente de detalles universal que reemplaza todos los *Details específicos
 * Renderiza información de cualquier tipo de entidad basado en configuración
 * Maneja secciones personalizadas y diferentes tipos de renderizado
 */
function UniversalDetails({
  item,
  entityType,
  config,
  _onClose,
  onEdit,
  onDelete,
  connections,
  _campaign
}) {
  const [isEditing, setIsEditing] = useState(false)
  // Estado local del item para actualización inmediata
  const [localItem, setLocalItem] = useState(item)

  // Sincronizar item local con prop cuando cambia
  useEffect(() => {
    setLocalItem(item)
  }, [item])

  // Obtener elementos conectados usando el item local
  const linkedItems = connections?.getLinkedItems(localItem) || {}

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
      case 'html': {
        // Sanitizar HTML antes de renderizar para prevenir XSS
        const sanitizedHTML = DOMPurify.sanitize(value, {
          ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre', 'a', 'span', 'div'],
          ALLOWED_ATTR: ['class', 'style', 'href', 'target', 'rel'],
          ALLOW_DATA_ATTR: false
        })

        return (
          <div
            style={{
              color: 'var(--text-secondary)',
              lineHeight: '1.6',
              background: 'rgba(31, 41, 55, 0.3)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid rgba(79, 70, 229, 0.1)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
            dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
          />
        )
      }

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

  // Renderizar información básica en el header
  const renderHeader = () => {
    const primaryField = config.displayFields.primary
    const secondaryFields = config.displayFields.secondary || []

    return (
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '3rem' }}>
            {localItem.icon || config.icon}
          </div>
          <div>
            <h3 style={{ color: 'white', margin: 0, fontSize: '1.5rem' }}>
              {localItem[primaryField]}
            </h3>

            {/* Información secundaria con badges */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              {secondaryFields.map(fieldName => {
                const value = localItem[fieldName]
                if (!value) return null
                
                return (
                  <BaseBadge 
                    key={fieldName}
                    variant="info"
                    color="blue"
                    size="md"
                    icon={getFieldIcon(fieldName, value)}
                    style={{
                      background: `${getFieldColor(fieldName, value)}20`,
                      color: getFieldColor(fieldName, value),
                      border: `1px solid ${getFieldColor(fieldName, value)}40`
                    }}
                  >
                    {value}
                  </BaseBadge>
                )
              })}
              
              {/* Campo especial de nivel para jugadores */}
              {entityType === 'players' && localItem.level && (
                <BaseBadge
                  variant="category"
                  color="purple"
                  size="md"
                  icon="⭐"
                  style={{
                    background: `${getFieldColor('level', localItem.level)}20`,
                    color: getFieldColor('level', localItem.level),
                    border: `1px solid ${getFieldColor('level', localItem.level)}40`
                  }}
                >
                  Nivel {localItem.level}
                </BaseBadge>
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
      const sectionFields = section.fields.filter(fieldName => localItem[fieldName])

      if (sectionFields.length === 0) return null

      return (
        <div key={index} style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>{section.title}</h4>

          {sectionFields.map(fieldName => {
            const fieldConfig = config.schema[fieldName]
            const value = localItem[fieldName]

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
          })}
        </div>
      )
    })
  }

  // Renderizar información específica para ciertos tipos
  const renderSpecialSections = () => {
    const sections = []

    // Información específica de jugadores
    if (entityType === 'players' && localItem.playerName) {
      sections.push(
        <div key="playerName" style={{ marginBottom: '1rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Jugador real</h4>
          <p style={{ color: 'var(--text-secondary)' }}>
            🎮 {localItem.playerName}
          </p>
        </div>
      )
    }

    // Información de ubicación para misiones y objetos
    if ((entityType === 'quests' || entityType === 'objects') && localItem.location) {
      sections.push(
        <div key="location" style={{ marginBottom: '1rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Ubicación</h4>
          <p style={{ color: 'var(--text-secondary)' }}>
            📍 {localItem.location}
          </p>
        </div>
      )
    }

    // Recompensa para misiones
    if (entityType === 'quests' && localItem.reward) {
      sections.push(
        <div key="reward" style={{ marginBottom: '1rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Recompensa</h4>
          <p style={{ color: 'var(--text-secondary)' }}>
            💰 {localItem.reward}
          </p>
        </div>
      )
    }

    // Fecha de creación para notas
    if (entityType === 'notes') {
      sections.push(
        <div key="timestamps" style={{ marginBottom: '2rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            📅 Creada el {new Date(localItem.createdAt).toLocaleDateString()} a las {new Date(localItem.createdAt).toLocaleTimeString()}
          </p>
          {localItem.modifiedAt && localItem.modifiedAt !== localItem.createdAt && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              ✏️ Última modificación: {new Date(localItem.modifiedAt).toLocaleDateString()} a las {new Date(localItem.modifiedAt).toLocaleTimeString()}
            </p>
          )}
        </div>
      )
    }

    return sections
  }

  // Función para manejar guardado desde el formulario interno
  const handleSave = (formData) => {
    const updatedItem = { ...localItem, ...formData, id: localItem.id }
    setLocalItem(updatedItem) // Actualizar item local inmediatamente
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

  // Función para inyectar botones compactos - solo para modo vista
  const injectViewButtons = () => {
    const actionContainer = document.getElementById('modal-compact-actions')
    const fallbackActions = document.getElementById('fallback-actions')
    
    if (!actionContainer || isEditing) return
    
    // Ocultar botones fallback ya que usaremos los compactos
    if (fallbackActions) {
      fallbackActions.style.display = 'none'
    }

    // Limpiar contenido previo
    actionContainer.innerHTML = ''

    // Solo botones de vista (editar y eliminar)
    // Botón de editar compacto
    const editButton = document.createElement('button')
    editButton.innerHTML = '✏️'
    editButton.title = 'Editar'
    editButton.setAttribute('aria-label', `Editar ${localItem.name || localItem.title}`)
    editButton.setAttribute('type', 'button')
    editButton.style.cssText = `
      background: rgba(79, 70, 229, 0.2);
      border: 1px solid rgba(79, 70, 229, 0.3);
      border-radius: 6px;
      color: #6366f1;
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
      editButton.style.background = 'rgba(79, 70, 229, 0.3)'
      editButton.style.borderColor = 'rgba(79, 70, 229, 0.5)'
    })
    editButton.addEventListener('mouseleave', () => {
      editButton.style.background = 'rgba(79, 70, 229, 0.2)'
      editButton.style.borderColor = 'rgba(79, 70, 229, 0.3)'
    })
    editButton.addEventListener('click', handleStartEdit)
    // Soporte de teclado
    editButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleStartEdit()
      }
    })
    actionContainer.appendChild(editButton)

    // Botón de eliminar compacto
    const deleteButton = document.createElement('button')
    deleteButton.innerHTML = '🗑️'
    deleteButton.title = 'Eliminar'
    deleteButton.setAttribute('aria-label', `Eliminar ${localItem.name || localItem.title}`)
    deleteButton.setAttribute('type', 'button')
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
    const handleDelete = () => {
      if (window.confirm(`¿Estás seguro de que quieres eliminar "${localItem.name || localItem.title}"?`)) {
        onDelete()
      }
    }
    deleteButton.addEventListener('click', handleDelete)
    // Soporte de teclado
    deleteButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleDelete()
      }
    })
    actionContainer.appendChild(deleteButton)
  }

  // Efecto para inyectar botones solo en modo vista
  useEffect(() => {
    if (!isEditing) {
      injectViewButtons()
    }
  }, [isEditing])

  // Efecto para inyectar botones cuando se monta el componente
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isEditing) {
        injectViewButtons()
      }
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
          item={localItem}
          onSave={handleSave}
          onClose={handleCancelEdit}
          showCompactButtons={true}
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
          onClick={() => {
            if (window.confirm(`¿Estás seguro de que quieres eliminar "${localItem.name || localItem.title}"?`)) {
              onDelete()
            }
          }}
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