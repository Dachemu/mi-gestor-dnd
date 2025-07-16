import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

/**
 * Selector de iconos temáticos para D&D
 * Reemplaza el campo de texto plano con un selector visual
 */
function IconSelector({ value, onChange, name, entityType, label = 'Icono' }) {
  const [isOpen, setIsOpen] = useState(false)

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
        { category: entityIcons.name, icons: entityIcons.icons },
        { category: generalIcons.name, icons: generalIcons.icons }
      ]
    }
    
    return [{ category: generalIcons.name, icons: generalIcons.icons }]
  }

  const iconGroups = getIconsForEntity()

  const handleIconSelect = (icon) => {
    onChange({ target: { name, value: icon } })
    setIsOpen(false)
  }

  return (
    <div className="icon-selector">
      <label className="icon-selector-label">{label}</label>
      
      <div className="icon-selector-container">
        <button
          type="button"
          className="icon-selector-button"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="selected-icon">{value || '📦'}</span>
          <span className="selected-text">
            {value ? `${value} Seleccionado` : 'Seleccionar icono...'}
          </span>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isOpen && (
          <div className="icon-selector-dropdown">
            {iconGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="icon-group">
                <div className="icon-group-title">{group.category}</div>
                <div className="icon-grid">
                  {group.icons.map((icon, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`icon-option ${value === icon ? 'selected' : ''}`}
                      onClick={() => handleIconSelect(icon)}
                      title={`Seleccionar ${icon}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .icon-selector {
          margin-bottom: 1rem;
        }

        .icon-selector-label {
          display: block;
          color: white;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .icon-selector-container {
          position: relative;
        }

        .icon-selector-button {
          width: 100%;
          background: rgba(31, 41, 55, 0.8);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 10px;
          padding: 0.75rem 1rem;
          color: white;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .icon-selector-button:hover {
          background: rgba(31, 41, 55, 0.95);
          border-color: #8b5cf6;
        }

        .icon-selector-button:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        .selected-icon {
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: rgba(139, 92, 246, 0.2);
          border-radius: 6px;
          flex-shrink: 0;
        }

        .selected-text {
          flex: 1;
          text-align: left;
        }

        .icon-selector-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: rgba(15, 15, 25, 0.98);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 12px;
          z-index: 1000;
          max-height: 300px;
          overflow-y: auto;
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
          margin-top: 0.5rem;
          padding: 0.5rem;
        }

        .icon-group {
          margin-bottom: 1rem;
        }

        .icon-group:last-child {
          margin-bottom: 0;
        }

        .icon-group-title {
          color: #8b5cf6;
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          padding: 0 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .icon-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
          gap: 0.5rem;
        }

        .icon-option {
          background: rgba(31, 41, 55, 0.6);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 8px;
          padding: 0.5rem;
          font-size: 1.2rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          aspect-ratio: 1;
        }

        .icon-option:hover {
          background: rgba(139, 92, 246, 0.2);
          border-color: rgba(139, 92, 246, 0.5);
          transform: scale(1.05);
        }

        .icon-option.selected {
          background: rgba(139, 92, 246, 0.3);
          border-color: #8b5cf6;
          color: white;
        }

        /* Scrollbar personalizada */
        .icon-selector-dropdown::-webkit-scrollbar {
          width: 6px;
        }

        .icon-selector-dropdown::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 3px;
        }

        .icon-selector-dropdown::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 3px;
        }

        .icon-selector-dropdown::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }

        @media (max-width: 768px) {
          .icon-grid {
            grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
            gap: 0.25rem;
          }

          .icon-option {
            padding: 0.4rem;
            font-size: 1.1rem;
          }

          .icon-selector-dropdown {
            max-height: 250px;
          }
        }
      `}</style>
    </div>
  )
}

export default IconSelector