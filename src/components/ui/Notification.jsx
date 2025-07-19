import React from 'react'

/**
 * Componente de notificación reutilizable
 * Para usar con el hook useCRUD
 */
function Notification({ notification }) {
  if (!notification) return null

  return (
    <div style={{
      position: 'fixed',
      top: '2rem',
      right: '2rem',
      background: notification.type === 'error' 
        ? 'rgba(239, 68, 68, 0.9)' 
        : 'rgba(16, 185, 129, 0.9)',
      color: 'white',
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      zIndex: 1000,
      backdropFilter: 'blur(10px)',
      fontSize: '0.85rem',
      fontWeight: '500',
      maxWidth: '300px',
      animation: 'slideInRight 0.3s ease-out'
    }}>
      {notification.message}
    </div>
  )
}

export default Notification