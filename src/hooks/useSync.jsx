import { useState, useEffect, useCallback } from 'react'
import syncService from '../services/syncService'
import { debug, error as logError } from '../utils/logger'

export function useSync() {
  const [syncStatus, setSyncStatus] = useState(() => {
    try {
      return syncService.getStatus()
    } catch (error) {
      return {
        isConnected: false,
        lastSync: null,
        pendingChanges: false,
        error: null
      }
    }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [lastSyncResult, setLastSyncResult] = useState(null)
  const [conflicts, setConflicts] = useState([])

  // Actualizar estado desde el servicio
  const updateFromService = useCallback(() => {
    try {
      setSyncStatus(syncService.getStatus())
      setUser(syncService.getCurrentUser())
    } catch (error) {
      logError('Error updating sync status:', error)
    }
  }, [])

  useEffect(() => {
    try {
      // Inicializar servicio de sync
      syncService.init()
      updateFromService()

      // Suscribirse a cambios de estado
      const handleStatusChange = () => {
        updateFromService()
      }

      syncService.addListener(handleStatusChange)

      return () => {
        syncService.removeListener(handleStatusChange)
      }
    } catch (error) {
      logError('Error initializing sync service:', error)
    }
  }, [updateFromService])

  // Conectar con Google Drive
  const connect = useCallback(async () => {
    setIsLoading(true)
    try {
      const success = await syncService.connect()
      if (success) {
        updateFromService()
        debug('Conectado a Google Drive')
        return { success: true }
      }
      return { success: false, error: 'No se pudo conectar' }
    } catch (error) {
      logError('Error al conectar:', error)
      return { success: false, error: error.message || 'Error desconocido' }
    } finally {
      setIsLoading(false)
    }
  }, [updateFromService])

  // Desconectar de Google Drive
  const disconnect = useCallback(async () => {
    setIsLoading(true)
    try {
      const success = await syncService.disconnect()
      if (success) {
        updateFromService()
        setConflicts([])
        setLastSyncResult(null)
        debug('Desconectado de Google Drive')
        return { success: true }
      }
      return { success: false, error: 'No se pudo desconectar' }
    } catch (error) {
      logError('Error al desconectar:', error)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }, [updateFromService])

  // Subir campañas a la nube
  const syncToCloud = useCallback(async () => {
    if (!syncStatus.isConnected) {
      return { success: false, error: 'No está conectado a Google Drive' }
    }

    setIsLoading(true)
    try {
      const result = await syncService.syncToCloud()
      setLastSyncResult(result)
      debug(`Sync to cloud completado: ${result.uploaded} subidas, ${result.updated} actualizaciones`)
      return { success: true, result }
    } catch (error) {
      logError('Error en sync to cloud:', error)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }, [syncStatus.isConnected])

  // Descargar campañas de la nube
  const syncFromCloud = useCallback(async () => {
    if (!syncStatus.isConnected) {
      return { success: false, error: 'No está conectado a Google Drive' }
    }

    setIsLoading(true)
    try {
      const result = await syncService.syncFromCloud()
      setLastSyncResult(result)
      
      if (result.conflicts.length > 0) {
        setConflicts(result.conflicts)
      }
      
      debug(`Sync from cloud completado: ${result.downloaded} descargadas, ${result.conflicts.length} conflictos`)
      return { success: true, result }
    } catch (error) {
      logError('Error en sync from cloud:', error)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }, [syncStatus.isConnected])

  // Resolver conflicto
  const resolveConflict = useCallback(async (campaignName, useDriveVersion) => {
    setIsLoading(true)
    try {
      await syncService.resolveConflict(campaignName, useDriveVersion)
      
      // Remover conflicto resuelto de la lista
      setConflicts(prev => prev.filter(c => c.name !== campaignName))
      
      debug(`Conflicto resuelto para '${campaignName}' usando versión ${useDriveVersion ? 'de Drive' : 'local'}`)
      return { success: true }
    } catch (error) {
      logError('Error al resolver conflicto:', error)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Marcar cambios pendientes
  const markPendingChanges = useCallback(() => {
    syncService.markPendingChanges()
  }, [])

  // Sincronización bidireccional completa
  const fullSync = useCallback(async () => {
    if (!syncStatus.isConnected) {
      return { success: false, error: 'No está conectado a Google Drive' }
    }

    setIsLoading(true)
    try {
      // Primero subir cambios locales
      const uploadResult = await syncService.syncToCloud()
      
      // Luego descargar cambios remotos
      const downloadResult = await syncService.syncFromCloud()
      
      const combinedResult = {
        uploaded: uploadResult.uploaded,
        updated: uploadResult.updated,
        downloaded: downloadResult.downloaded,
        conflicts: downloadResult.conflicts,
        errors: [...uploadResult.errors, ...downloadResult.errors]
      }
      
      setLastSyncResult(combinedResult)
      
      if (combinedResult.conflicts.length > 0) {
        setConflicts(combinedResult.conflicts)
      }
      
      debug(`Sync completo: ${combinedResult.uploaded} subidas, ${combinedResult.updated} actualizaciones, ${combinedResult.downloaded} descargadas, ${combinedResult.conflicts.length} conflictos`)
      return { success: true, result: combinedResult }
    } catch (error) {
      logError('Error en sync completo:', error)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }, [syncStatus.isConnected])

  // Limpiar conflictos
  const clearConflicts = useCallback(() => {
    setConflicts([])
  }, [])

  // Limpiar último resultado
  const clearLastResult = useCallback(() => {
    setLastSyncResult(null)
  }, [])

  return {
    // Estado
    syncStatus,
    isLoading,
    user,
    lastSyncResult,
    conflicts,
    
    // Acciones
    connect,
    disconnect,
    syncToCloud,
    syncFromCloud,
    fullSync,
    resolveConflict,
    markPendingChanges,
    
    // Utilidades
    clearConflicts,
    clearLastResult,
    
    // Estado computado
    isConnected: syncStatus.isConnected,
    hasError: !!syncStatus.error,
    hasPendingChanges: syncStatus.pendingChanges,
    hasConflicts: conflicts.length > 0,
    canSync: syncStatus.isConnected && !isLoading,
    lastSync: syncStatus.lastSync
  }
}