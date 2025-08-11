// Migrado a usar CSS variables en lugar de JS constants
// Importar helpers que usan CSS custom properties
import { 
  getButtonStyles as getCSSButtonStyles,
  getInputStyles as getCSSInputStyles,
  getModalStyles as getCSSModalStyles,
  getCardStyles,
  getFilterStyles,
  getTextStyles,
  getConnectionStyles
} from './cssHelpers'

/**
 * Genera estilos para botones con variaciones
 * @param {string} variant - 'primary' | 'secondary'
 * @param {Object} overrides - Estilos adicionales o sobrescrituras
 * @returns {Object} Estilos combinados
 */
export const getButtonStyles = (variant = 'primary', overrides = {}) => {
  return getCSSButtonStyles(variant, overrides)
}

/**
 * Genera estilos para inputs con estados
 * @param {boolean} hasError - Si el input tiene error
 * @param {Object} overrides - Estilos adicionales o sobrescrituras
 * @returns {Object} Estilos combinados
 */
export const getInputStyles = (hasError = false, overrides = {}) => {
  return getCSSInputStyles(hasError, overrides)
}

/**
 * Genera estilos para modales según el tamaño
 * @param {string} size - 'small' | 'medium' | 'large' | 'xlarge'
 * @returns {Object} Estilos del modal
 */
export const getModalStyles = (size = 'medium') => {
  return getCSSModalStyles(size)
}

// Re-exportar función desde cssHelpers
export { getCardStyles } from './cssHelpers'

// Re-exportar función desde cssHelpers con adaptación de parámetros
export { getFilterStyles, getTextStyles, getConnectionStyles } from './cssHelpers'

// Mantener compatibilidad hacia atrás exportando constantes CSS como objetos JS
// DEPRECADO: Usar CSS variables directamente en su lugar
export const COLORS = {
  get primary() { return 'var(--primary)' },
  get primaryLight() { return 'var(--primary-light)' },
  get primaryDark() { return 'var(--primary-dark)' },
  get secondary() { return 'var(--secondary)' },
  get success() { return 'var(--success)' },
  get warning() { return 'var(--warning)' },
  get error() { return 'var(--error)' },
  get info() { return 'var(--info)' },
  get pink() { return 'var(--pink)' },
  get bgPrimary() { return 'var(--bg-primary)' },
  get bgSecondary() { return 'var(--bg-secondary)' },
  get bgCard() { return 'var(--bg-card)' },
  get bgHover() { return 'var(--bg-hover)' },
  get borderPrimary() { return 'var(--border-primary)' },
  get borderSecondary() { return 'var(--border-secondary)' },
  get borderHover() { return 'var(--border-hover)' },
  get textPrimary() { return 'var(--text-primary)' },
  get textSecondary() { return 'var(--text-secondary)' },
  get textMuted() { return 'var(--text-muted)' },
  get textDisabled() { return 'var(--text-disabled)' },
  glass: {
    get border() { return 'var(--glass-border)' },
    get bg() { return 'var(--glass-bg)' },
    get bgHover() { return 'var(--glass-bg-hover)' },
    get shadow() { return 'var(--glass-shadow)' }
  }
}

export const GRADIENTS = {
  get primary() { return 'var(--gradient-primary)' },
  get secondary() { return 'var(--gradient-secondary)' },
  get modal() { return 'var(--gradient-modal)' },
  get modalHeader() { return 'var(--gradient-modal-header)' },
  get text() { return 'var(--gradient-text)' },
  get rainbow() { return 'var(--gradient-rainbow)' }
}