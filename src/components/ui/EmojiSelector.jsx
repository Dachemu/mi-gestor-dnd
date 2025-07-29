import React, { useState, useRef, useEffect } from 'react'

// Categorías de emojis SIN duplicados - cada emoji aparece solo en UNA categoría
const EMOJI_CATEGORIES = {
  personas: {
    name: 'Personas',
    emojis: [
      '🧙', '🧙‍♀️', '🧙‍♂️', '🤴', '👸', '🧝', '🧝‍♀️', '🧝‍♂️', 
      '🧛', '🧛‍♀️', '🧛‍♂️', '🧚', '🧚‍♀️', '🧚‍♂️', '🧞', '🧞‍♀️', '🧞‍♂️',
      '🧟', '🧟‍♀️', '🧟‍♂️', '🦸', '🦸‍♀️', '🦸‍♂️', '🦹', '🦹‍♀️', '🦹‍♂️',
      '🤺', '🥷', '💂', '💂‍♀️', '💂‍♂️', '👷', '👷‍♀️', '👷‍♂️',
      '🕵️', '🕵️‍♀️', '🕵️‍♂️', '👨‍⚕️', '👩‍⚕️', '🧑‍⚕️', '👨‍🌾', '👩‍🌾', '🧑‍🌾',
      '👨‍🍳', '👩‍🍳', '🧑‍🍳', '👨‍🏫', '👩‍🏫', '🧑‍🏫', '👨‍⚖️', '👩‍⚖️', '🧑‍⚖️',
      '🧔', '🧔‍♀️', '🧔‍♂️', '👲', '👳', '👳‍♀️', '👳‍♂️', '🧕',
      '👮', '👮‍♀️', '👮‍♂️', '👴', '👵', '🧓', '👶', '👧', '🧒', '👦',
      '👱', '👱‍♀️', '👱‍♂️'
    ]
  },
  lugares: {
    name: 'Lugares',
    emojis: [
      '🏰', '🏯', '🗼', '⛪', '🕌', '🛕', '🕍', '⛩️', '🏛️', '🗿',
      '🏚️', '🏘️', '🏙️', '🌋', '⛰️', '🏔️', '🗻', '🏞️', '🏜️', '🏖️',
      '🏝️', '🌊', '🌅', '🌄', '🌃', '🌌', '🌉', '🏟️',
      '🏗️', '🧱', '🪨', '🪵', '🏕️', '🛖', '⛺', '🌁', '🌆', '🌇',
      '💒', '🏩', '🏨', '🏦', '🏪', '🏬', '🏣', '🏤', '🏥', '🏢',
      '🏭', '🏡', '🏠', '⛲', '🌳', '🌲', '🌴', '🌵', '🌾', '🌿',
      '☘️', '🍀', '🍄', '🌰', '🌍', '🌎', '🌏', '🌐', '🗺️', '🧭'
    ]
  },
  magia: {
    name: 'Magia',
    emojis: [
      '🔮', '🎱', '🧿', '🪬', '💫', '⭐', '🌟',
      '✨', '⚡', '💥', '☄️', '🌠', '🌈', '🎆', '🎇',
      '🎃', '👻', '💀', '☠️', '👹', '👺', '😈', '👿', '🦄',
      '🐉', '🐲', '🪔', '🪄', '🔱', '💎', '💍', '👑',
      '♟️', '🃏', '🀄', '🎴', '🧩', '🪅', '🪆'
    ]
  },
  naturaleza: {
    name: 'Naturaleza',
    emojis: [
      '🐺', '🦅', '🦉', '🦇', '🐗', '🦌', '🦏', '🦛', '🐘', '🦒',
      '🦘', '🦬', '🐃', '🐂', '🐄', '🐎', '🦓', '🦍', '🦧', '🐆',
      '🐅', '🦁', '🐯', '🐈', '🐈‍⬛', '🦝', '🦨', '🦡', '🦫', '🦦',
      '🦥', '🐁', '🐀', '🐿️', '🦔', '🐇', '🐰', '🦎', '🐍', '🐢',
      '🐊', '🦕', '🦖', '🦂', '🕷️', '🕸️', '🐝', '🪲', '🐞', '🦗',
      '🪰', '🪱', '🦟', '🦠', '🐙', '🦑', '🦀', '🦞', '🦐', '🦪',
      '🐚', '🐠', '🐟', '🐡', '🐋', '🦈', '🦭', '🦢', '🦚', '🦜',
      '🦩', '🕊️', '🦃', '🦆'
    ]
  },
  objetos: {
    name: 'Objetos',
    emojis: [
      '⚔️', '🗡️', '🛡️', '🏹', '🪓', '🔨', '⛏️', '🪝', 
      '💣', '🧨', '🔥', '💰', '💵', '🪙', '🎩',
      '🎓', '⛑️', '🪖', '📿', '🔔', '🎺', '🥁', '🪘', '🪕', '🎻',
      '🪈', '🎸', '🎹', '🎵', '🎶', '🎼', '🎤', '🎧', '📻', '🎮',
      '🕹️', '🎰', '🎲', '🎯', '🎳', '🪀', '🪁', '🏆', '🏅',
      '🥇', '🥈', '🥉', '🎖️', '🏵️', '🎗️', '🎫', '🎟️', '🗝️', '🔑',
      '🔐', '🔒', '🔓', '🔏', '🧰', '🪛', '🔧', '🔩', '⚙️', '🧲',
      '🔫', '🏺', '🕯️', '💡', '🔦', '🏮', '🪟', '🪜', '🧯',
      '🛢️', '⚱️', '🪦', '⚰️', '🚬', '🔬', '🔭', '📡', '💉', '🩸',
      '💊', '🩹', '🩺', '🧬', '🧪', '🧫', '⚗️', '📜', '📋', '📊',
      '📈', '📉', '📚', '📖', '📕', '📗', '📘', '📙', '📓', '📔',
      '📒', '📝', '✏️', '✒️', '🖋️', '🖊️', '🖌️', '🖍️', '🎪', '🎭', '🎨', '🖼️'
    ]
  }
}

/**
 * Selector de emojis compacto que se puede integrar al lado de campos
 */
function EmojiSelector({ value, onChange, name, entityType }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('personas')
  const [dropdownPosition, setDropdownPosition] = useState('bottom')
  const dropdownRef = useRef(null)
  const buttonRef = useRef(null)
  
  // Calcular posición óptima del dropdown
  const calculateDropdownPosition = () => {
    if (!buttonRef.current) return
    
    const buttonRect = buttonRef.current.getBoundingClientRect()
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    }
    
    // Altura estimada del dropdown
    const dropdownHeight = 500 // altura aproximada del dropdown
    const spaceBelow = viewport.height - buttonRect.bottom
    const spaceAbove = buttonRect.top
    
    // Si hay más espacio arriba y poco espacio abajo, abrir hacia arriba
    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      setDropdownPosition('top')
    } else {
      setDropdownPosition('bottom')
    }
  }

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      calculateDropdownPosition()
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleEmojiSelect = (emoji) => {
    // Simular evento para compatibilidad con DynamicForm
    const event = {
      target: {
        name,
        value: emoji
      }
    }
    onChange(event)
    setIsOpen(false)
  }

  const currentEmoji = value || '😀'

  return (
    <div className="emoji-selector-container" ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Botón para abrir el selector */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'rgba(31, 41, 55, 0.8)',
          border: '1px solid rgba(107, 114, 128, 0.3)',
          borderRadius: '8px',
          padding: '0.5rem',
          fontSize: '1.25rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '40px',
          height: '40px'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(31, 41, 55, 0.9)'
          e.target.style.borderColor = 'rgba(107, 114, 128, 0.5)'
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(31, 41, 55, 0.8)'
          e.target.style.borderColor = 'rgba(107, 114, 128, 0.3)'
        }}
      >
        {currentEmoji}
      </button>

      {/* Dropdown desplegable */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            ...(dropdownPosition === 'top' 
              ? { bottom: '100%', marginBottom: '0.5rem' } 
              : { top: '100%', marginTop: '0.5rem' }
            ),
            right: '0', // Alinear a la derecha para evitar salirse del modal
            zIndex: 1000,
            background: 'rgba(31, 41, 55, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(107, 114, 128, 0.3)',
            borderRadius: '12px',
            padding: '1rem',
            minWidth: '520px',
            maxWidth: '600px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            // Asegurar que no se salga del viewport
            transform: 'translateX(-50px)' // Offset hacia la izquierda para evitar desbordamiento
          }}
        >
          {/* Pestañas de categorías */}
          <div
            style={{
              display: 'flex',
              gap: '0.25rem',
              marginBottom: '0.75rem',
              padding: '0.25rem',
              background: 'rgba(17, 24, 39, 0.5)',
              borderRadius: '8px',
              overflowX: 'auto'
            }}
          >
            {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedCategory(key)}
                style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'all 0.15s ease',
                  background: selectedCategory === key ? 'var(--primary)' : 'transparent',
                  color: selectedCategory === key ? 'white' : 'rgba(156, 163, 175, 1)'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== key) {
                    e.target.style.background = 'rgba(79, 70, 229, 0.1)'
                    e.target.style.color = 'rgba(203, 213, 225, 1)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== key) {
                    e.target.style.background = 'transparent'
                    e.target.style.color = 'rgba(156, 163, 175, 1)'
                  }
                }}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Grid de emojis */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gap: '0.2rem',
              maxHeight: '400px',
              overflowY: 'auto',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(107, 114, 128, 0.5) transparent'
            }}
          >
            {EMOJI_CATEGORIES[selectedCategory].emojis.map((emoji, idx) => (
              <button
                key={`emoji-${selectedCategory}-${idx}`}
                type="button"
                onClick={() => handleEmojiSelect(emoji)}
                style={{
                  aspectRatio: '1',
                  padding: '0.375rem',
                  borderRadius: '6px',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: 'transparent',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(79, 70, 229, 0.2)'
                  e.target.style.transform = 'scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent'
                  e.target.style.transform = 'scale(1)'
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default React.memo(EmojiSelector)