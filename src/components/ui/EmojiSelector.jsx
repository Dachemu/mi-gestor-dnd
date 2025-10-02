import React, { useState, useRef, useEffect } from 'react'
import { EMOJI_CATEGORIES } from '../../constants/emojiLibrary'
import { COMMON_STYLES } from '../../utils/cssHelpers'
import { useHoverStyle } from '../../hooks/useHoverStyle'

/**
 * Selector de emojis compacto que se puede integrar al lado de campos
 */
function EmojiSelector({ value, onChange, name, entityType }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('personas')
  const modalRef = useRef(null)

  // Estilos con hover para el botón principal
  const { style: buttonStyle, handlers: buttonHandlers } = useHoverStyle(
    {
      ...COMMON_STYLES.darkBackground,
      ...COMMON_STYLES.transition,
      padding: '0.5rem',
      fontSize: '1.25rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '40px',
      height: '40px'
    },
    {
      background: 'rgba(31, 41, 55, 0.9)',
      borderColor: 'rgba(107, 114, 128, 0.5)'
    }
  )

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey)
      // Prevenir scroll en el body
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
      document.body.style.overflow = 'unset'
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

  const currentEmoji = value || '🐉'

  return (
    <div className="emoji-selector-container" style={{ position: 'relative' }}>
      {/* Botón para abrir el selector */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={buttonStyle}
        {...buttonHandlers}
      >
        {currentEmoji}
      </button>

      {/* Modal overlay para emoticonos */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          {/* Backdrop */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)'
            }}
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal content */}
          <div
            style={{
              position: 'relative',
              background: 'rgba(31, 41, 55, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(107, 114, 128, 0.3)',
              borderRadius: '12px',
              padding: 'clamp(1rem, 3vw, 1.5rem)',
              width: '100%',
              maxWidth: 'min(600px, 90vw)',
              maxHeight: '80vh',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)'
            }}
          >
            {/* Título del modal */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid rgba(107, 114, 128, 0.2)'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: 'clamp(1rem, 3vw, 1.25rem)',
                fontWeight: '600',
                color: 'white'
              }}>
                🎭 Elige un emoji
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(156, 163, 175, 1)',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  borderRadius: '4px',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = 'white'}
                onMouseLeave={(e) => e.target.style.color = 'rgba(156, 163, 175, 1)'}
              >
                ✕
              </button>
            </div>

            {/* Pestañas de categorías */}
            <div
            style={{
              display: 'flex',
              gap: 'clamp(0.125rem, 1vw, 0.25rem)',
              marginBottom: 'clamp(0.5rem, 2vw, 0.75rem)',
              padding: 'clamp(0.125rem, 1vw, 0.25rem)',
              background: 'rgba(17, 24, 39, 0.5)',
              borderRadius: '8px',
              overflowX: 'auto',
              flexWrap: 'wrap'
            }}
          >
            {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedCategory(key)}
                style={{
                  padding: 'clamp(0.25rem, 1.5vw, 0.375rem) clamp(0.5rem, 2vw, 0.75rem)',
                  borderRadius: '6px',
                  fontSize: 'clamp(0.65rem, 2vw, 0.8rem)',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'all 0.15s ease',
                  background: selectedCategory === key ? 'var(--primary)' : 'transparent',
                  color: selectedCategory === key ? 'white' : 'rgba(156, 163, 175, 1)',
                  minHeight: '32px'
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(50px, 1fr))',
              gap: 'clamp(0.25rem, 1.5vw, 0.5rem)',
              maxHeight: 'clamp(300px, 60vh, 450px)',
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
                  padding: 'clamp(0.375rem, 2vw, 0.625rem)',
                  borderRadius: '10px',
                  fontSize: 'clamp(1.25rem, 4vw, 2rem)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: 'transparent',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '50px',
                  minWidth: '50px'
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
        </div>
      )}
    </div>
  )
}

export default React.memo(EmojiSelector)