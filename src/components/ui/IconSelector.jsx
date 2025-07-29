import React from 'react'
import BaseSelector from './BaseSelector'

/**
 * Selector de iconos temáticos para D&D
 * Usa BaseSelector para funcionalidad unificada con grupos
 */
function IconSelector({ value, onChange, name, entityType, label = 'Icono' }) {
  // Iconos temáticos por categoría
  const iconCategories = {
    players: {
      name: 'Personajes',
      icons: [
        '⚔️', '🏹', '🛡️', '🗡️', '🏺', '🎭', '👑', '🧙‍♂️', '🧙‍♀️', '🧝‍♂️', 
        '🧝‍♀️', '🧔', '👩‍🦰', '👨‍🦱', '👩‍🦱', '🧿', '⭐', '🔮', '📿', '🎯'
      ]
    },
    quests: {
      name: 'Misiones',
      icons: [
        '📜', '🗞️', '📋', '📝', '🎯', '🏆', '💎', '👑', '🗝️', '🏺', 
        '⚔️', '🛡️', '🏹', '🗡️', '🔍', '🧭', '🗺️', '📍', '🏰', '🌟'
      ]
    },
    objects: {
      name: 'Objetos',
      icons: [
        '📦', '💎', '👑', '🗝️', '🏺', '⚔️', '🛡️', '🏹', '🗡️', '🔮', 
        '📿', '💍', '🧿', '📜', '📋', '🍾', '🧪', '💰', '🪙', '💳'
      ]
    },
    npcs: {
      name: 'NPCs',
      icons: [
        '🧙‍♂️', '🧙‍♀️', '👤', '👥', '🧔', '👩‍🦰', '👨‍🦱', '👩‍🦱', '🧝‍♂️', '🧝‍♀️', 
        '👑', '🎭', '🛡️', '⚔️', '🏹', '🗡️', '🔮', '📿', '🧿', '🎯'
      ]
    },
    locations: {
      name: 'Lugares',
      icons: [
        '🏰', '🏛️', '🏞️', '🌲', '🏔️', '🗻', '🏖️', '🏝️', '🌋', '🏜️', 
        '🏕️', '🏗️', '🏘️', '🏙️', '🌉', '🗼', '🎡', '🎢', '⛪', '🕌'
      ]
    },
    notes: {
      name: 'Notas',
      icons: [
        '📝', '📋', '📜', '🗞️', '📄', '📃', '📑', '🗒️', '🗓️', '📅', 
        '📆', '🗂️', '📁', '📂', '🗃️', '📊', '📈', '📉', '💡', '🔍'
      ]
    },
    general: {
      name: 'General',
      icons: [
        '⚔️', '🛡️', '🏹', '🗡️', '🔮', '📿', '💎', '👑', '🗝️', '🏺', 
        '🧙‍♂️', '🧙‍♀️', '🧝‍♂️', '🧝‍♀️', '🏰', '🗺️', '📜', '💰', '🌟', '🎯'
      ]
    }
  }

  // Obtener iconos para el tipo de entidad actual
  const getIconsForEntity = () => {
    const entityIcons = iconCategories[entityType]
    const generalIcons = iconCategories.general
    
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