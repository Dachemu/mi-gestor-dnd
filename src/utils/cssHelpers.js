/**
 * Helpers para usar CSS variables de manera programática
 * Migrado desde constants/colors.js para usar CSS custom properties
 */

/**
 * Obtiene el valor de una variable CSS personalizada
 * @param {string} variableName - Nombre de la variable CSS (sin --)
 * @returns {string} Valor de la variable
 */
export const getCSSVariable = (variableName) => {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--${variableName}`)
    .trim()
}

/**
 * Genera estilos para botones usando CSS variables
 * @param {string} variant - 'primary' | 'secondary'
 * @param {Object} overrides - Estilos adicionales o sobrescrituras
 * @returns {Object} Estilos combinados
 */
export const getButtonStyles = (variant = 'primary', overrides = {}) => {
  const styles = {
    primary: {
      background: 'var(--gradient-primary)',
      border: 'var(--border-primary-solid)',
      color: 'var(--text-primary)',
      borderRadius: 'var(--radius-xl)',
      padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
      cursor: 'pointer',
      transition: 'var(--transition-medium)',
      fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
      fontWeight: '600',
      boxShadow: 'var(--shadow-primary)',
      backdropFilter: 'blur(10px)'
    },
    secondary: {
      background: 'transparent',
      border: 'var(--border-secondary-solid)',
      color: 'var(--text-secondary)',
      borderRadius: 'var(--radius-large)',
      padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
      cursor: 'pointer',
      transition: 'var(--transition-fast)',
      fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
      fontWeight: '500'
    }
  }

  const baseStyles = styles[variant] || styles.primary
  return { ...baseStyles, ...overrides }
}

/**
 * Genera estilos para inputs usando CSS variables
 * @param {boolean} hasError - Si el input tiene error
 * @param {Object} overrides - Estilos adicionales o sobrescrituras
 * @returns {Object} Estilos combinados
 */
export const getInputStyles = (hasError = false, overrides = {}) => {
  const baseStyles = {
    width: '100%',
    background: 'var(--bg-card)',
    border: hasError ? '1px solid var(--error)' : 'var(--border-secondary-solid)',
    borderRadius: 'var(--radius-large)',
    padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)',
    color: 'var(--text-primary)',
    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
    outline: 'none',
    transition: 'var(--transition-fast)'
  }

  return { ...baseStyles, ...overrides }
}

/**
 * Genera estilos para modales usando CSS variables
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
    overlay: {
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
      padding: 'clamp(10px, 2vw, 20px)',
      boxSizing: 'border-box',
      overflowY: 'auto',
      overflowX: 'hidden'
    },
    container: {
      background: 'var(--gradient-modal)',
      borderRadius: 'var(--radius-rounded)',
      border: 'var(--border-primary-solid)',
      boxShadow: '0 32px 64px rgba(0, 0, 0, 0.8)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      boxSizing: 'border-box',
      backdropFilter: 'blur(25px)',
      animation: 'modalFadeIn 0.2s ease-out',
      width: '100%',
      maxWidth: sizes[size].width
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'clamp(1rem, 4vw, 2rem) clamp(1rem, 5vw, 2.5rem)',
      borderBottom: 'var(--border-secondary-solid)',
      background: 'var(--gradient-modal-header)',
      borderRadius: 'var(--radius-rounded) var(--radius-rounded) 0 0',
      flexShrink: 0,
      boxSizing: 'border-box'
    },
    content: {
      padding: 'clamp(1rem, 3vw, 1.5rem) clamp(1rem, 4vw, 2rem) clamp(1.5rem, 4vw, 2rem)',
      flex: 1,
      minHeight: 0,
      overflow: 'visible',
      boxSizing: 'border-box'
    }
  }
}

/**
 * Genera estilos para tarjetas usando CSS variables
 * @param {boolean} isHovered - Si está siendo hover
 * @param {Object} overrides - Estilos adicionales
 * @returns {Object} Estilos de tarjeta
 */
export const getCardStyles = (isHovered = false, overrides = {}) => {
  const baseStyles = {
    background: 'var(--bg-card)',
    border: 'var(--border-secondary-solid)',
    borderRadius: 'var(--radius-xl)',
    padding: 'clamp(1rem, 3vw, 1.5rem)',
    transition: 'var(--transition-fast)',
    cursor: 'pointer'
  }
  
  if (isHovered) {
    baseStyles.background = 'var(--bg-hover)'
    baseStyles.border = 'var(--border-hover-solid)'
    baseStyles.transform = 'translateY(-2px)'
    baseStyles.boxShadow = '0 8px 25px var(--glass-shadow)'
  }
  
  return { ...baseStyles, ...overrides }
}

/**
 * Genera estilos para filtros/tabs usando CSS variables
 * @param {boolean} isActive - Si está activo
 * @param {string} colorVar - Variable CSS de color (sin --)
 * @param {Object} overrides - Estilos adicionales
 * @returns {Object} Estilos del filtro
 */
export const getFilterStyles = (isActive = false, colorVar = 'primary', overrides = {}) => {
  const baseStyles = {
    padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
    borderRadius: 'var(--radius-xl)',
    border: isActive 
      ? `1px solid var(--${colorVar})` 
      : 'var(--border-secondary-solid)',
    background: isActive 
      ? `var(--gradient-primary)` 
      : 'var(--bg-card)',
    color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'var(--transition-medium)',
    fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
    fontWeight: '600',
    boxShadow: isActive ? 'var(--shadow-primary)' : 'none',
    backdropFilter: 'blur(10px)'
  }
  
  return { ...baseStyles, ...overrides }
}

/**
 * Genera estilos para texto usando CSS variables
 * @param {string} level - 'primary' | 'secondary' | 'muted' | 'disabled'
 * @param {string} size - Tamaño del texto
 * @returns {Object} Estilos de texto
 */
export const getTextStyles = (level = 'primary', size = '1rem') => {
  const colorVars = {
    primary: 'var(--text-primary)',
    secondary: 'var(--text-secondary)',
    muted: 'var(--text-muted)',
    disabled: 'var(--text-disabled)'
  }
  
  return {
    color: colorVars[level] || colorVars.primary,
    fontSize: size,
    margin: 0
  }
}

/**
 * Genera estilos para conexiones usando CSS variables
 * @param {boolean} isConnected - Si está conectado
 * @param {string} colorVar - Variable CSS de color (sin --)
 * @returns {Object} Estilos de conexión
 */
export const getConnectionStyles = (isConnected = false, colorVar = 'primary') => {
  return {
    background: isConnected ? `var(--${colorVar}-alpha-20)` : 'var(--bg-card)',
    border: isConnected 
      ? `1px solid var(--${colorVar})` 
      : 'var(--border-secondary-solid)',
    borderRadius: 'var(--radius-xl)',
    padding: 'clamp(0.75rem, 2vw, 1rem)',
    cursor: 'pointer',
    transition: 'var(--transition-fast)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  }
}