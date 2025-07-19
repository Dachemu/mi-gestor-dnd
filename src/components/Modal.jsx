import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

/**
 * Modal completamente nuevo con enfoque bulletproof para evitar cortes
 */
function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium',
  showCloseButton = true 
}) {
  const modalRef = useRef(null)
  const contentRef = useRef(null)

  // Configuración de tamaños más conservadora y responsive
  const sizes = {
    small: { width: 'min(95vw, 400px)' },
    medium: { width: 'min(95vw, 700px)' },
    large: { width: 'min(98vw, 1000px)' },
    xlarge: { width: 'min(98vw, 1200px)' }
  }

  const modalSize = sizes[size] || sizes.medium

  // Manejar escape y garantizar posicionamiento correcto
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    
    // Forzar el modal a aparecer en el centro de la viewport visible
    const positionModal = () => {
      const modalOverlay = document.querySelector('[data-modal-overlay]')
      if (modalOverlay) {
        // Resetear cualquier transform previo
        modalOverlay.style.transform = 'none'
        modalOverlay.style.position = 'fixed'
        modalOverlay.style.top = '0'
        modalOverlay.style.left = '0'
        modalOverlay.style.width = '100vw'
        modalOverlay.style.height = '100vh'
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    
    // Aplicar posicionamiento inmediatamente y después de un frame
    positionModal()
    requestAnimationFrame(positionModal)
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // Scroll al inicio del modal cuando se abre
  useEffect(() => {
    if (!isOpen || !contentRef.current) return

    const timer = setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.scrollTop = 0
      }
    }, 50)

    return () => clearTimeout(timer)
  }, [isOpen, children])

  if (!isOpen) return null

  const modalContent = (
    <>
      {/* Overlay que siempre se centra en la viewport */}
      <div 
        data-modal-overlay
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999999,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          boxSizing: 'border-box',
          overflowY: 'auto',
          overflowX: 'hidden',
          isolation: 'isolate'
        }}
        onClick={onClose}
      >
        {/* Modal container */}
        <div 
          ref={modalRef}
          style={{
            background: 'linear-gradient(135deg, rgba(15, 15, 25, 0.98) 0%, rgba(26, 26, 46, 0.95) 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            boxShadow: '0 32px 64px rgba(0, 0, 0, 0.8)',
            width: '100%',
            maxWidth: modalSize.width,
            maxHeight: '90vh', // Usar más espacio vertical
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            boxSizing: 'border-box',
            backdropFilter: 'blur(25px)',
            animation: 'modalFadeIn 0.2s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gradiente decorativo */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #8b5cf6, #3b82f6, #10b981, #f59e0b, #ec4899)',
            borderRadius: '20px 20px 0 0'
          }} />
          
          {/* Header */}
          {(title || showCloseButton) && (
            <div 
              className="modal-header-new"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'clamp(1rem, 4vw, 2rem) clamp(1rem, 5vw, 2.5rem)',
                borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                borderRadius: '20px 20px 0 0',
                flexShrink: 0,
                boxSizing: 'border-box'
              }}
            >
              {title && (
                <h2 style={{
                  fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  margin: 0
                }}>
                  {title}
                </h2>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {/* Container para botones compactos de edición/eliminación */}
                <div 
                  id="modal-compact-actions"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem' 
                  }}
                />
                
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#9ca3af',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div 
            ref={contentRef}
            style={{
              padding: 'clamp(1rem, 3vw, 1.5rem) clamp(1rem, 4vw, 2rem) clamp(1.5rem, 4vw, 2rem)',
              flex: 1,
              minHeight: 0,
              overflow: 'auto', // Permitir scroll si es necesario
              boxSizing: 'border-box'
            }}
          >
            {children}
          </div>
        </div>
      </div>

      {/* Estilos con keyframes */}
      <style jsx>{`
        @keyframes modalFadeIn {
          from { 
            opacity: 0; 
            transform: scale(0.95) translateY(-20px);
          }
          to { 
            opacity: 1; 
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </>
  )

  // Usar portal para montar directamente en body y evitar problemas de scroll
  return createPortal(modalContent, document.body)
}

export default Modal