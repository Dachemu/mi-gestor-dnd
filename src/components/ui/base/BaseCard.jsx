import React from 'react'
import styles from './BaseCard.module.css'

/**
 * BaseCard - Componente base reutilizable para todas las tarjetas
 * 
 * Variantes:
 * - campaign: Tarjeta grande para campañas con blur y stats
 * - compact: Tarjeta compacta para listas con gradiente superior
 * - dashboard: Tarjeta simple para secciones del dashboard
 * - mission: Tarjeta para misiones con estado y borde coloreado
 * - category: Tarjeta-botón para categorías con gradiente dinámico
 * 
 * Estados de hover:
 * - lift: Levanta la tarjeta (default)
 * - glow: Añade resplandor
 * - scale: Escala ligeramente
 * - none: Sin hover effect
 * 
 * @param {Object} props
 * @param {'campaign'|'compact'|'dashboard'|'mission'|'category'} props.variant
 * @param {'lift'|'glow'|'scale'|'none'} props.hoverEffect
 * @param {boolean} props.clickable - Si la tarjeta es clickeable
 * @param {Function} props.onClick
 * @param {string} props.gradient - Gradiente personalizado para compact/category
 * @param {string} props.borderColor - Color del borde para mission cards
 * @param {React.ReactNode} props.icon - Icono opcional
 * @param {React.ReactNode} props.badge - Badge opcional (esquina superior)
 * @param {Object} props.stats - Estadísticas para campaign cards
 * @param {string} props.className - Clases adicionales
 * @param {React.ReactNode} props.children
 */
const BaseCard = ({
  variant = 'dashboard',
  hoverEffect = 'lift',
  clickable = false,
  onClick = null,
  gradient = null,
  borderColor = null,
  icon = null,
  badge = null,
  stats = null,
  className = '',
  style = {},
  children,
  ...props
}) => {
  const cardClasses = [
    styles.baseCard,
    styles[variant],
    clickable && styles.clickable,
    hoverEffect !== 'none' && styles[`hover${hoverEffect.charAt(0).toUpperCase() + hoverEffect.slice(1)}`],
    className
  ].filter(Boolean).join(' ')

  const cardStyle = {
    ...style,
    ...(gradient && { '--card-gradient': gradient }),
    ...(borderColor && { '--border-color': borderColor })
  }

  const handleClick = (e) => {
    if (clickable && onClick) {
      onClick(e)
    }
  }

  const renderHeader = () => {
    if (!icon && !badge) return null
    
    return (
      <div className={styles.cardHeader}>
        {icon && (
          <div className={styles.cardIcon}>
            {icon}
          </div>
        )}
        {badge && (
          <div className={styles.cardBadge}>
            {badge}
          </div>
        )}
      </div>
    )
  }

  const renderStats = () => {
    if (!stats || variant !== 'campaign') return null
    
    return (
      <div className={styles.statsSection}>
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className={styles.statItem}>
            <div className={styles.statValue}>{value}</div>
            <div className={styles.statLabel}>{key}</div>
          </div>
        ))}
      </div>
    )
  }

  const renderGradientOverlay = () => {
    if (variant !== 'compact' && variant !== 'category') return null
    
    return <div className={styles.gradientOverlay} />
  }

  return (
    <div
      className={cardClasses}
      style={cardStyle}
      onClick={handleClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick(e)
        }
      } : undefined}
      {...props}
    >
      {renderGradientOverlay()}
      {renderHeader()}
      
      <div className={styles.cardContent}>
        {children}
      </div>
      
      {renderStats()}
    </div>
  )
}

// Componentes de conveniencia para estructurar el contenido
BaseCard.Title = ({ children, className = '', ...props }) => (
  <h3 className={`${styles.cardTitle} ${className}`} {...props}>
    {children}
  </h3>
)

BaseCard.Subtitle = ({ children, className = '', ...props }) => (
  <p className={`${styles.cardSubtitle} ${className}`} {...props}>
    {children}
  </p>
)

BaseCard.Description = ({ children, className = '', ...props }) => (
  <p className={`${styles.cardDescription} ${className}`} {...props}>
    {children}
  </p>
)

BaseCard.Footer = ({ children, className = '', ...props }) => (
  <div className={`${styles.cardFooter} ${className}`} {...props}>
    {children}
  </div>
)

BaseCard.Actions = ({ children, className = '', ...props }) => (
  <div className={`${styles.cardActions} ${className}`} {...props}>
    {children}
  </div>
)

export default BaseCard