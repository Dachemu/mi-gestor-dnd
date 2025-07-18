import React, { useState } from 'react'
import { validateEntity } from '../config/entityTypes.js'
import RichTextEditor from './RichTextEditor'
import IconSelector from './IconSelector'

/**
 * Componente de formulario dinámico que genera formularios basado en esquemas
 * Reemplaza todos los componentes Form específicos (PlayerForm, QuestForm, etc.)
 * Maneja validación automática y diferentes tipos de campos
 */
function DynamicForm({ entityType, config, item, onSave, onClose, showButtons = true }) {
  // Función para inyectar botones compactos en el header del modal (solo para creación)
  const injectCreateButtons = () => {
    // Solo inyectar botones si es un formulario de creación (no edición)
    if (!item && showButtons) {
      const actionContainer = document.getElementById('modal-compact-actions')
      if (!actionContainer) return
      
      // Limpiar contenido previo
      actionContainer.innerHTML = ''
      
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
      cancelButton.addEventListener('click', onClose)
      actionContainer.appendChild(cancelButton)
    }
  }
  
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
              {renderField(fieldName, fieldConfig)}
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
          { fields: ['name', 'playerName'], columns: 2 },
          { fields: ['class', 'race', 'level'], columns: 3 },
          { fields: ['background'] },
          { fields: ['avatar'], columns: 1 },
          { fields: ['description'] },
          { fields: ['hitPoints', 'armorClass', 'speed'], columns: 3 },
          { fields: ['notes'] }
        )
        break

      case 'quests':
        groups.push(
          { fields: ['name'] },
          { fields: ['icon'] },
          { fields: ['description'] },
          { fields: ['status', 'priority'], columns: 2 },
          { fields: ['location'] },
          { fields: ['reward'] },
          { fields: ['notes'] }
        )
        break

      case 'objects':
        groups.push(
          { fields: ['name'] },
          { fields: ['icon'] },
          { fields: ['type', 'rarity'], columns: 2 },
          { fields: ['description'] },
          { fields: ['properties'] },
          { fields: ['owner', 'location'], columns: 2 }
        )
        break

      case 'npcs':
        groups.push(
          { fields: ['name'] },
          { fields: ['icon'] },
          { fields: ['role'] },
          { fields: ['description'] },
          { fields: ['location'] },
          { fields: ['attitude'] },
          { fields: ['notes'] }
        )
        break

      case 'locations':
        groups.push(
          { fields: ['name'] },
          { fields: ['icon'] },
          { fields: ['description'] },
          { fields: ['importance'] },
          { fields: ['inhabitants'] },
          { fields: ['notes'] }
        )
        break

      case 'notes':
        groups.push(
          { fields: ['title', 'category'], columns: 2 },
          { fields: ['icon'] },
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
  
  // Efecto para inyectar botones cuando se monta el componente
  React.useEffect(() => {
    const timer = setTimeout(() => {
      injectCreateButtons()
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <form onSubmit={handleSubmit}>
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

      {/* Botones - ocultos ya que ahora se manejan desde el header del modal */}
      <div style={{ display: 'none' }}>
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn-primary"
        >
          {item ? '💾 Guardar Cambios' : `➕ Crear ${config.name}`}
        </button>
      </div>
    </form>
  )
}

export default React.memo(DynamicForm)