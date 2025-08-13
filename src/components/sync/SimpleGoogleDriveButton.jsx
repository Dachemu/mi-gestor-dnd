import React, { useState, useEffect } from 'react'
import { Cloud, CloudOff, Save, RefreshCw } from 'lucide-react'
import BaseButton from '../ui/base/BaseButton'
import { simpleGoogleDrive } from '../../services/simpleGoogleDrive'
import { debug } from '../../utils/logger'
import styles from './GoogleSyncButton.module.css'

export function SimpleGoogleDriveButton({ campaignName, campaignData, onCampaignLoaded }) {
  const [status, setStatus] = useState({
    connected: false,
    autoSaveEnabled: false,
    pendingChanges: 0,
    user: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [campaigns, setCampaigns] = useState([])

  // Actualizar estado cada pocos segundos
  useEffect(() => {
    const updateStatus = () => {
      setStatus(simpleGoogleDrive.getStatus())
    }

    updateStatus()
    const interval = setInterval(updateStatus, 3000)
    return () => clearInterval(interval)
  }, [])

  // Auto-marcar cambios cuando cambie campaignData
  useEffect(() => {
    if (status.connected && campaignName && campaignData) {
      simpleGoogleDrive.markForAutoSave(campaignName, campaignData)
    }
  }, [campaignData, campaignName, status.connected])

  const handleConnect = async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (status.connected) {
        await simpleGoogleDrive.disconnect()
        setCampaigns([])
      } else {
        await simpleGoogleDrive.connect()
        // Cargar lista de campañas disponibles
        const availableCampaigns = await simpleGoogleDrive.listCampaigns()
        setCampaigns(availableCampaigns)
      }
    } catch (err) {
      setError(err.message)
      debug('Error en conexión:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualSave = async () => {
    if (!campaignName || !campaignData) return
    
    setIsLoading(true)
    setError(null)

    try {
      await simpleGoogleDrive.saveCampaign(campaignName, campaignData)
      debug(`Guardado manual exitoso: ${campaignName}`)
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
      const loadedData = await simpleGoogleDrive.loadCampaign(campaignToLoad)
      onCampaignLoaded?.(campaignToLoad, loadedData)
      debug(`Campaña cargada: ${campaignToLoad}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefreshCampaigns = async () => {
    if (!status.connected) return

    setIsLoading(true)
    try {
      const availableCampaigns = await simpleGoogleDrive.listCampaigns()
      setCampaigns(availableCampaigns)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!status.connected) {
    return (
      <div className={styles.syncContainer}>
        <BaseButton
          onClick={handleConnect}
          disabled={isLoading}
          variant="outline"
          className={styles.connectButton}
        >
          <CloudOff className={styles.icon} />
          {isLoading ? 'Conectando...' : 'Conectar Google Drive'}
        </BaseButton>
        
        {error && (
          <div className={styles.error}>
            Error: {error}
          </div>
        )}

        <div className={styles.helpText}>
          Una vez conectado, tus campañas se guardarán automáticamente cada 30 segundos.
        </div>
      </div>
    )
  }

  return (
    <div className={styles.syncContainer}>
      {/* Usuario conectado */}
      <div className={styles.userInfo}>
        <Cloud className={styles.icon} />
        <span className={styles.userName}>
          {status.user || 'Conectado a Drive'}
        </span>
        <BaseButton
          onClick={handleConnect}
          disabled={isLoading}
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
            ✅ Auto-guardado activo
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
          onClick={handleManualSave}
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
          <RefreshCw className={styles.iconSm} />
          Actualizar Lista
        </BaseButton>
      </div>

      {/* Lista de campañas disponibles en Drive */}
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