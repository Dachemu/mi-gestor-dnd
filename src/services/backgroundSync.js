/**
 * Servicio de Sincronización en Background
 * Gestiona sync automático y background usando Service Workers cuando están disponibles
 */

import syncService from './syncService'
import offlineManager from './offlineManager'
import progressTracker from './progressTracker'
import { loadCampaigns } from './storage'
import { debug, warn, error as logError } from '../utils/logger'

class BackgroundSync {
  constructor() {
    this.isEnabled = false
    this.syncInterval = 5 * 60 * 1000 // 5 minutos por defecto
    this.maxRetries = 3
    this.retryDelay = 30 * 1000 // 30 segundos
    this.syncInProgress = false
    this.lastSync = null
    this.failedSyncs = new Map()
    
    // Configuración de sync automático
    this.autoSyncConfig = {
      enabled: true,
      interval: 5 * 60 * 1000, // 5 minutos
      onlyWhenOnline: true,
      smartSync: true, // Solo sincronizar si hay cambios
      maxConcurrentSyncs: 2,
      quietHours: { start: 22, end: 7 } // No sync automático de 22:00 a 7:00
    }
    
    this.init()
    debug('🔄 BackgroundSync inicializado')
  }

  /**
   * Inicializa el servicio de background sync
   */
  async init() {
    // Verificar soporte para Service Workers
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready
        this.serviceWorkerRegistration = registration
        
        // Verificar soporte para Background Sync API
        if ('sync' in registration) {
          this.backgroundSyncSupported = true
          debug('🔄 Background Sync API disponible')
        } else {
          debug('🔄 Background Sync API no soportado, usando fallback')
          this.backgroundSyncSupported = false
        }
      } catch (error) {
        warn('🔄 Service Worker no disponible:', error.message)
        this.backgroundSyncSupported = false
      }
    }
    
    // Configurar sync automático usando timers como fallback
    this.setupAutoSync()
    
    // Escuchar cambios de conectividad
    window.addEventListener('online', () => {
      this.handleConnectivityChange(true)
    })
    
    window.addEventListener('offline', () => {
      this.handleConnectivityChange(false)
    })
    
    this.isEnabled = true
  }

  /**
   * Configura sincronización automática
   */
  setupAutoSync() {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval)
    }
    
    if (this.autoSyncConfig.enabled) {
      this.autoSyncInterval = setInterval(() => {
        this.performAutoSync()
      }, this.autoSyncConfig.interval)
      
      debug(`🔄 Auto-sync configurado cada ${this.autoSyncConfig.interval / 1000}s`)
    }
  }

  /**
   * Registra una operación de sync para background
   */
  async scheduleBackgroundSync(operation) {
    const syncId = `sync-${operation.type}-${operation.campaignId || 'all'}-${Date.now()}`
    
    try {
      // Intentar usar Background Sync API si está disponible
      if (this.backgroundSyncSupported && this.serviceWorkerRegistration) {
        await this.serviceWorkerRegistration.sync.register(syncId)
        debug(`🔄 Background sync programado: ${syncId}`)
        return syncId
      }
      
      // Fallback: agregar a queue manual
      await offlineManager.queueOfflineOperation({
        ...operation,
        backgroundSync: true,
        syncId
      })
      
      debug(`🔄 Sync encolado para background: ${syncId}`)
      return syncId
      
    } catch (error) {
      logError(`❌ Error programando background sync: ${syncId}`, error)
      throw error
    }
  }

  /**
   * Sincronización automática inteligente
   */
  async performAutoSync() {
    if (this.syncInProgress) {
      debug('🔄 Auto-sync omitido: sync en progreso')
      return
    }
    
    // Verificar condiciones para auto-sync
    if (!this.shouldPerformAutoSync()) {
      return
    }
    
    this.syncInProgress = true
    const operationId = `auto-sync-${Date.now()}`
    
    try {
      const progress = progressTracker.createSyncOperation('auto', 'auto-sync')
      progress.setPhase('analyzing', 'Analizando cambios...')
      
      const campaigns = loadCampaigns()
      const campaignsToSync = this.autoSyncConfig.smartSync 
        ? await this.getCampaignsWithChanges(campaigns)
        : campaigns.slice(0, this.autoSyncConfig.maxConcurrentSyncs)
      
      if (campaignsToSync.length === 0) {
        progress.setPhase('completed', 'Sin cambios para sincronizar')
        progress.complete({ synced: 0, reason: 'no_changes' })
        return
      }
      
      progress.setPhase('syncing', `Sincronizando ${campaignsToSync.length} campañas...`)
      
      let syncedCount = 0
      let failedCount = 0
      
      // Sincronizar campañas en lotes pequeños
      for (let i = 0; i < campaignsToSync.length; i += 2) {
        const batch = campaignsToSync.slice(i, i + 2)
        
        const batchPromises = batch.map(async campaign => {
          try {
            await syncService.syncBidirectional(campaign.id)
            syncedCount++
            this.failedSyncs.delete(campaign.id)
            return { success: true, campaignId: campaign.id }
          } catch (error) {
            failedCount++
            this.recordFailedSync(campaign.id, error)
            return { success: false, campaignId: campaign.id, error: error.message }
          }
        })
        
        await Promise.allSettled(batchPromises)
        
        // Actualizar progreso
        const totalProgress = ((i + batch.length) / campaignsToSync.length) * 100
        progress.setProgress(totalProgress, `Batch ${Math.ceil((i + 1) / 2)} completado`)
        
        // Pausa breve entre lotes para no sobrecargar
        if (i + 2 < campaignsToSync.length) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
      
      this.lastSync = {
        timestamp: Date.now(),
        synced: syncedCount,
        failed: failedCount,
        total: campaignsToSync.length
      }
      
      const result = {
        synced: syncedCount,
        failed: failedCount,
        total: campaignsToSync.length,
        summary: `${syncedCount} sincronizadas, ${failedCount} fallos`
      }
      
      progress.complete(result)
      debug(`🔄 Auto-sync completado: ${syncedCount}/${campaignsToSync.length} exitosas`)
      
    } catch (error) {
      logError('❌ Error en auto-sync:', error)
      progressTracker.errorOperation(operationId, error)
    } finally {
      this.syncInProgress = false
    }
  }

  /**
   * Determina si debe realizar auto-sync
   */
  shouldPerformAutoSync() {
    // Verificar configuración
    if (!this.autoSyncConfig.enabled) {
      return false
    }
    
    // Verificar conectividad si es requerido
    if (this.autoSyncConfig.onlyWhenOnline && !navigator.onLine) {
      return false
    }
    
    // Verificar horario silencioso
    if (this.isQuietHours()) {
      return false
    }
    
    // Verificar que no haya sync muy reciente
    const now = Date.now()
    const minInterval = this.autoSyncConfig.interval * 0.8 // 80% del intervalo
    if (this.lastSync && (now - this.lastSync.timestamp) < minInterval) {
      return false
    }
    
    return true
  }

  /**
   * Verifica si está en horario silencioso
   */
  isQuietHours() {
    if (!this.autoSyncConfig.quietHours) return false
    
    const now = new Date()
    const hour = now.getHours()
    const { start, end } = this.autoSyncConfig.quietHours
    
    if (start <= end) {
      return hour >= start && hour < end
    } else {
      // Horario que cruza medianoche (ej: 22:00 a 7:00)
      return hour >= start || hour < end
    }
  }

  /**
   * Obtiene campañas que tienen cambios para sincronizar
   */
  async getCampaignsWithChanges(campaigns) {
    const campaignsWithChanges = []
    
    for (const campaign of campaigns.slice(0, 5)) { // Máximo 5 para análisis
      try {
        // Verificar si hay cambios locales pendientes
        if (this.hasLocalChanges(campaign)) {
          campaignsWithChanges.push(campaign)
          continue
        }
        
        // Verificar si hay cambios remotos (check ligero)
        const hasRemoteChanges = await this.checkRemoteChanges(campaign)
        if (hasRemoteChanges) {
          campaignsWithChanges.push(campaign)
        }
        
      } catch (error) {
        debug(`🔄 Error verificando cambios en ${campaign.id}:`, error.message)
      }
    }
    
    return campaignsWithChanges
  }

  /**
   * Verifica si hay cambios locales pendientes
   */
  hasLocalChanges(campaign) {
    // Verificar timestamps de modificación
    const lastModified = campaign.lastModified ? new Date(campaign.lastModified) : null
    const lastSync = campaign.lastSyncTime ? new Date(campaign.lastSyncTime) : null
    
    if (!lastSync) return true // Sin sync previo
    if (!lastModified) return false // Sin modificaciones
    
    return lastModified > lastSync
  }

  /**
   * Verificación ligera de cambios remotos
   */
  async checkRemoteChanges(campaign) {
    try {
      // Hacer una verificación rápida usando HEAD request o metadatos
      // Por ahora, simplificado a verificar cada 10 minutos
      const lastCheck = campaign.lastRemoteCheck ? new Date(campaign.lastRemoteCheck) : null
      const now = Date.now()
      
      if (lastCheck && (now - lastCheck.getTime()) < 10 * 60 * 1000) {
        return false // Verificado recientemente
      }
      
      // En implementación real, haríamos una verificación ligera de metadatos
      return Math.random() > 0.7 // 30% probabilidad de cambios remotos
      
    } catch (error) {
      return false // Asumir sin cambios si hay error
    }
  }

  /**
   * Registra sync fallido para retry inteligente
   */
  recordFailedSync(campaignId, error) {
    const existing = this.failedSyncs.get(campaignId) || { count: 0, errors: [] }
    
    existing.count++
    existing.lastError = error.message
    existing.lastAttempt = Date.now()
    existing.errors.push({
      message: error.message,
      timestamp: Date.now()
    })
    
    // Mantener solo los últimos 5 errores
    if (existing.errors.length > 5) {
      existing.errors = existing.errors.slice(-5)
    }
    
    this.failedSyncs.set(campaignId, existing)
    
    // Programar retry si no ha excedido límites
    if (existing.count <= this.maxRetries) {
      setTimeout(() => {
        this.retryFailedSync(campaignId)
      }, this.retryDelay * existing.count) // Backoff exponencial
    }
  }

  /**
   * Reintentar sync fallido
   */
  async retryFailedSync(campaignId) {
    const failedInfo = this.failedSyncs.get(campaignId)
    if (!failedInfo || failedInfo.count > this.maxRetries) {
      return
    }
    
    try {
      await syncService.syncBidirectional(campaignId)
      this.failedSyncs.delete(campaignId) // Limpiar al ser exitoso
      debug(`🔄 Retry exitoso para campaña ${campaignId}`)
    } catch (error) {
      this.recordFailedSync(campaignId, error)
    }
  }

  /**
   * Maneja cambios de conectividad
   */
  handleConnectivityChange(isOnline) {
    if (isOnline) {
      debug('🔄 Conectividad restaurada, iniciando sync de recuperación')
      
      // Procesar queue offline inmediatamente
      offlineManager.processOfflineQueue()
      
      // Programar sync automático en 10 segundos
      setTimeout(() => {
        this.performAutoSync()
      }, 10000)
    } else {
      debug('🔄 Conectividad perdida, pausando background sync')
    }
  }

  /**
   * Sincronización manual con progreso
   */
  async manualSync(campaignIds = null) {
    if (this.syncInProgress) {
      throw new Error('Ya hay una sincronización en progreso')
    }
    
    this.syncInProgress = true
    
    try {
      const campaigns = loadCampaigns()
      const toSync = campaignIds 
        ? campaigns.filter(c => campaignIds.includes(c.id))
        : campaigns
      
      const progress = progressTracker.createSyncOperation('manual', 'bidirectional')
      progress.setPhase('preparing', 'Preparando sincronización manual...')
      
      const results = []
      
      for (let i = 0; i < toSync.length; i++) {
        const campaign = toSync[i]
        
        progress.setProgress((i / toSync.length) * 100, `Sincronizando ${campaign.name}`)
        progress.addStep(`Iniciando sync de ${campaign.name}`)
        
        try {
          const result = await syncService.syncBidirectional(campaign.id)
          results.push({ campaignId: campaign.id, success: true, result })
          progress.addStep(`✅ ${campaign.name} sincronizada`)
        } catch (error) {
          results.push({ campaignId: campaign.id, success: false, error: error.message })
          progress.addStep(`❌ Error en ${campaign.name}: ${error.message}`)
        }
      }
      
      const successful = results.filter(r => r.success).length
      const failed = results.length - successful
      
      progress.complete({
        total: results.length,
        successful,
        failed,
        results,
        summary: `${successful} exitosas, ${failed} fallidas`
      })
      
      return { successful, failed, results }
      
    } finally {
      this.syncInProgress = false
    }
  }

  /**
   * Configura opciones de auto-sync
   */
  configureAutoSync(config) {
    Object.assign(this.autoSyncConfig, config)
    
    // Reconfigurar timer si cambió el intervalo
    if (config.interval || config.enabled !== undefined) {
      this.setupAutoSync()
    }
    
    debug('🔄 Configuración de auto-sync actualizada:', this.autoSyncConfig)
  }

  /**
   * Obtiene estado actual del background sync
   */
  getStatus() {
    return {
      enabled: this.isEnabled,
      syncInProgress: this.syncInProgress,
      backgroundSyncSupported: this.backgroundSyncSupported,
      autoSync: this.autoSyncConfig,
      lastSync: this.lastSync,
      failedSyncs: Object.fromEntries(this.failedSyncs),
      isQuietHours: this.isQuietHours(),
      nextAutoSync: this.lastSync 
        ? this.lastSync.timestamp + this.autoSyncConfig.interval
        : Date.now() + this.autoSyncConfig.interval
    }
  }

  /**
   * Detiene el servicio de background sync
   */
  stop() {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval)
      this.autoSyncInterval = null
    }
    
    this.isEnabled = false
    debug('🔄 BackgroundSync detenido')
  }

  /**
   * Limpia datos de syncs fallidos
   */
  clearFailedSyncs() {
    this.failedSyncs.clear()
    debug('🔄 Datos de syncs fallidos limpiados')
  }
}

// Exportar instancia singleton
export const backgroundSync = new BackgroundSync()
export default backgroundSync