import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

const DND_EMOJIS = {
  players: ['⚔️', '🛡️', '🏹', '🗡️', '⚡', '🔥', '❄️', '🌟', '👑', '💎', '🧙‍♂️', '🧙‍♀️', '🤺', '🏃‍♂️', '🏃‍♀️'],
  npcs: ['👤', '🧙', '👑', '🛡️', '⚔️', '🏹', '💰', '📚', '🔮', '🧪', '🗝️', '👸', '🤴', '🧝‍♂️', '🧝‍♀️', '🧙‍♂️', '🧙‍♀️', '👮‍♂️', '👮‍♀️', '🛒'],
  objects: ['📦', '⚔️', '🛡️', '🏹', '💎', '💰', '🗝️', '📜', '🔮', '🧪', '💍', '👑', '🏺', '📚', '🗡️', '🪓', '🔨', '🏆', '💀', '🌟'],
  quests: ['📜', '🗡️', '🏰', '🐉', '👑', '💎', '🗝️', '🏆', '⚔️', '🛡️', '🌟', '🔥', '💀', '⚡', '🌊', '🌋', '🏔️', '🌲', '🕳️', '🗻'],
  locations: ['📍', '🏰', '🏛️', '🏕️', '🏪', '🏠', '🌲', '🏔️', '🌊', '🏞️', '🕳️', '⛰️', '🗻', '🌋', '🏝️', '🏖️', '🌴', '🏴‍☠️', '🗼', '🏯'],
  notes: ['📝', '📚', '📖', '📔', '📒', '📃', '📄', '🗒️', '📋', '📊', '📈', '📉', '🗂️', '📁', '🔖', '💡', '⭐', '🔥', '❗', '❓']
}

function EmojiSelector({ value, onChange, entityType, name }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const buttonRef = useRef(null)

  const emojis = DND_EMOJIS[entityType] || DND_EMOJIS.objects

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (emoji) => {
    onChange({ target: { name, value: emoji } })
    setIsOpen(false)
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          background: 'rgba(31, 41, 55, 0.6)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          color: 'white',
          fontSize: '1rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.2s ease',
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(31, 41, 55, 0.8)'
          e.target.style.borderColor = 'rgba(139, 92, 246, 0.4)'
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(31, 41, 55, 0.6)'
          e.target.style.borderColor = 'rgba(139, 92, 246, 0.2)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>
            {value || '❓'}
          </span>
          <span>
            {value ? 'Cambiar icono' : 'Seleccionar icono'}
          </span>
        </div>
        <ChevronDown 
          size={16} 
          style={{ 
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }} 
        />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.5rem)',
            left: 0,
            right: 0,
            background: 'rgba(31, 41, 55, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '12px',
            padding: '1rem',
            maxHeight: '200px',
            overflowY: 'auto',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            zIndex: 1000,
            animation: 'slideDown 0.2s ease-out'
          }}
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))',
            gap: '0.5rem'
          }}>
            {emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleSelect(emoji)}
                style={{
                  background: value === emoji ? 'rgba(139, 92, 246, 0.3)' : 'transparent',
                  border: value === emoji ? '2px solid rgba(139, 92, 246, 0.6)' : '1px solid rgba(139, 92, 246, 0.2)',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  aspectRatio: '1',
                  minHeight: '40px'
                }}
                onMouseEnter={(e) => {
                  if (value !== emoji) {
                    e.target.style.background = 'rgba(139, 92, 246, 0.1)'
                    e.target.style.borderColor = 'rgba(139, 92, 246, 0.4)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (value !== emoji) {
                    e.target.style.background = 'transparent'
                    e.target.style.borderColor = 'rgba(139, 92, 246, 0.2)'
                  }
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default EmojiSelector