import React, { useEffect } from 'react'
import { X } from 'lucide-react'

/**
 * Componente Modal reutilizable con overlay
 * Diseñado para mostrar formularios y detalles por encima del contenido principal
 */
function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium',
  showCloseButton = true 
}) {
  // Cerrar con tecla Escape y manejar scrolls
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      
      // Prevenir scroll del body Y de la campaña cuando el modal está abierto
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = '0px' // Evitar salto por scrollbar
      
      // También prevenir scroll en el container principal
      const campaignContent = document.querySelector('.campaign-content')
      const campaignManager = document.querySelector('.campaign-manager')
      
      if (campaignContent) {
        campaignContent.style.overflow = 'hidden'
        campaignContent.style.height = '100vh'
      }
      if (campaignManager) {
        campaignManager.style.overflow = 'hidden'
      }
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      
      // Restaurar scroll en containers
      const campaignContent = document.querySelector('.campaign-content')
      const campaignManager = document.querySelector('.campaign-manager')
      
      if (campaignContent) {
        campaignContent.style.overflow = ''
        campaignContent.style.height = ''
      }
      if (campaignManager) {
        campaignManager.style.overflow = ''
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Determinar tamaños del modal
  const sizes = {
    small: { width: '400px', maxHeight: '80vh' },
    medium: { width: '600px', maxHeight: '85vh' },
    large: { width: '800px', maxHeight: '90vh' },
    xlarge: { width: '1000px', maxHeight: '95vh' }
  }

  const modalSize = sizes[size] || sizes.medium

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '2rem',
        overflowY: 'auto',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
          width: '100%',
          maxWidth: modalSize.width,
          maxHeight: modalSize.maxHeight,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInScale 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del modal */}
        {(title || showCloseButton) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.5rem 2rem',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '12px 12px 0 0'
          }}>
            {title && (
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: 'white',
                margin: 0
              }}>
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--bg-secondary)'
                  e.target.style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent'
                  e.target.style.color = 'var(--text-muted)'
                }}
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Contenido del modal */}
        <div style={{
          padding: '2rem',
          paddingBottom: '3rem', // Extra padding para asegurar que los botones sean visibles
          overflowY: 'auto',
          flex: 1,
          maxHeight: '100%'
        }}>
          {children}
          
          {/* Espaciador invisible para asegurar scroll completo */}
          <div style={{ height: '2rem', visibility: 'hidden' }} />
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInScale {
          from { 
            opacity: 0; 
            transform: scale(0.95) translateY(-10px); 
          }
          to { 
            opacity: 1; 
            transform: scale(1) translateY(0); 
          }
        }
      `}</style>
    </div>
  )
}

export default Modal