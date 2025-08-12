import React, { useState } from 'react'
import { Cloud, CloudOff, Upload, Download, RefreshCw, AlertTriangle } from 'lucide-react'
import BaseButton from '../ui/base/BaseButton'
import { ConflictResolutionModal } from './ConflictResolutionModal'
import { useSync } from '../../hooks/useSync'
import { debug } from '../../utils/logger'
import styles from './GoogleSyncButton.module.css'

export function GoogleSyncButton() {
  const [showConflicts, setShowConflicts] = useState(false)
  const {
    syncStatus,
    isLoading,
    user,
    conflicts,
    connect,
    disconnect,
    syncToCloud,
    syncFromCloud,
    fullSync,
    resolveConflict,
    isConnected,
    hasConflicts,
    canSync
  } = useSync()

  const handleConnect = async () => {
    if (isConnected) {
      await disconnect()
    } else {
      await connect()
    }
  }

  const handleSyncToCloud = async () => {
    const result = await syncToCloud()
    if (result.success) {
      debug(`Sync to cloud completado: ${result.result.uploaded} subidas, ${result.result.updated} actualizaciones`)
    }
  }

  const handleSyncFromCloud = async () => {
    const result = await syncFromCloud()
    if (result.success && result.result.conflicts.length > 0) {
      setShowConflicts(true)
    }
  }

  const handleFullSync = async () => {
    const result = await fullSync()
    if (result.success && result.result.conflicts.length > 0) {
      setShowConflicts(true)
    }
  }

  const handleResolveConflict = async (campaignName, useDriveVersion) => {
    await resolveConflict(campaignName, useDriveVersion)
  }

  if (!isConnected) {
    return (
      <div className={styles.syncContainer}>
        <BaseButton
          onClick={handleConnect}
          disabled={isLoading}
          variant="outline"
          className={styles.connectButton}
        >
          <CloudOff className={styles.icon} />
          {isLoading ? 'Conectando...' : 'Conectar con Google Drive'}
        </BaseButton>
        
        {syncStatus.error && (
          <div className={styles.error}>
            Error: {syncStatus.error}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className={styles.syncContainer}>
        <div className={styles.userInfo}>
          <Cloud className={styles.icon} />
          <span className={styles.userName}>
            {user?.name || 'Usuario conectado'}
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

        <div className={styles.syncActions}>
          <BaseButton
            onClick={handleSyncToCloud}
            disabled={!canSync}
            variant="primary"
            size="sm"
          >
            <Upload className={styles.iconSm} />
            Subir a Drive
          </BaseButton>
          
          <BaseButton
            onClick={handleSyncFromCloud}
            disabled={!canSync}
            variant="secondary"
            size="sm"
          >
            <Download className={styles.iconSm} />
            Descargar de Drive
          </BaseButton>

          <BaseButton
            onClick={handleFullSync}
            disabled={!canSync}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={styles.iconSm} />
            Sync Completo
          </BaseButton>
        </div>

        {hasConflicts && (
          <div className={styles.conflictsWarning} onClick={() => setShowConflicts(true)}>
            <AlertTriangle className={styles.iconSm} />
            {conflicts.length} conflicto{conflicts.length > 1 ? 's' : ''} detectado{conflicts.length > 1 ? 's' : ''} - Click para resolver
          </div>
        )}

        {syncStatus.lastSync && (
          <div className={styles.lastSync}>
            Última sincronización: {syncStatus.lastSync.toLocaleString()}
          </div>
        )}

        {syncStatus.pendingChanges && (
          <div className={styles.pendingChanges}>
            <RefreshCw className={styles.iconSm} />
            Cambios pendientes de sincronizar
          </div>
        )}

        {syncStatus.error && (
          <div className={styles.error}>
            Error: {syncStatus.error}
          </div>
        )}
      </div>

      <ConflictResolutionModal
        isOpen={showConflicts}
        onClose={() => setShowConflicts(false)}
        conflicts={conflicts}
        onResolveConflict={handleResolveConflict}
        isLoading={isLoading}
      />
    </>
  )
}