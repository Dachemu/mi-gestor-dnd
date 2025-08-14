import React, { useState, useEffect } from 'react'
import { Cloud, CloudOff, Settings } from 'lucide-react'
import BaseButton from '../ui/base/BaseButton'
import { zeroConfigGoogleDrive } from '../../services/zeroConfigGoogleDrive'
import { debug } from '../../utils/logger'

export function CompactDriveButton({ onCampaignLoaded }) {
  const [status, setStatus] = useState({
    connected: false,
    folderSelected: false,
    folderName: null,
    autoSaveEnabled: false,
    user: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Actualizar estado
  useEffect(() => {
    const updateStatus = () => {
      setStatus(zeroConfigGoogleDrive.getStatus())
    }

    updateStatus()
    const interval = setInterval(updateStatus, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleConnect = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const success = await zeroConfigGoogleDrive.connect()
      if (success) {
        debug('✅ Conectado exitosamente - abriendo selector de carpeta')
        // Automáticamente abrir selector de carpeta después de conectar
        await zeroConfigGoogleDrive.selectFolder(true)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }


  const handleDisconnect = () => {
    zeroConfigGoogleDrive.disconnect()
    setError(null)
  }

  // Vista compacta - solo lo esencial
  if (!status.connected) {
    return (
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <BaseButton
          onClick={handleConnect}
          disabled={isLoading}
          variant="ghost"
          size="sm"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            fontSize: '0.85rem',
            padding: '0.5rem 0.75rem'
          }}
        >
          <CloudOff size={14} style={{ marginRight: '0.5rem' }} />
          {isLoading ? 'Conectando...' : 'Conectar'}
        </BaseButton>
        {error && (
          <span style={{ 
            color: '#fca5a5', 
            fontSize: '0.75rem',
            maxWidth: '150px',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            Error
          </span>
        )}
      </div>
    )
  }

  if (!status.folderSelected) {
    return (
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span style={{ color: 'white', fontSize: '0.8rem' }}>
          {isLoading ? 'Seleccionando carpeta...' : 'Conectado - Selecciona carpeta'}
        </span>
      </div>
    )
  }

  // Conectado y configurado
  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'rgba(16, 185, 129, 0.2)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '6px',
        padding: '0.4rem 0.6rem'
      }}>
        <Cloud size={14} style={{ color: '#10b981' }} />
        <span style={{ 
          color: 'white', 
          fontSize: '0.8rem',
          fontWeight: '500'
        }}>
          {status.user ? status.user.split(' ')[0] : 'Conectado'}
        </span>
        {status.autoSaveEnabled && (
          <span style={{ 
            color: '#10b981', 
            fontSize: '0.7rem'
          }}>
            ●
          </span>
        )}
      </div>
      
      <BaseButton
        onClick={handleDisconnect}
        variant="ghost"
        size="sm"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          color: 'rgba(255, 255, 255, 0.6)',
          border: 'none',
          borderRadius: '6px',
          fontSize: '0.7rem',
          padding: '0.3rem 0.5rem'
        }}
      >
        ×
      </BaseButton>
    </div>
  )
}