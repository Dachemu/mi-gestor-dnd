import { useState, useEffect, useCallback } from 'react'
import { simpleGoogleDrive } from '../services/simpleGoogleDrive'
import { debug } from '../utils/logger'

/**
 * Hook personalizado para usar el servicio simplificado de Google Drive
 */
export function useSimpleGoogleDrive() {
  const [status, setStatus] = useState({
    connected: false,
    autoSaveEnabled: false,
    pendingChanges: 0,
    user: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [campaigns, setCampaigns] = useState([])

  // Actualizar estado periódicamente
  useEffect(() => {
    const updateStatus = () => {
      setStatus(simpleGoogleDrive.getStatus())
    }

    updateStatus()
    const interval = setInterval(updateStatus, 2000)
    return () => clearInterval(interval)
  }, [])

  // Conectar/desconectar
  const toggleConnection = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (status.connected) {
        await simpleGoogleDrive.disconnect()
        setCampaigns([])
        debug('Desconectado de Google Drive')
      } else {
        await simpleGoogleDrive.connect()
        const availableCampaigns = await simpleGoogleDrive.listCampaigns()
        setCampaigns(availableCampaigns)
        debug('Conectado a Google Drive')
      }
    } catch (err) {
      setError(err.message)
      debug('Error en conexión:', err)
    } finally {
      setIsLoading(false)
    }
  }, [status.connected])

  // Guardar campaña manualmente
  const saveCampaign = useCallback(async (campaignName, campaignData) => {
    if (!status.connected) {
      throw new Error('No conectado a Google Drive')
    }

    setIsLoading(true)
    setError(null)

    try {
      await simpleGoogleDrive.saveCampaign(campaignName, campaignData)
      debug(`Campaña guardada: ${campaignName}`)
      return true
    } catch (err) {
      setError(err.message)
      debug('Error guardando:', err)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [status.connected])

  // Cargar campaña
  const loadCampaign = useCallback(async (campaignName) => {
    if (!status.connected) {
      throw new Error('No conectado a Google Drive')
    }

    setIsLoading(true)
    setError(null)

    try {
      const campaignData = await simpleGoogleDrive.loadCampaign(campaignName)
      debug(`Campaña cargada: ${campaignName}`)
      return campaignData
    } catch (err) {
      setError(err.message)
      debug('Error cargando:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [status.connected])

  // Actualizar lista de campañas
  const refreshCampaigns = useCallback(async () => {
    if (!status.connected) return

    setIsLoading(true)
    setError(null)

    try {
      const availableCampaigns = await simpleGoogleDrive.listCampaigns()
      setCampaigns(availableCampaigns)
      debug(`${availableCampaigns.length} campañas encontradas`)
      return availableCampaigns
    } catch (err) {
      setError(err.message)
      debug('Error actualizando lista:', err)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [status.connected])

  // Marcar para auto-guardado
  const markForAutoSave = useCallback((campaignName, campaignData) => {
    if (status.connected && status.autoSaveEnabled) {
      simpleGoogleDrive.markForAutoSave(campaignName, campaignData)
    }
  }, [status.connected, status.autoSaveEnabled])

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // Estado
    status,
    isLoading,
    error,
    campaigns,
    
    // Acciones
    toggleConnection,
    saveCampaign,
    loadCampaign,
    refreshCampaigns,
    markForAutoSave,
    clearError,
    
    // Propiedades derivadas
    isConnected: status.connected,
    hasAutoSave: status.autoSaveEnabled,
    hasPendingChanges: status.pendingChanges > 0,
    userName: status.user
  }
}