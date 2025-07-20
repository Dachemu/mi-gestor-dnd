import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { BaseButton } from './index'
import styles from './BaseModal.module.css'

/**
 * BaseModal Component
 * 
 * Componente para modales y ventanas emergentes unificado.
 * Maneja overlay, animaciones, responsive design y accesibilidad.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onClose - Callback para cerrar el modal
 * @param {string} props.title - Título del modal
 * @param {React.ReactNode} props.children - Contenido del modal
 * @param {Object} props.size - Tamaño del modal ('sm'|'md'|'lg'|'xl'|'full')
 * @param {boolean} props.closeOnOverlay - Cerrar al hacer click en overlay (default: true)
 * @param {boolean} props.closeOnEscape - Cerrar al presionar Escape (default: true)
 * @param {boolean} props.showCloseButton - Mostrar botón X de cerrar (default: true)
 * @param {boolean} props.glassmorphism - Habilitar efecto glassmorphism (default: true)
 * @param {string} props.className - Clases CSS adicionales
 * @param {React.ReactNode} props.footer - Contenido del footer (botones de acción)
 * @param {boolean} props.centerContent - Centrar contenido verticalmente (default: false)
 * @param {number} props.zIndex - Z-index personalizado (default: 1000)
 * @param {Function} props.onOpen - Callback cuando se abre el modal
 * @param {Function} props.onAnimationEnd - Callback cuando termina la animación
 */
const BaseModal = ({
  isOpen = false,
  onClose = () => {},
  title = '',
  children,
  size = 'md',
  closeOnOverlay = true,
  closeOnEscape = true,
  showCloseButton = true,
  glassmorphism = true,
  className = '',
  footer = null,
  centerContent = false,
  zIndex = 1000,
  onOpen = () => {},
  onAnimationEnd = () => {},
  ...props
}) => {
  const modalRef = useRef(null)
  const overlayRef = useRef(null)

  // Efecto para manejar el escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeOnEscape, onClose])

  // Efecto para manejar el scroll del body
  useEffect(() => {
    if (isOpen) {
      // Store original styles
      const originalOverflow = document.body.style.overflow
      const originalHeight = document.body.style.height
      const originalPosition = document.body.style.position
      
      // Completely lock body scroll
      document.body.style.overflow = 'hidden'
      document.body.style.height = '100vh'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      document.body.style.top = '0'
      document.body.style.left = '0'
      
      onOpen()
      
      return () => {
        // Restore original styles
        document.body.style.overflow = originalOverflow
        document.body.style.height = originalHeight
        document.body.style.position = originalPosition
        document.body.style.width = ''
        document.body.style.top = ''
        document.body.style.left = ''
      }
    }
  }, [isOpen, onOpen])

  // Efecto para focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Enfocar el modal para accesibilidad
      modalRef.current.focus()
    }
  }, [isOpen])

  // Handler para click en overlay
  const handleOverlayClick = (e) => {
    if (closeOnOverlay && e.target === overlayRef.current) {
      onClose()
    }
  }

  // Handler para animación terminada
  const handleAnimationEnd = (e) => {
    if (e.target === modalRef.current) {
      onAnimationEnd()
    }
  }

  // No renderizar si no está abierto
  if (!isOpen) return null

  // Clases del modal
  const modalClasses = [
    styles.baseModal,
    styles[size],
    glassmorphism && styles.glassmorphism,
    centerContent && styles.centerContent,
    className
  ].filter(Boolean).join(' ')

  // Render modal content
  const modalContent = (
    <div
      ref={overlayRef}
      className={styles.modalOverlay}
      onClick={handleOverlayClick}
      onAnimationEnd={handleAnimationEnd}
      style={{ zIndex }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      {...props}
    >
      <div
        ref={modalRef}
        className={modalClasses}
        tabIndex={-1}
        role="document"
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className={styles.modalHeader}>
            {title && (
              <h2 id="modal-title" className={styles.modalTitle}>
                {title}
              </h2>
            )}
            {showCloseButton && (
              <BaseButton
                variant="compact"
                onClick={onClose}
                icon={<X size={18} />}
                className={styles.closeButton}
                aria-label="Cerrar modal"
              />
            )}
          </div>
        )}

        {/* Content */}
        <div className={styles.modalContent}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className={styles.modalFooter}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )

  // Use portal to render outside component tree
  return createPortal(modalContent, document.body)
}

// Subcomponentes para composición
BaseModal.Header = ({ children, className = '', ...props }) => (
  <div className={`${styles.modalHeader} ${className}`} {...props}>
    {children}
  </div>
)

BaseModal.Content = ({ children, className = '', ...props }) => (
  <div className={`${styles.modalContent} ${className}`} {...props}>
    {children}
  </div>
)

BaseModal.Footer = ({ children, className = '', ...props }) => (
  <div className={`${styles.modalFooter} ${className}`} {...props}>
    {children}
  </div>
)

BaseModal.Title = ({ children, className = '', ...props }) => (
  <h2 className={`${styles.modalTitle} ${className}`} {...props}>
    {children}
  </h2>
)

BaseModal.CloseButton = ({ onClose, className = '', ...props }) => (
  <BaseButton
    variant="compact"
    onClick={onClose}
    icon={<X size={18} />}
    className={`${styles.closeButton} ${className}`}
    aria-label="Cerrar modal"
    {...props}
  />
)

export default BaseModal