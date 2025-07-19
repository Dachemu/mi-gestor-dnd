import React from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import useDropdown from '../hooks/useDropdown'

/**
 * Base component for dropdown selectors (emojis, icons, etc.)
 * Unifies common functionality between EmojiSelector and IconSelector
 */
function BaseSelector({ 
  value, 
  onChange, 
  name, 
  options = [], 
  groups = null,
  placeholder = 'Seleccionar...',
  selectedText = null,
  renderOption = null,
  showGroups = false,
  label = null,
  className = '',
  ...props 
}) {
  const { isOpen, toggleDropdown, closeDropdown, dropdownRef, buttonRef } = useDropdown()

  const handleSelect = (option) => {
    onChange({ target: { name, value: option } })
    closeDropdown()
  }

  const getDisplayText = () => {
    if (selectedText) return selectedText
    if (value) return `${value} Seleccionado`
    return placeholder
  }

  const renderOptionContent = (option) => {
    if (renderOption) return renderOption(option)
    return option
  }

  const renderOptionsGrid = (optionsList, gridKey = '') => (
    <div 
      key={gridKey}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))',
        gap: '0.5rem'
      }}
    >
      {optionsList.map((option, index) => (
        <button
          key={`${gridKey}-${index}`}
          type="button"
          onClick={() => handleSelect(option)}
          style={{
            background: value === option ? 'rgba(139, 92, 246, 0.3)' : 'rgba(31, 41, 55, 0.6)',
            border: value === option ? '2px solid rgba(139, 92, 246, 0.6)' : '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: '8px',
            padding: '0.5rem',
            cursor: 'pointer',
            fontSize: '1.2rem',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            aspectRatio: '1',
            minHeight: '40px',
            color: 'white'
          }}
          onMouseEnter={(e) => {
            if (value !== option) {
              e.target.style.background = 'rgba(139, 92, 246, 0.2)'
              e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)'
              e.target.style.transform = 'scale(1.05)'
            }
          }}
          onMouseLeave={(e) => {
            if (value !== option) {
              e.target.style.background = 'rgba(31, 41, 55, 0.6)'
              e.target.style.borderColor = 'rgba(139, 92, 246, 0.2)'
              e.target.style.transform = 'scale(1)'
            }
          }}
          title={`Seleccionar ${option}`}
        >
          {renderOptionContent(option)}
        </button>
      ))}
    </div>
  )

  return (
    <div className={`base-selector ${className}`}>
      {label && (
        <label style={{
          display: 'block',
          color: 'white',
          fontSize: '0.9rem',
          fontWeight: '600',
          marginBottom: '0.5rem'
        }}>
          {label}
        </label>
      )}
      
      <div style={{ position: 'relative', width: '100%' }}>
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleDropdown}
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
          onFocus={(e) => {
            e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)'
          }}
          onBlur={(e) => {
            e.target.style.boxShadow = 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ 
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              background: 'rgba(139, 92, 246, 0.2)',
              borderRadius: '6px',
              flexShrink: 0
            }}>
              {value || '❓'}
            </span>
            <span style={{ flex: 1, textAlign: 'left' }}>
              {getDisplayText()}
            </span>
          </div>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isOpen && (
          <div
            ref={dropdownRef}
            style={{
              position: 'absolute',
              top: 'calc(100% + 0.5rem)',
              left: 0,
              right: 0,
              background: 'rgba(15, 15, 25, 0.98)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '12px',
              padding: '1rem',
              maxHeight: '300px',
              overflowY: 'auto',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
              zIndex: 1000,
              animation: 'slideDown 0.2s ease-out'
            }}
          >
            {showGroups && groups ? (
              // Render grouped options
              groups.map((group, groupIndex) => (
                <div key={groupIndex} style={{ marginBottom: '1rem' }}>
                  {group.title && (
                    <div style={{
                      color: '#8b5cf6',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      padding: '0 0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {group.title}
                    </div>
                  )}
                  {renderOptionsGrid(group.options, `group-${groupIndex}`)}
                </div>
              ))
            ) : (
              // Render simple options list
              renderOptionsGrid(options, 'simple')
            )}
          </div>
        )}
      </div>

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

        /* Scrollbar personalizada */
        .base-selector div::-webkit-scrollbar {
          width: 6px;
        }

        .base-selector div::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 3px;
        }

        .base-selector div::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 3px;
        }

        .base-selector div::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }

        @media (max-width: 768px) {
          .base-selector div[style*="grid-template-columns"] {
            grid-template-columns: repeat(auto-fill, minmax(36px, 1fr)) !important;
            gap: 0.25rem !important;
          }
        }
      `}</style>
    </div>
  )
}

export default BaseSelector