import React, { useState, useEffect } from 'react'
import { Cloud, CloudOff, AlertCircle } from 'lucide-react'
import BaseButton from '../ui/base/BaseButton'
import { zeroConfigGoogleDrive } from '../../services/zeroConfigGoogleDrive'
import { debug } from '../../utils/logger'

export function CompactDriveButton({ _onCampaignLoaded }) {
  const [status, setStatus] = useState({
    connected: false,
    folderSelected: false,
    folderName: null,
    autoSaveEnabled: false,
    user: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showConfigModal, setShowConfigModal] = useState(false)

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
      // Verificar si las credenciales están configuradas
      const diagnostics = zeroConfigGoogleDrive.getDiagnostics()
      if (!diagnostics.hasCredentials) {
        setShowConfigModal(true)
        setIsLoading(false)
        return
      }

      const success = await zeroConfigGoogleDrive.connect()
      if (success) {
        debug('✅ Conectado exitosamente - abriendo selector de carpeta')
        // Automáticamente abrir selector de carpeta después de conectar
        await zeroConfigGoogleDrive.selectFolder(true)
      }
    } catch (err) {
      setError(err.message)
      // Si el error es por credenciales, mostrar modal de configuración
      if (err.message.includes('Credenciales') || err.message.includes('credenciales')) {
        setShowConfigModal(true)
      }
    } finally {
      setIsLoading(false)
    }
  }


  const handleDisconnect = () => {
    zeroConfigGoogleDrive.disconnect()
    setError(null)
  }

  // Modal de configuración
  const ConfigModal = () => {
    if (!showConfigModal) return null

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '1rem'
      }} onClick={() => setShowConfigModal(false)}>
        <div style={{
          background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(79, 70, 229, 0.3)'
        }} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <AlertCircle size={24} style={{ color: '#fbbf24' }} />
            <h2 style={{ margin: 0, color: 'white', fontSize: '1.5rem' }}>
              Configuración de Google Drive
            </h2>
          </div>

          <div style={{ color: '#d1d5db', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            <p style={{ marginBottom: '1rem' }}>
              Para conectar con Google Drive, necesitas configurar las credenciales de API en el archivo <code style={{
                background: 'rgba(79, 70, 229, 0.2)',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                color: '#a5b4fc'
              }}>.env</code>
            </p>

            <div style={{
              background: 'rgba(79, 70, 229, 0.1)',
              border: '1px solid rgba(79, 70, 229, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <h3 style={{ color: 'white', fontSize: '1rem', marginTop: 0, marginBottom: '0.75rem' }}>
                Pasos rápidos:
              </h3>
              <ol style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  Ve a <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" style={{
                    color: '#60a5fa',
                    textDecoration: 'none'
                  }}>Google Cloud Console</a>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  Crea un proyecto nuevo o selecciona uno existente
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  Habilita la <strong>Google Drive API</strong>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  Configura la pantalla de consentimiento OAuth (tipo External)
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  Crea credenciales: <strong>OAuth 2.0 Client ID</strong> (tipo Web application)
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  Agrega en "Authorized JavaScript origins":
                  <ul style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                    <li><code style={{ fontSize: '0.875rem' }}>http://localhost:4000</code></li>
                    <li><code style={{ fontSize: '0.875rem' }}>http://127.0.0.1:4000</code></li>
                  </ul>
                </li>
                <li>
                  Copia el Client ID y pégalo en <code style={{
                    fontSize: '0.875rem',
                    background: 'rgba(79, 70, 229, 0.2)',
                    padding: '0.125rem 0.25rem',
                    borderRadius: '2px'
                  }}>.env</code>
                </li>
              </ol>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>
              Las instrucciones detalladas están en el archivo <code style={{
                background: 'rgba(79, 70, 229, 0.2)',
                padding: '0.125rem 0.25rem',
                borderRadius: '2px'
              }}>.env</code> en la raíz del proyecto.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <BaseButton
              onClick={() => setShowConfigModal(false)}
              variant="primary"
              size="md"
            >
              Entendido
            </BaseButton>
          </div>
        </div>
      </div>
    )
  }

  // Vista compacta - solo lo esencial
  if (!status.connected) {
    return (
      <>
        <ConfigModal />
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
              textOverflow: 'ellipsis',
              cursor: 'pointer'
            }} onClick={() => setShowConfigModal(true)} title={error}>
              Error - Click para ayuda
            </span>
          )}
        </div>
      </>
    )
  }

  if (!status.folderSelected) {
    return (
      <>
        <ConfigModal />
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ color: 'white', fontSize: '0.8rem' }}>
            {isLoading ? 'Seleccionando carpeta...' : 'Conectado - Selecciona carpeta'}
          </span>
        </div>
      </>
    )
  }

  // Conectado y configurado
  return (
    <>
      <ConfigModal />
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
    </>
  )
}