import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { validateEntity } from '../../config/entityTypes.js'
import RichTextEditor from '../ui/RichTextEditor'
import IconSelector from '../ui/IconSelector'
import EmojiSelector from '../ui/EmojiSelector'

/**
 * Componente de formulario dinámico que genera formularios basado en esquemas
 * Reemplaza todos los componentes Form específicos (PlayerForm, QuestForm, etc.)
 * Maneja validación automática y diferentes tipos de campos
 */
function DynamicForm({ entityType, config, item, onSave, onClose, showCompactButtons = false }) {
  
  // Inicializar formData con valores por defecto o del item existente
  const initializeFormData = () => {
    const initialData = {}
    
    Object.entries(config.schema).forEach(([fieldName, fieldConfig]) => {
      if (item && item[fieldName] !== undefined) {
        // Usar valor del item existente
        initialData[fieldName] = item[fieldName]
      } else if (fieldConfig.defaultValue !== undefined) {
        // Usar valor por defecto del esquema
        initialData[fieldName] = fieldConfig.defaultValue
      } else {
        // Valor vacío según tipo
        initialData[fieldName] = fieldConfig.type === 'number' ? '' : ''
      }
    })
    
    return initialData
  }

  const [formData, setFormData] = useState(initializeFormData)
  const [errors, setErrors] = useState({})
  
  // Función para manejar el guardado desde botones compactos
  const handleCompactSave = () => {
    // Crear evento sintético que handleSubmit espera
    const syntheticEvent = {
      preventDefault: () => {},
      target: {
        elements: Object.keys(formData).reduce((acc, key) => {
          acc[key] = { value: formData[key] }
          return acc
        }, {})
      }
    }
    
    // Llamar directamente a handleSubmit
    handleSubmit(syntheticEvent)
  }

  // Renderizar botones compactos en el header del modal
  useEffect(() => {
    if (!showCompactButtons) return
    
    const actionContainer = document.getElementById('modal-compact-actions')
    if (!actionContainer) return
    
    // Limpiar COMPLETAMENTE cualquier botón existente
    actionContainer.innerHTML = ''
    
    // Crear contenedor para los botones React
    const buttonContainer = document.createElement('div')
    buttonContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 0.5rem;
    `
    actionContainer.appendChild(buttonContainer)
    
    // Crear root para React 18
    let root = null
    
    // Componente de botones compactos (ORDEN CORRECTO: Guardar primero, Cancelar segundo)
    const CompactButtons = () => (
      <>
        <button
          type="button"
          onClick={handleCompactSave}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(16, 185, 129, 0.3)'
            e.target.style.borderColor = 'rgba(16, 185, 129, 0.5)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(16, 185, 129, 0.2)'
            e.target.style.borderColor = 'rgba(16, 185, 129, 0.3)'
          }}
          style={{
            background: 'rgba(16, 185, 129, 0.2)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '6px',
            color: '#10b981',
            padding: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '32px',
            height: '32px'
          }}
          title="Guardar"
        >
          💾
        </button>
        <button
          type="button"
          onClick={onClose}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(156, 163, 175, 0.3)'
            e.target.style.borderColor = 'rgba(156, 163, 175, 0.5)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(156, 163, 175, 0.2)'
            e.target.style.borderColor = 'rgba(156, 163, 175, 0.3)'
          }}
          style={{
            background: 'rgba(156, 163, 175, 0.2)',
            border: '1px solid rgba(156, 163, 175, 0.3)',
            borderRadius: '6px',
            color: '#9ca3af',
            padding: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '32px',
            height: '32px'
          }}
          title="Cancelar"
        >
          ❌
        </button>
      </>
    )
    
    // Renderizar usando createRoot para React 18
    if (ReactDOM.createRoot) {
      root = ReactDOM.createRoot(buttonContainer)
      root.render(<CompactButtons />)
    }
    
    // Cleanup function
    return () => {
      if (root) {
        root.unmount()
      }
      // Limpiar el container completamente
      if (actionContainer) {
        actionContainer.innerHTML = ''
      }
    }
  }, [showCompactButtons, onClose, handleCompactSave])
  
  // ✅ Efecto para re-inicializar formData cuando cambian item o config
  React.useEffect(() => {
    const newFormData = initializeFormData()
    setFormData(newFormData)
    setErrors({}) // Limpiar errores al cambiar el item
  }, [item, config, entityType]) // Re-ejecutar cuando cambien las props críticas

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Limpiar error si el campo ahora tiene valor
    if (errors[name] && value.trim()) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validar usando la función centralizada
    const validation = validateEntity(entityType, formData)
    
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    // Preparar datos para guardar
    const dataToSave = {
      ...formData,
      // Agregar timestamps si es necesario
      ...(item ? { modifiedAt: new Date().toISOString() } : {})
    }

    // Llamar a la función de guardado
    onSave(dataToSave)
  }

  const renderField = (fieldName, fieldConfig) => {
    const baseProps = {
      name: fieldName,
      value: formData[fieldName] || '',
      onChange: handleChange,
      className: "input-field",
      style: {
        borderColor: errors[fieldName] ? '#ef4444' : undefined
      }
    }

    switch (fieldConfig.type) {
      case 'text':
        return (
          <input
            type="text"
            placeholder={fieldConfig.placeholder}
            {...baseProps}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            placeholder={fieldConfig.placeholder}
            min={fieldConfig.min}
            max={fieldConfig.max}
            {...baseProps}
          />
        )

      case 'textarea':
        return (
          <textarea
            placeholder={fieldConfig.placeholder}
            rows={fieldConfig.rows || 4}
            {...baseProps}
            style={{
              ...baseProps.style,
              resize: 'vertical',
              minHeight: '100px'
            }}
          />
        )

      case 'richtext':
        return (
          <RichTextEditor
            name={fieldName}
            value={formData[fieldName] || ''}
            onChange={handleChange}
            placeholder={fieldConfig.placeholder}
            minHeight={fieldConfig.minHeight || '200px'}
          />
        )

      case 'select':
        return (
          <select {...baseProps}>
            {!fieldConfig.required && <option value="">Seleccionar</option>}
            {fieldConfig.options.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      default:
        // Campos especiales de icono/avatar usan IconSelector
        if (fieldName === 'icon' || fieldName === 'avatar') {
          return (
            <IconSelector
              name={fieldName}
              value={formData[fieldName] || ''}
              onChange={handleChange}
              entityType={entityType}
              label={fieldConfig.label}
            />
          )
        }
        
        return (
          <input
            type="text"
            placeholder={fieldConfig.placeholder}
            {...baseProps}
          />
        )
    }
  }

  const renderFieldGroup = (fields, columns = 1) => {
    const gridCols = columns === 1 ? '1fr' : 
                     columns === 2 ? '1fr 1fr' : 
                     columns === 3 ? '1fr 1fr 1fr' : 
                     `repeat(${columns}, 1fr)`

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: gridCols,
        gap: '1rem'
      }}>
        {fields.map(fieldName => {
          const fieldConfig = config.schema[fieldName]
          if (!fieldConfig) return null

          // Campos de nombre/título con selector de emoji integrado
          const isNameField = ['name', 'title'].includes(fieldName)
          const hasIconField = config.schema.icon || config.schema.avatar

          return (
            <div key={fieldName}>
              {/* No mostrar label para campos de icono/avatar ya que IconSelector lo incluye */}
              {(fieldName !== 'icon' && fieldName !== 'avatar') && (
                <label style={{ 
                  color: 'white', 
                  fontWeight: '600', 
                  marginBottom: '0.5rem', 
                  display: 'block' 
                }}>
                  {fieldConfig.label} {fieldConfig.required && '*'}
                </label>
              )}
              
              {/* Si es campo de nombre/título y hay campo icon/avatar, mostrar juntos */}
              {isNameField && hasIconField ? (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    {renderField(fieldName, fieldConfig)}
                  </div>
                  <EmojiSelector
                    value={formData.icon || formData.avatar || ''}
                    onChange={handleChange}
                    name={config.schema.icon ? 'icon' : 'avatar'}
                    entityType={entityType}
                  />
                </div>
              ) : (
                // Renderizar campo normal (pero omitir icon/avatar si ya se renderizó con el nombre)
                fieldName !== 'icon' && fieldName !== 'avatar' && renderField(fieldName, fieldConfig)
              )}
              
              {errors[fieldName] && (
                <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>
                  {errors[fieldName]}
                </p>
              )}
              {fieldConfig.hint && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  {fieldConfig.hint}
                </p>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // Agrupar campos para mejor organización visual
  const organizeFields = () => {
    const fields = Object.keys(config.schema)
    const groups = []

    // Configuraciones específicas por tipo de entidad
    switch (entityType) {
      case 'players':
        groups.push(
          { fields: ['name', 'player'], columns: 2 },
          { fields: ['class', 'race', 'level'], columns: 3 },
          { fields: ['background'] },
          { fields: ['description'] },
          { fields: ['backstory'] },
          { fields: ['hitPoints', 'armorClass', 'speed'], columns: 3 }
        )
        break

      case 'quests':
        groups.push(
          { fields: ['title'] },
          { fields: ['description'] },
          { fields: ['status', 'priority'], columns: 2 },
          { fields: ['location'] },
          { fields: ['reward'] },
          { fields: ['detailedDescription'] }
        )
        break

      case 'objects':
        groups.push(
          { fields: ['name'] },
          { fields: ['type', 'rarity'], columns: 2 },
          { fields: ['description'] },
          { fields: ['detailedDescription'] },
          { fields: ['owner', 'location'], columns: 2 }
        )
        break

      case 'npcs':
        groups.push(
          { fields: ['name'] },
          { fields: ['role'] },
          { fields: ['description'] },
          { fields: ['location'] },
          { fields: ['attitude'] },
          { fields: ['detailedDescription'] }
        )
        break

      case 'locations':
        groups.push(
          { fields: ['name'] },
          { fields: ['type'] },
          { fields: ['description'] },
          { fields: ['importance'] },
          { fields: ['inhabitants'] },
          { fields: ['detailedDescription'] }
        )
        break

      case 'notes':
        groups.push(
          { fields: ['title', 'category'], columns: 2 },
          { fields: ['content'] }
        )
        break

      default:
        // Fallback: agrupar todos los campos
        groups.push({ fields })
    }

    return groups
  }

  const fieldGroups = organizeFields()
  
  // ✅ Sin efectos de inyección - usaremos botones nativos

  return (
    <form id="dynamic-form" onSubmit={handleSubmit}>
      <div style={{
        display: 'grid',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {fieldGroups.map((group, index) => (
          <div key={index}>
            {renderFieldGroup(group.fields, group.columns)}
          </div>
        ))}

        {/* Hint específico para notas */}
        {entityType === 'notes' && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            💡 Puedes usar HTML básico para formatear tu texto (negrita, cursiva, listas, etc.)
          </p>
        )}
      </div>

    </form>
  )
}

export default React.memo(DynamicForm)