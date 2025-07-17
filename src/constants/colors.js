// Colores y estilos centralizados para toda la aplicación
export const COLORS = {
  // Colores principales
  primary: '#8b5cf6',
  primaryLight: '#a78bfa',
  primaryDark: '#7c3aed',
  
  // Colores secundarios
  secondary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4',
  pink: '#ec4899',
  
  // Colores de fondo
  bgPrimary: 'rgba(15, 15, 25, 0.98)',
  bgSecondary: 'rgba(26, 26, 46, 0.95)',
  bgCard: 'rgba(31, 41, 55, 0.5)',
  bgHover: 'rgba(31, 41, 55, 0.7)',
  
  // Colores de borde
  borderPrimary: 'rgba(139, 92, 246, 0.3)',
  borderSecondary: 'rgba(139, 92, 246, 0.2)',
  borderHover: 'rgba(139, 92, 246, 0.5)',
  
  // Colores de texto
  textPrimary: '#ffffff',
  textSecondary: '#d1d5db',
  textMuted: '#9ca3af',
  textDisabled: '#6b7280',
  
  // Colores con transparencia
  glass: {
    border: 'rgba(139, 92, 246, 0.3)',
    bg: 'rgba(139, 92, 246, 0.1)',
    bgHover: 'rgba(139, 92, 246, 0.2)',
    shadow: 'rgba(139, 92, 246, 0.3)'
  }
}

// Gradientes comunes
export const GRADIENTS = {
  primary: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(139, 92, 246, 0.1))',
  secondary: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(59, 130, 246, 0.1))',
  modal: 'linear-gradient(135deg, rgba(15, 15, 25, 0.98) 0%, rgba(26, 26, 46, 0.95) 100%)',
  modalHeader: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
  text: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)',
  rainbow: 'linear-gradient(90deg, #8b5cf6, #3b82f6, #10b981, #f59e0b, #ec4899)'
}

// Estilos comunes de botones
export const BUTTON_STYLES = {
  primary: {
    background: GRADIENTS.primary,
    border: `1px solid ${COLORS.borderPrimary}`,
    color: COLORS.textPrimary,
    borderRadius: '12px',
    padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
    fontWeight: '600',
    boxShadow: `0 4px 12px ${COLORS.glass.shadow}`,
    backdropFilter: 'blur(10px)'
  },
  secondary: {
    background: 'transparent',
    border: `1px solid ${COLORS.borderSecondary}`,
    color: COLORS.textSecondary,
    borderRadius: '10px',
    padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
    fontWeight: '500'
  }
}

// Estilos comunes de inputs
export const INPUT_STYLES = {
  base: {
    width: '100%',
    background: COLORS.bgCard,
    border: `1px solid ${COLORS.borderSecondary}`,
    borderRadius: '10px',
    padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)',
    color: COLORS.textPrimary,
    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
    outline: 'none',
    transition: 'all 0.2s ease'
  },
  error: {
    borderColor: COLORS.error
  }
}

// Estilos comunes de modal
export const MODAL_STYLES = {
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
    background: GRADIENTS.modal,
    borderRadius: '20px',
    border: `1px solid ${COLORS.borderPrimary}`,
    boxShadow: '0 32px 64px rgba(0, 0, 0, 0.8)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    boxSizing: 'border-box',
    backdropFilter: 'blur(25px)',
    animation: 'modalFadeIn 0.2s ease-out'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'clamp(1rem, 4vw, 2rem) clamp(1rem, 5vw, 2.5rem)',
    borderBottom: `1px solid ${COLORS.borderSecondary}`,
    background: GRADIENTS.modalHeader,
    borderRadius: '20px 20px 0 0',
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