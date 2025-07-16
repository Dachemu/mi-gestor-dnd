import React, { useState } from 'react'
import { validateEntity } from '../config/entityTypes.js'
import RichTextEditor from './RichTextEditor'
import EmojiSelector from './EmojiSelector'

/**
 * Componente de formulario dinámico que genera formularios basado en esquemas
 * Reemplaza todos los componentes Form específicos (PlayerForm, QuestForm, etc.)
 * Maneja validación automática y diferentes tipos de campos
 */
function DynamicForm({ entityType, config, item, onSave, onClose }) {
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
        // Campos especiales de icono/avatar usan EmojiSelector
        if (fieldName === 'icon' || fieldName === 'avatar') {
          return (
            <EmojiSelector
              name={fieldName}
              value={formData[fieldName] || ''}
              onChange={handleChange}
              entityType={entityType}
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
              <label style={{ 
                color: 'white', 
                fontWeight: '600', 
                marginBottom: '0.5rem', 
                display: 'block' 
              }}>
                {fieldConfig.label} {fieldConfig.required && '*'}
              </label>
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
          { fields: ['owner', 'location'], columns: 2 },
          { fields: ['notes'] }
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

      {/* Botones */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginTop: '2rem',
        justifyContent: 'flex-end'
      }}>
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

export default DynamicForm