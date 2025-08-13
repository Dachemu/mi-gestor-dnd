import React, { useState, useEffect } from 'react'
import { Cloud, CloudOff, Save, Download, FolderOpen } from 'lucide-react'
import BaseButton from '../ui/base/BaseButton'
import { zeroConfigGoogleDrive } from '../../services/zeroConfigGoogleDrive'
import { debug } from '../../utils/logger'
import styles from './GoogleSyncButton.module.css'

export function ZeroConfigDriveButton({ campaignName, campaignData, onCampaignLoaded }) {
  const [status, setStatus] = useState({
    connected: false,
    folderSelected: false,
    folderName: null,
    autoSaveEnabled: false,
    pendingChanges: 0,
    user: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [campaigns, setCampaigns] = useState([])
  const [step, setStep] = useState('disconnected') // disconnected, connected, folder-selected

  // Actualizar estado periódicamente
  useEffect(() => {
    const updateStatus = () => {
      const currentStatus = zeroConfigGoogleDrive.getStatus()
      setStatus(currentStatus)
      
      // Determinar paso actual
      if (!currentStatus.connected) {
        setStep('disconnected')
      } else if (!currentStatus.folderSelected) {
        setStep('connected')
      } else {
        setStep('folder-selected')
      }
    }

    updateStatus()
    const interval = setInterval(updateStatus, 2000)
    return () => clearInterval(interval)
  }, [])

  // Auto-marcar cambios cuando cambie campaignData
  useEffect(() => {
    if (status.connected && status.folderSelected && campaignName && campaignData) {
      zeroConfigGoogleDrive.markForAutoSave(campaignName, campaignData)
    }
  }, [campaignData, campaignName, status.connected, status.folderSelected])

  const handleConnect = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const success = await zeroConfigGoogleDrive.connect()
      if (success) {
        debug('✅ Conectado exitosamente a Google')
        // Automáticamente seleccionar carpeta después de conectar
        await handleSelectFolder()
      } else {
        setError('No se pudo conectar con Google')
      }
    } catch (err) {
      setError(err.message)
      debug('❌ Error conectando:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectFolder = async (useCustomPath = false) => {
    setIsLoading(true)
    setError(null)

    try {
      const folder = await zeroConfigGoogleDrive.selectFolder(useCustomPath)
      if (folder) {
        debug(`📁 Carpeta seleccionada: ${folder.name}`)
        // Cargar campañas disponibles
        const availableCampaigns = await zeroConfigGoogleDrive.listCampaigns()
        setCampaigns(availableCampaigns)
      }
    } catch (err) {
      setError(err.message)
      debug('❌ Error seleccionando carpeta:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveCampaign = async () => {
    if (!campaignName || !campaignData) return
    
    setIsLoading(true)
    setError(null)

    try {
      await zeroConfigGoogleDrive.saveCampaign(campaignName, campaignData)
      debug(`💾 Campaña guardada: ${campaignName}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadCampaign = async (campaignToLoad) => {
    setIsLoading(true)
    setError(null)

    try {
      const loadedData = await zeroConfigGoogleDrive.loadCampaign(campaignToLoad)
      onCampaignLoaded?.(campaignToLoad, loadedData)
      debug(`📥 Campaña cargada: ${campaignToLoad}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = () => {
    zeroConfigGoogleDrive.disconnect()
    setCampaigns([])
    setError(null)
    debug('👋 Desconectado de Google Drive')
  }

  const handleRefreshCampaigns = async () => {
    if (!status.folderSelected) return

    setIsLoading(true)
    try {
      const availableCampaigns = await zeroConfigGoogleDrive.listCampaigns()
      setCampaigns(availableCampaigns)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // PASO 1: No conectado
  if (step === 'disconnected') {
    return (
      <div className={styles.syncContainer}>
        <BaseButton
          onClick={handleConnect}
          disabled={isLoading}
          variant="primary"
          className={styles.connectButton}
        >
          <CloudOff className={styles.icon} />
          {isLoading ? 'Conectando...' : 'Conectar con Google Drive'}
        </BaseButton>
        
        {error && (
          <div className={styles.error}>
            Error: {error}
          </div>
        )}

        <div className={styles.helpText}>
          ¡Un click y listo! Se abrirá una ventana para iniciar sesión con Google.
        </div>
      </div>
    )
  }

  // PASO 2: Conectado pero sin carpeta
  if (step === 'connected') {
    return (
      <div className={styles.syncContainer}>
        <div className={styles.userInfo}>
          <Cloud className={styles.icon} />
          <span className={styles.userName}>
            {status.user || 'Conectado a Google'}
          </span>
          <BaseButton
            onClick={handleDisconnect}
            variant="ghost"
            size="sm"
          >
            Desconectar
          </BaseButton>
        </div>

        <div className={styles.folderOptions}>
          <BaseButton
            onClick={() => handleSelectFolder(false)}
            disabled={isLoading}
            variant="primary"
          >
            <FolderOpen className={styles.icon} />
            {isLoading ? 'Configurando...' : 'Usar Carpeta Automática'}
          </BaseButton>

          <BaseButton
            onClick={() => handleSelectFolder(true)}
            disabled={isLoading}
            variant="secondary"
          >
            <FolderOpen className={styles.icon} />
            {isLoading ? 'Configurando...' : 'Elegir Carpeta Personalizada'}
          </BaseButton>
        </div>

        {error && (
          <div className={styles.error}>
            Error: {error}
          </div>
        )}

        <div className={styles.helpText}>
          <strong>Automática:</strong> Se crea "Mi Gestor DnD" en tu Drive raíz<br/>
          <strong>Personalizada:</strong> Elige cualquier carpeta de tu Drive
        </div>
      </div>
    )
  }

  // PASO 3: Todo configurado
  return (
    <div className={styles.syncContainer}>
      {/* Usuario y carpeta */}
      <div className={styles.userInfo}>
        <Cloud className={styles.icon} />
        <div className={styles.userDetails}>
          <span className={styles.userName}>
            {status.user || 'Conectado'}
          </span>
          <span className={styles.folderName}>
            📁 {status.folderName}
          </span>
        </div>
        <BaseButton
          onClick={handleDisconnect}
          variant="ghost"
          size="sm"
        >
          Desconectar
        </BaseButton>
      </div>

      {/* Estado de auto-guardado */}
      <div className={styles.autoSaveStatus}>
        {status.autoSaveEnabled ? (
          <div className={styles.autoSaveEnabled}>
            ✅ Auto-guardado activo cada 30 segundos
            {status.pendingChanges > 0 && (
              <span className={styles.pendingChanges}>
                ({status.pendingChanges} cambios pendientes)
              </span>
            )}
          </div>
        ) : (
          <div className={styles.autoSaveDisabled}>
            ⏸️ Auto-guardado pausado
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className={styles.syncActions}>
        <BaseButton
          onClick={handleSaveCampaign}
          disabled={isLoading || !campaignName || !campaignData}
          variant="primary"
          size="sm"
        >
          <Save className={styles.iconSm} />
          Guardar Ahora
        </BaseButton>

        <BaseButton
          onClick={handleRefreshCampaigns}
          disabled={isLoading}
          variant="secondary"
          size="sm"
        >
          <Download className={styles.iconSm} />
          Actualizar Lista
        </BaseButton>
      </div>

      {/* Lista de campañas en Drive */}
      {campaigns.length > 0 && (
        <div className={styles.campaignsList}>
          <h4>Campañas en Google Drive:</h4>
          <div className={styles.campaignsGrid}>
            {campaigns.map((campaign) => (
              <div key={campaign.id} className={styles.campaignItem}>
                <div className={styles.campaignName}>{campaign.name}</div>
                <div className={styles.campaignDate}>
                  {campaign.lastModified.toLocaleDateString()}
                </div>
                <BaseButton
                  onClick={() => handleLoadCampaign(campaign.name)}
                  disabled={isLoading}
                  variant="ghost"
                  size="sm"
                >
                  Cargar
                </BaseButton>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          Error: {error}
        </div>
      )}
    </div>
  )
}