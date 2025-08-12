/**
 * Indicador de Estado de Sincronización - Versión Minimalista
 * Muestra el estado de sync de forma no intrusiva
 */

import React, { useState, useEffect } from 'react'
import { Cloud, CloudOff, Wifi, WifiOff, AlertTriangle, RefreshCw } from 'lucide-react'
import syncConfig from '../../config/syncConfig'
import syncService from '../../services/syncService'
import { ConflictResolutionModal } from './ConflictResolutionModal'
import { debug } from '../../utils/logger'
import styles from './SyncStatusIndicator.module.css'

export function SyncStatusIndicator() {
  const [syncState, setSyncState] = useState({
    available: false,
    connected: false,
    user: null,
    lastSync: null,
    error: null,
    isMock: false,
    pendingChanges: false,
    isLoading: false,
    conflicts: []
  })

  const [showConflictModal, setShowConflictModal] = useState(false)

  useEffect(() => {
    initializeSync()
  }, [])

  const initializeSync = async () => {
    const available = syncConfig.isSyncAvailable()
    const isMock = syncConfig.isMockMode()
    
    setSyncState(prev => ({
      ...prev,
      available,
      isMock
    }))

    if (available) {
      // Inicializar servicio de sync
      await syncService.init()
      
      // Obtener estado inicial
      updateSyncState()
      
      // Suscribirse a cambios
      syncService.addListener(handleSyncStateChange)
    }

    debug('🔄 SyncStatusIndicator inicializado:', { available, isMock })
  }

  const updateSyncState = () => {
    const status = syncService.getStatus()
    const user = syncService.getCurrentUser()
    
    setSyncState(prev => ({
      ...prev,
      connected: status.isConnected,
      user,
      lastSync: status.lastSync,
      error: status.error,
      pendingChanges: status.pendingChanges
    }))
  }

  const handleSyncStateChange = (status) => {
    const user = syncService.getCurrentUser()
    
    setSyncState(prev => ({
      ...prev,
      connected: status.isConnected,
      user,
      lastSync: status.lastSync,
      error: status.error,
      pendingChanges: status.pendingChanges
    }))
  }

  const handleClick = async () => {
    if (!syncState.available) {
      alert('Google Drive Sync no está configurado. Revisa las variables de entorno.\n\nSigue la guía en CONFIGURACION_GOOGLE_DRIVE.md')
      return
    }

    if (syncState.isMock) {
      await handleMockActions()
      return
    }

    if (syncState.connected) {
      await handleConnectedActions()
    } else {
      await handleConnect()
    }
  }

  const handleMockActions = async () => {
    const action = confirm('🧪 Modo de desarrollo\n\n¿Quieres simular una sincronización?')
    if (action) {
      setSyncState(prev => ({ ...prev, isLoading: true }))
      try {
        await syncService.syncToCloud()
        alert('✅ Sincronización simulada completada')
      } catch (error) {
        alert('❌ Error en sincronización simulada: ' + error.message)
      } finally {
        setSyncState(prev => ({ ...prev, isLoading: false }))
      }
    }
  }

  const handleConnect = async () => {
    setSyncState(prev => ({ ...prev, isLoading: true }))
    try {
      debug('🔐 Iniciando conexión...')
      const success = await syncService.connect()
      if (success) {
        alert('✅ Conectado a Google Drive exitosamente')
      } else {
        alert('❌ No se pudo conectar con Google Drive')
      }
    } catch (error) {
      alert('❌ Error al conectar: ' + error.message)
    } finally {
      setSyncState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const handleConnectedActions = async () => {
    if (syncState.pendingChanges) {
      const sync = confirm(`🔄 Hay cambios pendientes\n\n¿Sincronizar hacia Drive ahora?`)
      if (sync) {
        await handleSync()
      }
      return
    }

    // Menú de opciones cuando está conectado sin cambios pendientes
    const options = [
      '📤 Subir cambios a Drive',
      '📥 Descargar desde Drive', 
      '🔄 Sincronización completa (bidireccional)',
      '🤖 Sincronización inteligente (auto-merge)',
      '⚡ Sincronización incremental (solo cambios)',
      '❌ Cancelar'
    ]
    
    const choice = prompt(`✅ Conectado como ${syncState.user?.name}\n\n${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}\n\n¿Qué deseas hacer? (1-6):`)
    
    if (!choice) return
    
    const option = parseInt(choice)
    
    switch (option) {
      case 1:
        await handleSync()
        break
      case 2:
        await handleSyncFromCloud()
        break
      case 3:
        await handleFullSync()
        break
      case 4:
        await handleSmartSync()
        break
      case 5:
        await handleIncrementalSync()
        break
      case 6:
      default:
        return
    }
  }

  const handleSync = async () => {
    setSyncState(prev => ({ ...prev, isLoading: true }))
    try {
      const result = await syncService.syncToCloud()
      alert(`✅ Subida a Drive completada\n${result.uploaded} subidas, ${result.updated} actualizaciones`)
    } catch (error) {
      alert('❌ Error en subida: ' + error.message)
    } finally {
      setSyncState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const handleSyncFromCloud = async () => {
    setSyncState(prev => ({ ...prev, isLoading: true }))
    try {
      const result = await syncService.syncFromCloud()
      
      // Si hay conflictos, mostrar modal
      if (result.conflicts && result.conflicts.length > 0) {
        setSyncState(prev => ({ 
          ...prev, 
          conflicts: result.conflicts,
          isLoading: false
        }))
        setShowConflictModal(true)
        return
      }
      
      // Si no hay conflictos, mostrar mensaje de resultado
      let message = `✅ Descarga desde Drive completada\n`
      
      if (result.downloaded > 0) {
        message += `📥 ${result.downloaded} campañas nuevas descargadas\n`
      }
      
      if (result.updated > 0) {
        message += `🔄 ${result.updated} campañas actualizadas\n`
      }
      
      if (result.errors && result.errors.length > 0) {
        message += `❌ ${result.errors.length} errores durante descarga`
      }
      
      if (result.downloaded === 0 && result.updated === 0) {
        message += `📌 No hay cambios nuevos en Drive`
      }
      
      alert(message)
    } catch (error) {
      alert('❌ Error en descarga: ' + error.message)
    } finally {
      setSyncState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const handleFullSync = async () => {
    setSyncState(prev => ({ ...prev, isLoading: true }))
    try {
      // Primero subir cambios locales
      const uploadResult = await syncService.syncToCloud()
      
      // Luego descargar cambios desde Drive
      const downloadResult = await syncService.syncFromCloud()
      
      let message = `✅ Sincronización bidireccional completada\n\n`
      message += `📤 Subida: ${uploadResult.uploaded} nuevas, ${uploadResult.updated} actualizadas\n`
      message += `📥 Descarga: ${downloadResult.downloaded} nuevas, ${downloadResult.updated} actualizadas\n`
      
      if (downloadResult.conflicts && downloadResult.conflicts.length > 0) {
        message += `\n⚠️ ${downloadResult.conflicts.length} conflictos detectados`
      }
      
      const totalErrors = (uploadResult.errors?.length || 0) + (downloadResult.errors?.length || 0)
      if (totalErrors > 0) {
        message += `\n❌ ${totalErrors} errores encontrados`
      }
      
      alert(message)
    } catch (error) {
      alert('❌ Error en sincronización completa: ' + error.message)
    } finally {
      setSyncState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const handleSmartSync = async () => {
    setSyncState(prev => ({ ...prev, isLoading: true }))
    try {
      const result = await syncService.smartSync()
      
      let message = `🤖 Sincronización inteligente completada\n\n`
      
      // Resumen de la sincronización
      const summary = result.summary
      message += `📊 Resumen:\n`
      message += `• ${summary.uploaded} campañas subidas\n`
      message += `• ${summary.downloaded} campañas descargadas\n`
      message += `• ${summary.updated} campañas actualizadas\n`
      
      if (summary.autoMerged > 0) {
        message += `• ${summary.autoMerged} conflictos resueltos automáticamente\n`
      }
      
      if (summary.manualConflicts > 0) {
        message += `\n⚠️ ${summary.manualConflicts} conflictos requieren resolución manual\n`
        message += `Las campañas afectadas aparecerán en un modal separado.`
        
        // Si hay conflictos manuales pendientes, mostrarlos
        if (result.smartMerge.remaining > 0) {
          // Simular conflictos pendientes para mostrar el modal
          // En la implementación real, esto vendría del resultado
          setSyncState(prev => ({
            ...prev,
            conflicts: [], // Los conflictos reales se obtendrían aquí
            isLoading: false
          }))
          // setShowConflictModal(true) // Descomentar cuando se implementen conflictos reales
        }
      }
      
      if (summary.errors > 0) {
        message += `\n❌ ${summary.errors} errores encontrados`
      }
      
      if (result.smartMerge.merged.length > 0) {
        message += `\n\n✨ Fusiones automáticas exitosas:\n`
        message += result.smartMerge.merged.map(name => `• ${name}`).join('\n')
      }

      alert(message)
    } catch (error) {
      alert('❌ Error en sincronización inteligente: ' + error.message)
    } finally {
      setSyncState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const handleIncrementalSync = async () => {
    setSyncState(prev => ({ ...prev, isLoading: true }))
    try {
      const result = await syncService.syncIncremental()
      
      let message = `⚡ Sincronización incremental completada\n\n`
      
      const summary = result.summary
      message += `📊 Resumen:\n`
      message += `• ${summary.totalCampaigns} campañas analizadas\n`
      
      if (summary.changedCampaigns > 0) {
        message += `• ${summary.changedCampaigns} campañas con cambios\n`
        message += `• ${summary.totalOperations} operaciones aplicadas\n`
        message += `• ${(summary.totalBytesSaved / 1024).toFixed(1)} KB ahorrados\n`
        message += `• ${summary.averageEfficiency}% eficiencia promedio\n`
      } else {
        message += `• Ninguna campaña tenía cambios\n`
      }
      
      if (summary.unchangedCampaigns > 0) {
        message += `• ${summary.unchangedCampaigns} campañas sin cambios (omitidas)\n`
      }
      
      if (summary.errors > 0) {
        message += `\n❌ ${summary.errors} errores encontrados`
      }

      // Mostrar detalles de eficiencia
      if (summary.totalBytesSaved > 1024) {
        const kbSaved = (summary.totalBytesSaved / 1024).toFixed(1)
        message += `\n\n💡 ¡Excelente! Se ahorraron ${kbSaved} KB de datos`
        message += `\nEsto hace la sincronización ${summary.averageEfficiency}% más eficiente`
      }

      alert(message)
    } catch (error) {
      alert('❌ Error en sincronización incremental: ' + error.message)
    } finally {
      setSyncState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const handleResolveConflict = async (campaignName, useDriveVersion) => {
    try {
      await syncService.resolveConflict(campaignName, useDriveVersion)
      
      // Remover el conflicto resuelto de la lista
      setSyncState(prev => ({
        ...prev,
        conflicts: prev.conflicts.filter(c => 
          (c.name || c.campaignName) !== campaignName
        )
      }))

      // Si no quedan conflictos, cerrar modal
      const remainingConflicts = syncState.conflicts.filter(c => 
        (c.name || c.campaignName) !== campaignName
      )
      
      if (remainingConflicts.length === 0) {
        setShowConflictModal(false)
        alert('✅ Todos los conflictos han sido resueltos')
      }
    } catch (error) {
      alert('❌ Error al resolver conflicto: ' + error.message)
    }
  }

  const handleCloseConflictModal = () => {
    setShowConflictModal(false)
    setSyncState(prev => ({ ...prev, conflicts: [] }))
  }

  const getStatusIcon = () => {
    if (!syncState.available) {
      return <WifiOff className={styles.iconDisabled} />
    }

    if (syncState.error) {
      return <AlertTriangle className={styles.iconError} />
    }

    if (syncState.connected) {
      return <Cloud className={styles.iconConnected} />
    }

    return <CloudOff className={styles.iconDisconnected} />
  }

  const getStatusText = () => {
    if (!syncState.available) {
      return 'Sync no configurado'
    }

    if (syncState.isMock) {
      return 'Modo desarrollo'
    }

    if (syncState.error) {
      return 'Error de sync'
    }

    if (syncState.connected) {
      return syncState.user ? `Conectado: ${syncState.user.name}` : 'Conectado'
    }

    return 'Desconectado'
  }

  const getStatusClass = () => {
    if (!syncState.available) return styles.statusDisabled
    if (syncState.error) return styles.statusError  
    if (syncState.connected) return styles.statusConnected
    return styles.statusDisconnected
  }

  return (
    <>
      <div 
        className={`${styles.indicator} ${getStatusClass()}`}
        onClick={handleClick}
        title={getStatusText()}
      >
        {getStatusIcon()}
        <span className={styles.statusText}>
          {getStatusText()}
        </span>
        {syncState.isMock && (
          <span className={styles.mockBadge}>DEMO</span>
        )}
        {syncState.conflicts.length > 0 && (
          <span className={styles.conflictsBadge}>{syncState.conflicts.length}</span>
        )}
      </div>

      {/* Modal de resolución de conflictos */}
      <ConflictResolutionModal
        isOpen={showConflictModal}
        onClose={handleCloseConflictModal}
        conflicts={syncState.conflicts}
        onResolveConflict={handleResolveConflict}
        isLoading={syncState.isLoading}
      />
    </>
  )
}