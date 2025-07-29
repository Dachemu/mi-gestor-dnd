import React, { useState, useRef, useEffect } from 'react'
import styles from './BaseTooltip.module.css'

/**
 * BaseTooltip Component
 * 
 * Componente para mostrar información adicional en hover o click.
 * Incluye posicionamiento inteligente y responsive design.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Elemento que activará el tooltip
 * @param {React.ReactNode} props.content - Contenido del tooltip
 * @param {'hover'|'click'|'focus'} props.trigger - Tipo de trigger (default: 'hover')
 * @param {'top'|'bottom'|'left'|'right'|'auto'} props.position - Posición del tooltip (default: 'auto')
 * @param {number} props.delay - Delay en ms antes de mostrar (default: 0)
 * @param {number} props.hideDelay - Delay en ms antes de ocultar (default: 0)
 * @param {boolean} props.disabled - Si el tooltip está deshabilitado
 * @param {string} props.className - Clases CSS adicionales
 * @param {'sm'|'md'|'lg'} props.size - Tamaño del tooltip
 * @param {'dark'|'light'|'primary'} props.theme - Tema del tooltip
 * @param {boolean} props.arrow - Mostrar flecha apuntando al elemento (default: true)
 * @param {number} props.maxWidth - Ancho máximo en px (default: 250)
 * @param {boolean} props.multiline - Permitir múltiples líneas (default: false)
 */
const BaseTooltip = ({
  children,
  content,
  trigger = 'hover',
  position = 'auto',
  delay = 0,
  hideDelay = 0,
  disabled = false,
  className = '',
  size = 'md',
  theme = 'dark',
  arrow = true,
  maxWidth = 250,
  multiline = false,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [actualPosition, setActualPosition] = useState(position)
  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)
  const timeoutRef = useRef(null)
  const hideTimeoutRef = useRef(null)

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
    }
  }, [])

  // Calcular posición óptima
  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current || position !== 'auto') {
      return position
    }

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    // Espacios disponibles en cada dirección
    const spaces = {
      top: triggerRect.top,
      bottom: viewport.height - triggerRect.bottom,
      left: triggerRect.left,
      right: viewport.width - triggerRect.right
    }

    // Prioridad: bottom > top > right > left
    if (spaces.bottom >= tooltipRect.height + 10) return 'bottom'
    if (spaces.top >= tooltipRect.height + 10) return 'top'
    if (spaces.right >= tooltipRect.width + 10) return 'right'
    if (spaces.left >= tooltipRect.width + 10) return 'left'

    // Fallback al lado con más espacio
    const maxSpace = Math.max(...Object.values(spaces))
    return Object.keys(spaces).find(key => spaces[key] === maxSpace) || 'bottom'
  }

  // Mostrar tooltip
  const showTooltip = () => {
    if (disabled || !content) return

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }

    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true)
      }, delay)
    } else {
      setIsVisible(true)
    }
  }

  // Ocultar tooltip
  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    if (hideDelay > 0) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false)
      }, hideDelay)
    } else {
      setIsVisible(false)
    }
  }

  // Actualizar posición cuando se muestra
  useEffect(() => {
    if (isVisible && position === 'auto') {
      const newPosition = calculatePosition()
      setActualPosition(newPosition)
    }
  }, [isVisible, position])

  // Event handlers según el trigger
  const getEventHandlers = () => {
    const handlers = {}

    if (trigger === 'hover') {
      handlers.onMouseEnter = showTooltip
      handlers.onMouseLeave = hideTooltip
      handlers.onFocus = showTooltip
      handlers.onBlur = hideTooltip
    } else if (trigger === 'click') {
      handlers.onClick = () => {
        if (isVisible) {
          hideTooltip()
        } else {
          showTooltip()
        }
      }
    } else if (trigger === 'focus') {
      handlers.onFocus = showTooltip
      handlers.onBlur = hideTooltip
    }

    return handlers
  }

  // Clases del tooltip
  const tooltipClasses = [
    styles.baseTooltip,
    styles[actualPosition],
    styles[size],
    styles[theme],
    arrow && styles.withArrow,
    multiline && styles.multiline,
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={styles.tooltipContainer} {...props}>
      {/* Elemento trigger */}
      <div
        ref={triggerRef}
        className={styles.tooltipTrigger}
        {...getEventHandlers()}
      >
        {children}
      </div>

      {/* Tooltip */}
      {isVisible && content && (
        <div
          ref={tooltipRef}
          className={tooltipClasses}
          style={{
            maxWidth: `${maxWidth}px`
          }}
          role="tooltip"
          aria-hidden={!isVisible}
        >
          {/* Contenido */}
          <div className={styles.tooltipContent}>
            {content}
          </div>

          {/* Flecha */}
          {arrow && (
            <div className={styles.tooltipArrow} />
          )}
        </div>
      )}
    </div>
  )
}

export default BaseTooltip