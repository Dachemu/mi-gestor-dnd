import React from 'react'
import BaseSelector from './BaseSelector'
import { ICON_CATEGORIES } from '../../constants/emojiLibrary'

/**
 * Selector de iconos temáticos para D&D
 * Usa BaseSelector para funcionalidad unificada con grupos
 */
function IconSelector({ value, onChange, name, entityType, label = 'Icono' }) {

  // Obtener iconos para el tipo de entidad actual
  const getIconsForEntity = () => {
    const entityIcons = ICON_CATEGORIES[entityType]
    const generalIcons = ICON_CATEGORIES.general
    
    if (entityIcons) {
      return [
        { title: entityIcons.name, options: entityIcons.icons },
        { title: generalIcons.name, options: generalIcons.icons }
      ]
    }
    
    return [{ title: generalIcons.name, options: generalIcons.icons }]
  }

  const iconGroups = getIconsForEntity()

  return (
    <BaseSelector
      value={value}
      onChange={onChange}
      name={name}
      groups={iconGroups}
      showGroups={true}
      placeholder="Seleccionar icono..."
      selectedText={value ? `${value} Seleccionado` : null}
      label={label}
      className="icon-selector"
    />
  )
}

export default IconSelector