/**
 * Servicio de Cache Inteligente y Storage Offline
 * Gestiona cache local para mejorar rendimiento y permitir trabajo offline
 */

import { debug, warn, error as logError } from '../utils/logger'
import dataCompression from './dataCompression'

class OfflineCache {
  constructor() {
    this.cacheName = 'dnd-gestor-cache-v1'
    this.dbName = 'DnDGestorOfflineDB'
    this.dbVersion = 1
    this.db = null
    
    // Configuración de cache por tipo de datos
    this.cacheConfig = {
      campaigns: {
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        maxEntries: 50,
        compression: true,
        priority: 'high'
      },
      userPreferences: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
        maxEntries: 10,
        compression: false,
        priority: 'high'
      },
      syncMetadata: {
        maxAge: 60 * 60 * 1000, // 1 hora
        maxEntries: 100,
        compression: false,
        priority: 'medium'
      },
      driveFiles: {
        maxAge: 30 * 60 * 1000, // 30 minutos
        maxEntries: 200,
        compression: true,
        priority: 'low'
      }
    }
    
    this.accessStats = new Map() // Estadísticas de acceso para cache inteligente
    
    debug('💾 OfflineCache inicializado')
  }

  /**
   * Inicializa la base de datos IndexedDB
   */
  async init() {
    if (this.db) return this.db

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)
      
      request.onerror = () => {
        logError('❌ Error al abrir IndexedDB:', request.error)
        reject(request.error)
      }
      
      request.onsuccess = () => {
        this.db = request.result
        debug('💾 IndexedDB conectado exitosamente')
        resolve(this.db)
      }
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result
        
        // Store principal de cache
        const cacheStore = db.createObjectStore('cache', { keyPath: 'id' })
        cacheStore.createIndex('type', 'type', { unique: false })
        cacheStore.createIndex('timestamp', 'timestamp', { unique: false })
        cacheStore.createIndex('lastAccess', 'lastAccess', { unique: false })
        cacheStore.createIndex('priority', 'priority', { unique: false })
        
        // Store para metadatos de sync
        const syncStore = db.createObjectStore('syncMeta', { keyPath: 'key' })
        syncStore.createIndex('timestamp', 'timestamp', { unique: false })
        
        // Store para configuración offline
        const configStore = db.createObjectStore('offlineConfig', { keyPath: 'setting' })
        
        debug('💾 IndexedDB esquema creado')
      }
    })
  }

  /**
   * Almacena datos en cache con configuración inteligente
   */
  async set(type, key, data, options = {}) {
    try {
      await this.init()
      
      const config = this.cacheConfig[type] || this.cacheConfig.campaigns
      const shouldCompress = config.compression && options.compress !== false
      
      let processedData = data
      let compressionInfo = null
      
      // Aplicar compresión si está configurada
      if (shouldCompress) {
        const dataSize = JSON.stringify(data).length
        if (dataSize > 5 * 1024) { // > 5KB
          const compressionResult = dataCompression.compress(data, {
            method: 'auto',
            level: 'balanced'
          })
          
          if (compressionResult.compressed) {
            processedData = compressionResult
            compressionInfo = {
              method: compressionResult.method,
              ratio: compressionResult.ratio,
              originalSize: dataSize,
              compressedSize: compressionResult.compressedSize
            }
          }
        }
      }
      
      const cacheEntry = {
        id: `${type}_${key}`,
        type,
        key,
        data: processedData,
        timestamp: Date.now(),
        lastAccess: Date.now(),
        priority: config.priority,
        maxAge: config.maxAge,
        compressed: !!compressionInfo,
        compressionInfo,
        version: options.version || 1
      }
      
      const transaction = this.db.transaction(['cache'], 'readwrite')
      const store = transaction.objectStore('cache')
      
      await new Promise((resolve, reject) => {
        const request = store.put(cacheEntry)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
      
      // Limpiar entradas expiradas del mismo tipo
      await this.cleanupExpiredEntries(type)
      
      debug(`💾 Cache SET: ${type}/${key}${compressionInfo ? ` (comprimido ${compressionInfo.ratio.toFixed(2)}x)` : ''}`)
      
      return true
    } catch (error) {
      logError(`❌ Error al guardar en cache ${type}/${key}:`, error)
      return false
    }
  }

  /**
   * Recupera datos del cache
   */
  async get(type, key) {
    try {
      await this.init()
      
      const transaction = this.db.transaction(['cache'], 'readonly')
      const store = transaction.objectStore('cache')
      const id = `${type}_${key}`
      
      const entry = await new Promise((resolve, reject) => {
        const request = store.get(id)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
      
      if (!entry) {
        return null
      }
      
      // Verificar expiración
      if (Date.now() - entry.timestamp > entry.maxAge) {
        await this.delete(type, key)
        debug(`💾 Cache EXPIRED: ${type}/${key}`)
        return null
      }
      
      // Actualizar estadísticas de acceso
      await this.updateAccessStats(entry)
      
      // Descomprimir si es necesario
      let data = entry.data
      if (entry.compressed && entry.compressionInfo) {
        try {
          data = dataCompression.decompress(entry.data)
          debug(`💾 Cache GET (descomprimido): ${type}/${key}`)
        } catch (error) {
          warn(`💾 Error al descomprimir cache ${type}/${key}:`, error.message)
          return null
        }
      } else {
        debug(`💾 Cache GET: ${type}/${key}`)
      }
      
      return data
    } catch (error) {
      logError(`❌ Error al leer cache ${type}/${key}:`, error)
      return null
    }
  }

  /**
   * Elimina entrada específica del cache
   */
  async delete(type, key) {
    try {
      await this.init()
      
      const transaction = this.db.transaction(['cache'], 'readwrite')
      const store = transaction.objectStore('cache')
      const id = `${type}_${key}`
      
      await new Promise((resolve, reject) => {
        const request = store.delete(id)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
      
      debug(`💾 Cache DELETE: ${type}/${key}`)
      return true
    } catch (error) {
      logError(`❌ Error al eliminar cache ${type}/${key}:`, error)
      return false
    }
  }

  /**
   * Verifica si una entrada existe y no ha expirado
   */
  async has(type, key) {
    const data = await this.get(type, key)
    return data !== null
  }

  /**
   * Actualiza estadísticas de acceso para cache inteligente
   */
  async updateAccessStats(entry) {
    try {
      const transaction = this.db.transaction(['cache'], 'readwrite')
      const store = transaction.objectStore('cache')
      
      // Actualizar timestamp de último acceso
      entry.lastAccess = Date.now()
      
      // Actualizar contador de accesos
      const statsKey = `${entry.type}_${entry.key}`
      const currentStats = this.accessStats.get(statsKey) || { count: 0, avgInterval: 0 }
      currentStats.count++
      
      this.accessStats.set(statsKey, currentStats)
      
      await new Promise((resolve, reject) => {
        const request = store.put(entry)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
      
    } catch (error) {
      warn('💾 Error al actualizar estadísticas de acceso:', error.message)
    }
  }

  /**
   * Limpia entradas expiradas de un tipo específico
   */
  async cleanupExpiredEntries(type) {
    try {
      const transaction = this.db.transaction(['cache'], 'readwrite')
      const store = transaction.objectStore('cache')
      const index = store.index('type')
      
      const config = this.cacheConfig[type] || this.cacheConfig.campaigns
      const now = Date.now()
      let deletedCount = 0
      
      const entries = await new Promise((resolve, reject) => {
        const request = index.getAll(type)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
      
      // Eliminar entradas expiradas
      const deletePromises = entries
        .filter(entry => now - entry.timestamp > entry.maxAge)
        .map(entry => {
          deletedCount++
          return new Promise((resolve, reject) => {
            const request = store.delete(entry.id)
            request.onsuccess = () => resolve()
            request.onerror = () => reject(request.error)
          })
        })
      
      await Promise.all(deletePromises)
      
      // Si aún hay demasiadas entradas, eliminar las menos usadas
      const remainingEntries = entries
        .filter(entry => now - entry.timestamp <= entry.maxAge)
        .sort((a, b) => a.lastAccess - b.lastAccess)
      
      if (remainingEntries.length > config.maxEntries) {
        const entriesToDelete = remainingEntries.slice(0, remainingEntries.length - config.maxEntries)
        
        const additionalDeletes = entriesToDelete.map(entry => {
          deletedCount++
          return new Promise((resolve, reject) => {
            const request = store.delete(entry.id)
            request.onsuccess = () => resolve()
            request.onerror = () => reject(request.error)
          })
        })
        
        await Promise.all(additionalDeletes)
      }
      
      if (deletedCount > 0) {
        debug(`💾 Limpieza de cache: ${deletedCount} entradas eliminadas de tipo '${type}'`)
      }
      
    } catch (error) {
      logError('❌ Error en limpieza de cache:', error)
    }
  }

  /**
   * Cache específico para campañas con políticas inteligentes
   */
  async setCampaign(campaignId, campaignData, metadata = {}) {
    return await this.set('campaigns', campaignId, campaignData, {
      version: metadata.syncVersion || 1,
      ...metadata
    })
  }

  async getCampaign(campaignId) {
    return await this.get('campaigns', campaignId)
  }

  /**
   * Cache para metadatos de sincronización
   */
  async setSyncMetadata(key, metadata) {
    return await this.set('syncMetadata', key, metadata, { compress: false })
  }

  async getSyncMetadata(key) {
    return await this.get('syncMetadata', key)
  }

  /**
   * Cache para preferencias de usuario
   */
  async setUserPreferences(userId, preferences) {
    return await this.set('userPreferences', userId, preferences, { compress: false })
  }

  async getUserPreferences(userId) {
    return await this.get('userPreferences', userId)
  }

  /**
   * Cache para listados de archivos de Drive
   */
  async setDriveFileList(query, fileList) {
    const key = btoa(query).replace(/[^a-zA-Z0-9]/g, '') // Safe key
    return await this.set('driveFiles', key, fileList)
  }

  async getDriveFileList(query) {
    const key = btoa(query).replace(/[^a-zA-Z0-9]/g, '')
    return await this.get('driveFiles', key)
  }

  /**
   * Obtiene estadísticas del cache
   */
  async getStats() {
    try {
      await this.init()
      
      const transaction = this.db.transaction(['cache'], 'readonly')
      const store = transaction.objectStore('cache')
      
      const allEntries = await new Promise((resolve, reject) => {
        const request = store.getAll()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
      
      const stats = {
        totalEntries: allEntries.length,
        byType: {},
        totalSize: 0,
        compressedEntries: 0,
        compressionSavings: 0
      }
      
      allEntries.forEach(entry => {
        // Estadísticas por tipo
        if (!stats.byType[entry.type]) {
          stats.byType[entry.type] = {
            count: 0,
            size: 0,
            compressed: 0,
            avgAge: 0
          }
        }
        
        const typeStats = stats.byType[entry.type]
        typeStats.count++
        
        const entrySize = JSON.stringify(entry.data).length
        typeStats.size += entrySize
        stats.totalSize += entrySize
        
        if (entry.compressed) {
          typeStats.compressed++
          stats.compressedEntries++
          if (entry.compressionInfo) {
            stats.compressionSavings += entry.compressionInfo.originalSize - entry.compressionInfo.compressedSize
          }
        }
        
        const age = Date.now() - entry.timestamp
        typeStats.avgAge = (typeStats.avgAge * (typeStats.count - 1) + age) / typeStats.count
      })
      
      return {
        ...stats,
        accessStats: Object.fromEntries(this.accessStats),
        cacheConfig: this.cacheConfig
      }
      
    } catch (error) {
      logError('❌ Error al obtener estadísticas de cache:', error)
      return { error: error.message }
    }
  }

  /**
   * Limpia todo el cache
   */
  async clear() {
    try {
      await this.init()
      
      const transaction = this.db.transaction(['cache', 'syncMeta', 'offlineConfig'], 'readwrite')
      
      await Promise.all([
        new Promise((resolve, reject) => {
          const request = transaction.objectStore('cache').clear()
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        }),
        new Promise((resolve, reject) => {
          const request = transaction.objectStore('syncMeta').clear()
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        }),
        new Promise((resolve, reject) => {
          const request = transaction.objectStore('offlineConfig').clear()
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        })
      ])
      
      this.accessStats.clear()
      debug('💾 Cache limpiado completamente')
      return true
    } catch (error) {
      logError('❌ Error al limpiar cache:', error)
      return false
    }
  }

  /**
   * Optimiza el cache eliminando entradas menos utilizadas
   */
  async optimize() {
    try {
      debug('💾 Iniciando optimización de cache...')
      
      const stats = await this.getStats()
      let optimizationsApplied = 0
      
      // Optimizar cada tipo de cache
      for (const type of Object.keys(this.cacheConfig)) {
        await this.cleanupExpiredEntries(type)
        optimizationsApplied++
      }
      
      const newStats = await this.getStats()
      const entriesRemoved = stats.totalEntries - newStats.totalEntries
      
      debug(`💾 Optimización completada: ${entriesRemoved} entradas eliminadas, ${optimizationsApplied} tipos optimizados`)
      
      return {
        entriesRemoved,
        optimizationsApplied,
        sizeBefore: stats.totalSize,
        sizeAfter: newStats.totalSize
      }
    } catch (error) {
      logError('❌ Error en optimización de cache:', error)
      return { error: error.message }
    }
  }

  /**
   * Verifica si el servicio está disponible offline
   */
  async isOfflineReady() {
    try {
      await this.init()
      
      const campaigns = await this.get('campaigns', 'all') || []
      const userPrefs = await this.get('userPreferences', 'current')
      
      return {
        ready: campaigns.length > 0 || userPrefs !== null,
        campaigns: campaigns.length,
        hasPreferences: userPrefs !== null,
        cacheSize: (await this.getStats()).totalSize
      }
    } catch (error) {
      return { ready: false, error: error.message }
    }
  }
}

// Exportar instancia singleton
export const offlineCache = new OfflineCache()
export default offlineCache