import { useState, useMemo } from 'react'

/**
 * Hook personalizado para manejar estilos de hover de forma declarativa
 * Elimina la necesidad de handlers onMouseEnter/onMouseLeave repetitivos
 *
 * @param {Object} baseStyle - Estilos base del elemento
 * @param {Object} hoverStyle - Estilos cuando el mouse está sobre el elemento
 * @param {Object} options - Opciones adicionales
 * @param {boolean} options.disabled - Si true, no aplica hover
 * @param {boolean} options.merge - Si true, merge hoverStyle con baseStyle (default: true)
 * @returns {Object} { style, handlers }
 *
 * @example
 * const { style, handlers } = useHoverStyle(
 *   { background: 'blue', padding: '10px' },
 *   { background: 'lightblue' }
 * )
 * return <button style={style} {...handlers}>Hover me</button>
 */
export function useHoverStyle(baseStyle = {}, hoverStyle = {}, options = {}) {
  const { disabled = false, merge = true } = options
  const [isHovered, setIsHovered] = useState(false)

  // Memoizar handlers para evitar re-creaciones
  const handlers = useMemo(() => ({
    onMouseEnter: disabled ? undefined : () => setIsHovered(true),
    onMouseLeave: disabled ? undefined : () => setIsHovered(false)
  }), [disabled])

  // Calcular estilo final
  const style = useMemo(() => {
    if (!isHovered || disabled) {
      return baseStyle
    }

    // Si merge es true, combinar estilos; si no, reemplazar
    return merge
      ? { ...baseStyle, ...hoverStyle }
      : hoverStyle
  }, [isHovered, disabled, baseStyle, hoverStyle, merge])

  return { style, handlers, isHovered }
}

/**
 * Variante del hook para elementos con estado activo
 * Útil para botones, tabs, etc. que pueden estar activos independientemente del hover
 *
 * @param {Object} baseStyle - Estilos base
 * @param {Object} hoverStyle - Estilos en hover (solo si no está activo)
 * @param {Object} activeStyle - Estilos cuando está activo
 * @param {boolean} isActive - Si el elemento está activo
 * @returns {Object} { style, handlers }
 *
 * @example
 * const { style, handlers } = useHoverWithActiveStyle(
 *   { background: 'gray' },
 *   { background: 'lightgray' },
 *   { background: 'blue' },
 *   isSelected
 * )
 */
export function useHoverWithActiveStyle(baseStyle = {}, hoverStyle = {}, activeStyle = {}, isActive = false) {
  const [isHovered, setIsHovered] = useState(false)

  const handlers = useMemo(() => ({
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false)
  }), [])

  const style = useMemo(() => {
    if (isActive) {
      return { ...baseStyle, ...activeStyle }
    }

    if (isHovered) {
      return { ...baseStyle, ...hoverStyle }
    }

    return baseStyle
  }, [isHovered, isActive, baseStyle, hoverStyle, activeStyle])

  return { style, handlers, isHovered, isActive }
}

/**
 * Hook simplificado para cambios de color en hover
 * Caso de uso más común donde solo cambia el color de fondo/borde
 *
 * @param {string} baseColor - Color base
 * @param {string} hoverColor - Color en hover
 * @param {Object} additionalStyles - Estilos adicionales que no cambian
 * @returns {Object} { style, handlers }
 *
 * @example
 * const { style, handlers } = useHoverColor(
 *   'rgba(79, 70, 229, 0.2)',
 *   'rgba(79, 70, 229, 0.4)',
 *   { padding: '10px', borderRadius: '8px' }
 * )
 */
export function useHoverColor(baseColor, hoverColor, additionalStyles = {}) {
  const baseStyle = {
    ...additionalStyles,
    background: baseColor
  }

  const hoverStyle = {
    background: hoverColor
  }

  return useHoverStyle(baseStyle, hoverStyle)
}

export default useHoverStyle
