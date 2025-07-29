import React from 'react'
import styles from './BaseLoader.module.css'

/**
 * BaseLoader Component
 * 
 * Componente para estados de carga con múltiples variantes.
 * Incluye spinners, skeleton loaders, progress bars y más.
 * 
 * @param {Object} props
 * @param {'spinner'|'dots'|'pulse'|'skeleton'|'progress'|'bouncing'} props.type - Tipo de loader
 * @param {'sm'|'md'|'lg'|'xl'} props.size - Tamaño del loader
 * @param {'primary'|'secondary'|'white'} props.color - Color del loader
 * @param {string} props.text - Texto descriptivo opcional
 * @param {boolean} props.overlay - Si mostrar como overlay completo
 * @param {string} props.className - Clases CSS adicionales
 * @param {number} props.progress - Progreso para progress bar (0-100)
 * @param {boolean} props.inline - Si el loader debe ser inline
 * @param {number} props.duration - Duración de la animación en segundos
 * @param {React.ReactNode} props.children - Contenido a mostrar durante carga (para overlay)
 */
const BaseLoader = ({
  type = 'spinner',
  size = 'md',
  color = 'primary',
  text = '',
  overlay = false,
  className = '',
  progress = 0,
  inline = false,
  duration = 1,
  children,
  ...props
}) => {
  // Clases base
  const loaderClasses = [
    styles.baseLoader,
    styles[type],
    styles[size],
    styles[color],
    overlay && styles.overlay,
    inline && styles.inline,
    className
  ].filter(Boolean).join(' ')

  // Renderizar según el tipo
  const renderLoader = () => {
    switch (type) {
      case 'spinner':
        return (
          <div className={styles.spinnerContainer}>
            <div 
              className={styles.spinner}
              style={{ animationDuration: `${duration}s` }}
            />
          </div>
        )

      case 'dots':
        return (
          <div className={styles.dotsContainer}>
            <div className={styles.dot} style={{ animationDelay: '0s' }} />
            <div className={styles.dot} style={{ animationDelay: '0.2s' }} />
            <div className={styles.dot} style={{ animationDelay: '0.4s' }} />
          </div>
        )

      case 'pulse':
        return (
          <div className={styles.pulseContainer}>
            <div 
              className={styles.pulseRing}
              style={{ animationDuration: `${duration}s` }}
            />
            <div 
              className={styles.pulseCore}
              style={{ animationDuration: `${duration}s` }}
            />
          </div>
        )

      case 'skeleton':
        return (
          <div className={styles.skeletonContainer}>
            <div className={styles.skeletonLine} style={{ width: '100%' }} />
            <div className={styles.skeletonLine} style={{ width: '80%' }} />
            <div className={styles.skeletonLine} style={{ width: '60%' }} />
          </div>
        )

      case 'progress':
        return (
          <div className={styles.progressContainer}>
            <div className={styles.progressTrack}>
              <div 
                className={styles.progressFill}
                style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
              />
            </div>
            {text && (
              <div className={styles.progressText}>
                {text} {progress > 0 && `${Math.round(progress)}%`}
              </div>
            )}
          </div>
        )

      case 'bouncing':
        return (
          <div className={styles.bouncingContainer}>
            <div className={styles.bouncingBall} style={{ animationDelay: '0s' }} />
            <div className={styles.bouncingBall} style={{ animationDelay: '0.2s' }} />
            <div className={styles.bouncingBall} style={{ animationDelay: '0.4s' }} />
          </div>
        )

      default:
        return renderLoader()
    }
  }

  // Si es overlay, renderizar con fondo
  if (overlay) {
    return (
      <div className={`${styles.loaderOverlay} ${className}`} {...props}>
        <div className={styles.overlayContent}>
          <div className={loaderClasses}>
            {renderLoader()}
            {text && <div className={styles.loaderText}>{text}</div>}
          </div>
        </div>
        {children && (
          <div className={styles.overlayBackground}>
            {children}
          </div>
        )}
      </div>
    )
  }

  // Renderizado normal
  return (
    <div className={loaderClasses} {...props}>
      {renderLoader()}
      {text && <div className={styles.loaderText}>{text}</div>}
    </div>
  )
}

// Subcomponentes para casos específicos
BaseLoader.Inline = ({ children, loading, ...props }) => {
  if (!loading) return children
  return <BaseLoader inline {...props} />
}

BaseLoader.Overlay = ({ children, loading, ...props }) => {
  return (
    <div style={{ position: 'relative' }}>
      {children}
      {loading && <BaseLoader overlay {...props} />}
    </div>
  )
}

BaseLoader.Button = ({ loading, children, ...props }) => {
  return (
    <>
      {loading && <BaseLoader type="spinner" size="sm" inline {...props} />}
      {!loading && children}
    </>
  )
}

export default BaseLoader