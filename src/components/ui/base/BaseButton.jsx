import React from 'react'
import styles from './BaseButton.module.css'

/**
 * BaseButton - Componente base reutilizable para todos los botones
 * 
 * Variantes:
 * - primary: Botón principal con gradiente púrpura
 * - secondary: Botón secundario transparente con borde
 * - danger: Botón de acción destructiva (rojo)
 * - success: Botón de confirmación (verde)
 * - compact: Botón pequeño para acciones rápidas
 * - tab: Botón para navegación/filtros
 * 
 * Tamaños:
 * - sm: Pequeño
 * - md: Mediano (default)
 * - lg: Grande
 * 
 * @param {Object} props
 * @param {'primary'|'secondary'|'danger'|'success'|'compact'|'tab'} props.variant
 * @param {'sm'|'md'|'lg'} props.size
 * @param {boolean} props.active - Para botones tipo tab
 * @param {boolean} props.disabled
 * @param {boolean} props.loading
 * @param {React.ReactNode} props.icon - Icono opcional
 * @param {'left'|'right'} props.iconPosition
 * @param {string} props.className - Clases adicionales
 * @param {React.ReactNode} props.children
 * @param {Function} props.onClick
 */
const BaseButton = ({
  variant = 'primary',
  size = 'md',
  active = false,
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  className = '',
  children,
  type = 'button',
  ...props
}) => {
  const buttonClasses = [
    styles.baseButton,
    styles[variant],
    styles[size],
    active && styles.active,
    disabled && styles.disabled,
    loading && styles.loading,
    icon && !children && styles.iconOnly,
    className
  ].filter(Boolean).join(' ')

  const renderIcon = () => {
    if (loading) {
      return <span className={styles.spinner} />
    }
    return icon
  }

  const renderContent = () => {
    if (icon && children) {
      return iconPosition === 'left' ? (
        <>
          {renderIcon()}
          <span className={styles.text}>{children}</span>
        </>
      ) : (
        <>
          <span className={styles.text}>{children}</span>
          {renderIcon()}
        </>
      )
    }

    if (icon && !children) {
      return renderIcon()
    }

    return <span className={styles.text}>{children}</span>
  }

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      {...props}
    >
      {renderContent()}
    </button>
  )
}

export default BaseButton