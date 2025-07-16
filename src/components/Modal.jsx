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

  // Determinar tamaños del modal con mejor responsividad
  const sizes = {
    small: { width: 'min(90vw, 400px)', maxHeight: '85vh' },
    medium: { width: 'min(85vw, 700px)', maxHeight: '85vh' },
    large: { width: 'min(90vw, 1000px)', maxHeight: '90vh' },
    xlarge: { width: 'min(95vw, 1200px)', maxHeight: '90vh' }
  }

  const modalSize = sizes[size] || sizes.medium

  return (
    <div 
      className="modal-container"
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
        zIndex: 9999,
        padding: 'clamp(0.5rem, 2vw, 2rem)',
        overflowY: 'auto',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(15, 15, 25, 0.98) 0%, rgba(26, 26, 46, 0.95) 100%)',
          borderRadius: '20px',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          boxShadow: '0 32px 64px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          width: '100%',
          maxWidth: modalSize.width,
          maxHeight: modalSize.maxHeight,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInScale 0.3s ease-out',
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradiente decorativo superior */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #8b5cf6, #3b82f6, #10b981, #f59e0b, #ec4899)',
          borderRadius: '20px 20px 0 0'
        }} />
        
        {/* Header del modal */}
        {(title || showCloseButton) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '2rem 2.5rem',
            borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
            borderRadius: '20px 20px 0 0',
            position: 'relative'
          }}>
            {title && (
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                margin: 0,
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
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
        <div 
          className="modal-content"
          style={{
            padding: 'clamp(1.5rem, 3vw, 2.5rem)',
            paddingBottom: 'clamp(2rem, 4vw, 3rem)',
            overflowY: 'auto',
            flex: 1,
            maxHeight: 'calc(100vh - 8rem)',
            background: 'rgba(15, 15, 25, 0.2)',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(139, 92, 246, 0.3) transparent'
          }}>
          {children}
          
          {/* Espaciador invisible para asegurar scroll completo */}
          <div style={{ height: '1rem', visibility: 'hidden' }} />
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

        /* Scrollbar personalizada para Webkit */
        .modal-content::-webkit-scrollbar {
          width: 6px;
        }
        
        .modal-content::-webkit-scrollbar-track {
          background: rgba(15, 15, 25, 0.5);
          border-radius: 3px;
        }
        
        .modal-content::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 3px;
        }
        
        .modal-content::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }

        @media (max-width: 768px) {
          .modal-container {
            align-items: flex-start !important;
            padding-top: 2rem !important;
          }
        }
      `}</style>
    </div>
  )
}

export default Modal