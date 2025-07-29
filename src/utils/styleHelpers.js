import { COLORS, GRADIENTS, BUTTON_STYLES, INPUT_STYLES, MODAL_STYLES } from '../constants/colors'

/**
 * Genera estilos para botones con variaciones
 * @param {string} variant - 'primary' | 'secondary' | 'success' | 'warning' | 'error'
 * @param {Object} overrides - Estilos adicionales o sobrescrituras
 * @returns {Object} Estilos combinados
 */
export const getButtonStyles = (variant = 'primary', overrides = {}) => {
  const baseStyles = BUTTON_STYLES[variant] || BUTTON_STYLES.primary
  return { ...baseStyles, ...overrides }
}

/**
 * Genera estilos para inputs con estados
 * @param {boolean} hasError - Si el input tiene error
 * @param {Object} overrides - Estilos adicionales o sobrescrituras
 * @returns {Object} Estilos combinados
 */
export const getInputStyles = (hasError = false, overrides = {}) => {
  const baseStyles = { ...INPUT_STYLES.base }
  if (hasError) {
    baseStyles.border = `1px solid ${COLORS.error}`
  }
  return { ...baseStyles, ...overrides }
}

/**
 * Genera estilos para modales según el tamaño
 * @param {string} size - 'small' | 'medium' | 'large' | 'xlarge'
 * @returns {Object} Estilos del modal
 */
export const getModalStyles = (size = 'medium') => {
  const sizes = {
    small: { width: 'min(95vw, 400px)' },
    medium: { width: 'min(95vw, 700px)' },
    large: { width: 'min(98vw, 1000px)' },
    xlarge: { width: 'min(98vw, 1200px)' }
  }
  
  return {
    overlay: MODAL_STYLES.overlay,
    container: {
      ...MODAL_STYLES.container,
      width: '100%',
      maxWidth: sizes[size].width
    },
    header: MODAL_STYLES.header,
    content: MODAL_STYLES.content
  }
}

/**
 * Genera estilos para tarjetas con estado hover
 * @param {boolean} isHovered - Si está siendo hover
 * @param {Object} overrides - Estilos adicionales
 * @returns {Object} Estilos de tarjeta
 */
export const getCardStyles = (isHovered = false, overrides = {}) => {
  const baseStyles = {
    background: COLORS.bgCard,
    border: `1px solid ${COLORS.borderSecondary}`,
    borderRadius: '12px',
    padding: 'clamp(1rem, 3vw, 1.5rem)',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  }
  
  if (isHovered) {
    baseStyles.background = COLORS.bgHover
    baseStyles.border = `1px solid ${COLORS.borderHover}`
    baseStyles.transform = 'translateY(-2px)'
    baseStyles.boxShadow = `0 8px 25px ${COLORS.glass.shadow}`
  }
  
  return { ...baseStyles, ...overrides }
}

/**
 * Genera estilos para filtros/tabs
 * @param {boolean} isActive - Si está activo
 * @param {string} color - Color del filtro
 * @param {Object} overrides - Estilos adicionales
 * @returns {Object} Estilos del filtro
 */
export const getFilterStyles = (isActive = false, color = COLORS.primary, overrides = {}) => {
  const baseStyles = {
    padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
    borderRadius: '12px',
    border: isActive 
      ? `1px solid ${color}50` 
      : `1px solid ${COLORS.borderSecondary}`,
    background: isActive 
      ? `linear-gradient(135deg, ${color}30, ${color}10)` 
      : COLORS.bgCard,
    color: isActive ? COLORS.textPrimary : COLORS.textMuted,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
    fontWeight: '600',
    boxShadow: isActive ? `0 4px 12px ${color}30` : 'none',
    backdropFilter: 'blur(10px)'
  }
  
  return { ...baseStyles, ...overrides }
}

/**
 * Genera estilos para texto con diferentes niveles
 * @param {string} level - 'primary' | 'secondary' | 'muted' | 'disabled'
 * @param {string} size - Tamaño del texto
 * @returns {Object} Estilos de texto
 */
export const getTextStyles = (level = 'primary', size = '1rem') => {
  const colors = {
    primary: COLORS.textPrimary,
    secondary: COLORS.textSecondary,
    muted: COLORS.textMuted,
    disabled: COLORS.textDisabled
  }
  
  return {
    color: colors[level] || colors.primary,
    fontSize: size,
    margin: 0
  }
}

/**
 * Genera estilos para conexiones con diferentes estados
 * @param {boolean} isConnected - Si está conectado
 * @param {string} color - Color de la conexión
 * @returns {Object} Estilos de conexión
 */
export const getConnectionStyles = (isConnected = false, color = COLORS.primary) => {
  return {
    background: isConnected ? `${color}20` : COLORS.bgCard,
    border: `1px solid ${isConnected ? color : COLORS.borderSecondary}`,
    borderRadius: '12px',
    padding: 'clamp(0.75rem, 2vw, 1rem)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  }
}

// Exportar constantes para uso directo
export { COLORS, GRADIENTS, BUTTON_STYLES, INPUT_STYLES, MODAL_STYLES }