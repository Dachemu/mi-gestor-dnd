/**
 * Gestor de Estado Offline
 * Coordina cache, sincronización y trabajo offline
 */

import offlineCache from './offlineCache'
import syncService from './syncService'
import { loadCampaigns, saveCampaigns } from './storage'
import { debug, warn, error as logError } from '../utils/logger'

class OfflineManager {
  constructor() {
    this.isOnline = navigator.onLine
    this.offlineQueue = []
    this.syncPending = new Set()
    this.offlineMode = false
    this.lastSyncAttempt = 0
    this.syncRetryDelay = 30000 // 30 segundos
    
    // Estrategias de cache por operación
    this.cacheStrategies = {
      'load-campaigns': 'cache-first',
      'save-campaign': 'cache-and-network',
      'sync-campaign': 'network-first',
      'list-drive-files': 'stale-while-revalidate'
    }
    
    this.initializeOfflineHandlers()
    debug('🌐 OfflineManager inicializado')
  }


  /**
   * Configura listeners para eventos de conectividad
   */
  initializeOfflineHandlers() {
    window.addEventListener('online', this.handleOnline.bind(this))
    window.addEventListener('offline', this.handleOffline.bind(this))
    
    // Verificar conectividad cada minuto
    setInterval(() => {
      this.checkConnectivity()
    }, 60000)
    
    // Auto-sync cuando volvemos online
    this.handleOnline()
  }

  /**
   * Maneja evento cuando se restaura la conexión
   */
  async handleOnline() {
    const wasOffline = !this.isOnline
    this.isOnline = true
    this.offlineMode = false
    
    debug('🌐 Conexión restaurada')
    
    if (wasOffline) {
      // Procesar queue offline
      await this.processOfflineQueue()
      
      // Intentar sincronización automática
      await this.attemptAutoSync()
    }
  }

  /**
   * Maneja evento cuando se pierde la conexión
   */
  handleOffline() {
    this.isOnline = false
    this.offlineMode = true
    debug('🌐 Modo offline activado')
    
    // Guardar timestamp para estadísticas
    this.offlineStartTime = Date.now()
  }

  /**
   * Verifica conectividad real haciendo una request pequeña
   */
  async checkConnectivity() {
    try {
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      })
      
      const actuallyOnline = response.ok
      
      if (actuallyOnline !== this.isOnline) {
        if (actuallyOnline) {
          this.handleOnline()
        } else {
          this.handleOffline()
        }
      }
    } catch (error) {
      if (this.isOnline) {
        this.handleOffline()
      }
    }
  }

  /**
   * Ejecuta operación con estrategia de cache apropiada
   */
  async executeWithStrategy(operation, key, networkFn, cacheType = 'campaigns') {
    const strategy = this.cacheStrategies[operation] || 'cache-first'
    
    switch (strategy) {
      case 'cache-first':
        return await this.cacheFirst(key, networkFn, cacheType)
      
      case 'network-first':
        return await this.networkFirst(key, networkFn, cacheType)
      
      case 'cache-and-network':
        return await this.cacheAndNetwork(key, networkFn, cacheType)
      
      case 'stale-while-revalidate':
        return await this.staleWhileRevalidate(key, networkFn, cacheType)
      
      default:
        return await this.cacheFirst(key, networkFn, cacheType)
    }
  }

  /**
   * Estrategia Cache First: Intenta cache primero, red como fallback
   */
  async cacheFirst(key, networkFn, cacheType) {
    try {
      // Intentar obtener desde cache
      const cached = await offlineCache.get(cacheType, key)
      if (cached) {
        debug(`🌐 Cache hit: ${cacheType}/${key}`)
        
        // Si estamos online, actualizar en background
        if (this.isOnline) {
          this.backgroundUpdate(key, networkFn, cacheType).catch(() => {})
        }
        
        return cached
      }
      
      // Si no hay cache y estamos offline, error
      if (!this.isOnline) {
        throw new Error('No hay datos en cache y estamos offline')
      }
      
      // Intentar red
      const networkData = await networkFn()
      await offlineCache.set(cacheType, key, networkData)
      
      debug(`🌐 Network fetch y cache: ${cacheType}/${key}`)
      return networkData
      
    } catch (error) {
      // Si todo falla, intentar cache como último recurso
      const cached = await offlineCache.get(cacheType, key)
      if (cached) {
        warn(`🌐 Usando cache como fallback: ${cacheType}/${key}`)
        return cached
      }
      
      throw error
    }
  }

  /**
   * Estrategia Network First: Intenta red primero, cache como fallback
   */
  async networkFirst(key, networkFn, cacheType) {
    try {
      if (!this.isOnline) {
        throw new Error('Offline - usando cache')
      }
      
      const networkData = await networkFn()
      await offlineCache.set(cacheType, key, networkData)
      
      debug(`🌐 Network first success: ${cacheType}/${key}`)
      return networkData
      
    } catch (error) {
      const cached = await offlineCache.get(cacheType, key)
      if (cached) {
        warn(`🌐 Network failed, usando cache: ${cacheType}/${key}`)
        return cached
      }
      
      throw error
    }
  }

  /**
   * Estrategia Cache and Network: Cache inmediato + actualización red
   */
  async cacheAndNetwork(key, networkFn, cacheType) {
    const cached = await offlineCache.get(cacheType, key)
    
    if (this.isOnline) {
      // Actualizar desde red en background
      this.backgroundUpdate(key, networkFn, cacheType).catch(() => {})
    }
    
    if (cached) {
      debug(`🌐 Cache and network: retornando cache ${cacheType}/${key}`)
      return cached
    }
    
    // Si no hay cache, esperar a red
    if (this.isOnline) {
      try {
        const networkData = await networkFn()
        await offlineCache.set(cacheType, key, networkData)
        return networkData
      } catch (error) {
        throw new Error('No hay cache y red falló')
      }
    }
    
    throw new Error('No hay cache y estamos offline')
  }

  /**
   * Estrategia Stale While Revalidate: Cache rápido + actualización background
   */
  async staleWhileRevalidate(key, networkFn, cacheType) {
    const cached = await offlineCache.get(cacheType, key)
    
    // Actualizar en background si estamos online
    if (this.isOnline) {
      this.backgroundUpdate(key, networkFn, cacheType).catch(() => {})
    }
    
    // Retornar cache si existe
    if (cached) {
      debug(`🌐 Stale while revalidate: ${cacheType}/${key}`)
      return cached
    }
    
    // Si no hay cache y estamos online, esperar a red
    if (this.isOnline) {
      try {
        const networkData = await networkFn()
        await offlineCache.set(cacheType, key, networkData)
        return networkData
      } catch (error) {
        throw error
      }
    }
    
    throw new Error('No hay datos disponibles offline')
  }

  /**
   * Actualización en background
   */
  async backgroundUpdate(key, networkFn, cacheType) {
    try {
      const networkData = await networkFn()
      await offlineCache.set(cacheType, key, networkData)
      debug(`🌐 Background update completado: ${cacheType}/${key}`)
    } catch (error) {
      debug(`🌐 Background update falló: ${cacheType}/${key}`)
    }
  }

  /**
   * Añade operación a la queue offline
   */
  async queueOfflineOperation(operation) {
    this.offlineQueue.push({
      ...operation,
      timestamp: Date.now(),
      retries: 0,
      id: Math.random().toString(36).substr(2, 9)
    })
    
    debug(`🌐 Operación encolada offline: ${operation.type}`)
    
    // Intentar procesar inmediatamente si estamos online
    if (this.isOnline) {
      await this.processOfflineQueue()
    }
  }

  /**
   * Procesa queue de operaciones offline
   */
  async processOfflineQueue() {
    if (!this.isOnline || this.offlineQueue.length === 0) {
      return
    }
    
    debug(`🌐 Procesando ${this.offlineQueue.length} operaciones offline...`)
    
    const processed = []
    const failed = []
    
    for (const operation of this.offlineQueue) {
      try {
        await this.executeOfflineOperation(operation)
        processed.push(operation)
        debug(`🌐 Operación offline procesada: ${operation.type}`)
      } catch (error) {
        operation.retries = (operation.retries || 0) + 1
        operation.lastError = error.message
        
        if (operation.retries >= 3) {
          failed.push(operation)
          logError(`❌ Operación offline falló permanentemente: ${operation.type}`, error)
        } else {
          // Reintentaremos después
          warn(`⚠️ Operación offline falló (reintento ${operation.retries}/3): ${operation.type}`)
        }
      }
    }
    
    // Limpiar operaciones procesadas y fallidas
    this.offlineQueue = this.offlineQueue.filter(op => 
      !processed.includes(op) && !failed.includes(op)
    )
    
    debug(`🌐 Queue offline procesada: ${processed.length} éxito, ${failed.length} fallos`)
    
    return { processed: processed.length, failed: failed.length }
  }

  /**
   * Ejecuta una operación específica offline
   */
  async executeOfflineOperation(operation) {
    switch (operation.type) {
      case 'save-campaign':
        await syncService.uploadCampaign(operation.campaignId)
        break
        
      case 'sync-campaign':
        await syncService.syncBidirectional(operation.campaignId)
        break
        
      case 'delete-campaign':
        await syncService.deleteCampaign(operation.campaignId)
        break
        
      default:
        throw new Error(`Tipo de operación no soportada: ${operation.type}`)
    }
  }

  /**
   * Intenta sincronización automática
   */
  async attemptAutoSync() {
    const now = Date.now()
    
    // No intentar sync muy frecuentemente
    if (now - this.lastSyncAttempt < this.syncRetryDelay) {
      return
    }
    
    this.lastSyncAttempt = now
    
    try {
      debug('🌐 Intentando sincronización automática...')
      
      const campaigns = loadCampaigns()
      let syncedCount = 0
      
      for (const campaign of campaigns.slice(0, 3)) { // Máximo 3 campañas
        if (!this.syncPending.has(campaign.id)) {
          this.syncPending.add(campaign.id)
          
          try {
            await syncService.syncBidirectional(campaign.id)
            syncedCount++
          } catch (error) {
            debug(`🌐 Auto-sync falló para campaña ${campaign.id}:`, error.message)
          } finally {
            this.syncPending.delete(campaign.id)
          }
        }
      }
      
      debug(`🌐 Auto-sync completado: ${syncedCount} campañas sincronizadas`)
      
    } catch (error) {
      debug('🌐 Error en auto-sync:', error.message)
    }
  }

  /**
   * Carga campañas con estrategia offline
   */
  async loadCampaignsOffline() {
    return await this.executeWithStrategy(
      'load-campaigns',
      'all',
      () => Promise.resolve(loadCampaigns()),
      'campaigns'
    )
  }

  /**
   * Guarda campaña con manejo offline
   */
  async saveCampaignOffline(campaigns, campaignId) {
    // Guardar localmente siempre
    saveCampaigns(campaigns)
    await offlineCache.setCampaign('all', campaigns)
    
    // Si estamos offline, encolar para sync
    if (!this.isOnline) {
      await this.queueOfflineOperation({
        type: 'save-campaign',
        campaignId,
        data: campaigns.find(c => c.id === campaignId)
      })
    } else {
      // Intentar sync inmediato en background
      this.backgroundSync(campaignId).catch(() => {})
    }
  }

  /**
   * Sincronización en background
   */
  async backgroundSync(campaignId) {
    try {
      await syncService.syncBidirectional(campaignId)
      debug(`🌐 Background sync exitoso: ${campaignId}`)
    } catch (error) {
      debug(`🌐 Background sync falló: ${campaignId}`)
      // Encolar para retry
      await this.queueOfflineOperation({
        type: 'sync-campaign',
        campaignId
      })
    }
  }

  /**
   * Obtiene estado del manager offline
   */
  getOfflineStatus() {
    const offlineDuration = this.offlineStartTime 
      ? Date.now() - this.offlineStartTime 
      : 0
      
    return {
      isOnline: this.isOnline,
      offlineMode: this.offlineMode,
      queueSize: this.offlineQueue.length,
      pendingSync: this.syncPending.size,
      offlineDuration,
      lastSyncAttempt: this.lastSyncAttempt,
      strategies: this.cacheStrategies
    }
  }

  /**
   * Prepara app para modo offline
   */
  async prepareOfflineMode() {
    try {
      debug('🌐 Preparando modo offline...')
      
      // Cache todas las campañas actuales
      const campaigns = loadCampaigns()
      await offlineCache.setCampaign('all', campaigns)
      
      // Cache campañas individuales
      for (const campaign of campaigns) {
        await offlineCache.setCampaign(campaign.id, campaign)
      }
      
      // Cache configuración de usuario
      const userPrefs = localStorage.getItem('userPreferences')
      if (userPrefs) {
        await offlineCache.setUserPreferences('current', JSON.parse(userPrefs))
      }
      
      debug('🌐 Modo offline preparado exitosamente')
      return true
      
    } catch (error) {
      logError('❌ Error preparando modo offline:', error)
      return false
    }
  }

  /**
   * Optimiza recursos para trabajo offline
   */
  async optimizeForOffline() {
    // Limpiar cache innecesario
    await offlineCache.optimize()
    
    // Comprimir datos grandes
    const stats = await offlineCache.getStats()
    debug('🌐 Optimización offline completada:', stats)
    
    return stats
  }
}

// Exportar instancia singleton
export const offlineManager = new OfflineManager()
export default offlineManager