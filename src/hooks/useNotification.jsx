import { useState } from 'react'
import React from 'react'

/**
 * Hook personalizado para manejar notificaciones de manera uniforme
 * Centraliza la lógica de mostrar notificaciones y evita código duplicado
 */
export function useNotification() {
  const [notification, setNotification] = useState(null)

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const hideNotification = () => {
    setNotification(null)
  }

  // Componente como función que retorna JSX o null
  const NotificationComponent = () => {
    if (!notification) return null

    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 24px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: 1000,
        maxWidth: '400px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        background: notification.type === 'error' 
          ? '#ef4444'
          : notification.type === 'warning'
          ? '#f59e0b'
          : notification.type === 'info'
          ? '#3b82f6'
          : '#10b981'
      }}>
        {notification.message}
      </div>
    )
  }

  return {
    showNotification,
    hideNotification,
    notification,
    NotificationComponent
  }
}