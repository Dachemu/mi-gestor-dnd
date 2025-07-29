import React from 'react'
import styles from './BaseBadge.module.css'

/**
 * BaseBadge Component
 * 
 * Componente para mostrar badges, etiquetas de estado, tipos, etc.
 * Unifica todos los estilos de badges en la aplicación.
 * 
 * @param {Object} props
 * @param {'status'|'type'|'priority'|'category'|'info'|'count'} props.variant - Tipo de badge
 * @param {'sm'|'md'|'lg'} props.size - Tamaño del badge
 * @param {'default'|'blue'|'green'|'purple'|'orange'|'red'|'gray'} props.color - Color del badge
 * @param {string} props.children - Contenido del badge
 * @param {string} props.className - Clases CSS adicionales
 * @param {Object} props.style - Estilos inline adicionales
 * @param {boolean} props.pill - Si el badge debe ser circular/píldora
 * @param {React.ReactNode} props.icon - Icono opcional para el badge
 * @param {string} props.iconPosition - Posición del icono ('left' | 'right')
 */
const BaseBadge = ({
  variant = 'info',
  size = 'md',
  color = 'default',
  children,
  className = '',
  style = {},
  pill = false,
  icon = null,
  iconPosition = 'left',
  ...props
}) => {
  const badgeClasses = [
    styles.baseBadge,
    styles[variant],
    styles[size],
    styles[color],
    pill && styles.pill,
    className
  ].filter(Boolean).join(' ')

  return (
    <span 
      className={badgeClasses}
      style={style}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <span className={styles.icon}>{icon}</span>
      )}
      <span className={styles.content}>{children}</span>
      {icon && iconPosition === 'right' && (
        <span className={styles.icon}>{icon}</span>
      )}
    </span>
  )
}

export default BaseBadge