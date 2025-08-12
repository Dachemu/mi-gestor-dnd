/**
 * Servicio de Sincronización Incremental
 * Sincroniza solo los cambios específicos en lugar de campañas completas
 */

import changeTracker from './changeTracker'
import googleDrive from './googleDrive'
import dataCompression from './dataCompression'
import { loadCampaigns, saveCampaigns } from './storage'
import { debug, error as logError, warn } from '../utils/logger'

class IncrementalSync {
  constructor() {
    this.deltaCache = new Map() // Cache de deltas no sincronizados
    this.compressionEnabled = true
    this.maxDeltaSize = 1024 * 100 // 100KB máximo por delta
    this.compressionOptions = {
      method: 'auto',
      level: 'balanced',
      threshold: 512 // Comprimir archivos > 512B
    }
    
    debug('📦 IncrementalSync inicializado con compresión avanzada')
  }

  /**
   * Sincroniza solo los cambios incrementales hacia Drive
   * @param {string} campaignId ID de la campaña a sincronizar
   * @returns {Promise<Object>} Resultado de la sincronización
   */
  async syncIncrementalToCloud(campaignId) {
    try {
      debug(`📤 Iniciando sync incremental para campaña ${campaignId}`)

      const campaigns = loadCampaigns()
      const campaign = campaigns.find(c => c.id === campaignId)
      
      if (!campaign) {
        throw new Error(`Campaña ${campaignId} no encontrada`)
      }

      // Detectar cambios desde último sync
      const changes = changeTracker.detectChanges(campaign)
      
      if (!changes.hasChanges) {
        debug(`📭 Sin cambios en campaña '${campaign.name}'`)
        return {
          type: 'incremental',
          campaignId,
          campaignName: campaign.name,
          changes: false,
          deltasSent: 0,
          bytesSaved: 0
        }
      }

      // Generar delta compacto
      const delta = changeTracker.generateDelta(changes)
      
      if (!delta) {
        debug(`📭 No se pudo generar delta para '${campaign.name}'`)
        return {
          type: 'incremental',
          campaignId,
          campaignName: campaign.name,
          changes: false,
          error: 'No se pudo generar delta'
        }
      }

      // Verificar si el delta es demasiado grande para ser eficiente
      if (delta.size > this.maxDeltaSize) {
        warn(`📦 Delta muy grande (${delta.size}B), usando sync completo`)
        return await this.fallbackToFullSync(campaign)
      }

      // Subir delta a Drive
      const result = await this.uploadDelta(campaign, delta)
      
      debug(`✅ Sync incremental completado para '${campaign.name}': ${delta.size}B enviados`)
      
      return {
        type: 'incremental',
        campaignId,
        campaignName: campaign.name,
        changes: true,
        deltasSent: 1,
        deltaSize: delta.size,
        operationsCount: delta.operations.length,
        changeTypes: delta.changeTypes,
        bytesSaved: this.calculateBytesSaved(campaign, delta),
        efficiency: this.calculateEfficiency(campaign, delta)
      }
      
    } catch (error) {
      logError(`❌ Error en sync incremental:`, error)
      throw error
    }
  }

  /**
   * Sube un delta a Google Drive
   * @param {Object} campaign Campaña completa
   * @param {Object} delta Delta de cambios
   * @returns {Promise<string>} ID del archivo actualizado
   */
  async uploadDelta(campaign, delta) {
    // Buscar archivo existente en Drive
    const driveCampaigns = await googleDrive.listCampaigns()
    const existingDrive = driveCampaigns.find(dc => dc.name === campaign.name)

    if (!existingDrive) {
      // No existe en Drive, hacer upload completo
      debug(`📤 Archivo no existe en Drive, subiendo completo`)
      return await googleDrive.uploadCampaign(campaign.name, campaign)
    }

    // Crear archivo delta con compresión avanzada
    const deltaFile = {
      ...campaign,
      _incrementalData: await this.createIncrementalData(campaign, delta),
      lastModified: new Date().toISOString()
    }

    // Actualizar en Drive con datos delta
    return await googleDrive.updateCampaign(existingDrive.id, deltaFile)
  }

  /**
   * Descarga y aplica deltas desde Drive
   * @param {string} campaignId ID de la campaña
   * @returns {Promise<Object>} Resultado de la descarga
   */
  async syncIncrementalFromCloud(campaignId) {
    try {
      debug(`📥 Descargando cambios incrementales para ${campaignId}`)

      const campaigns = loadCampaigns()
      const localCampaign = campaigns.find(c => c.id === campaignId)
      
      if (!localCampaign) {
        throw new Error(`Campaña local ${campaignId} no encontrada`)
      }

      // Buscar archivo en Drive
      const driveCampaigns = await googleDrive.listCampaigns()
      const driveCampaign = driveCampaigns.find(dc => dc.name === localCampaign.name)

      if (!driveCampaign) {
        debug(`📭 Campaña '${localCampaign.name}' no existe en Drive`)
        return {
          type: 'incremental_download',
          campaignId,
          campaignName: localCampaign.name,
          changes: false,
          reason: 'not_found_in_drive'
        }
      }

      // Descargar datos desde Drive
      const driveData = await googleDrive.downloadCampaign(driveCampaign.id)
      
      // Verificar si es un delta
      if (!driveData._incrementalData || !driveData._incrementalData.isDelta) {
        debug(`📦 Archivo en Drive no es incremental, usando sync completo`)
        return await this.handleFullDownload(localCampaign, driveData)
      }

      const incrementalData = driveData._incrementalData
      const delta = await this.extractDeltaFromIncrementalData(incrementalData)

      // Aplicar delta a campaña local
      const updatedCampaign = changeTracker.applyDelta(localCampaign, delta)
      
      // Limpiar metadatos incrementales antes de guardar
      delete updatedCampaign._incrementalData

      // Actualizar campaña local
      const updatedCampaigns = campaigns.map(c => 
        c.id === campaignId ? updatedCampaign : c
      )
      saveCampaigns(updatedCampaigns)

      debug(`✅ Cambios incrementales aplicados a '${localCampaign.name}'`)

      return {
        type: 'incremental_download',
        campaignId,
        campaignName: localCampaign.name,
        changes: true,
        deltasApplied: 1,
        operationsApplied: delta.operations.length,
        deltaSize: incrementalData.deltaSizeBytes,
        compressionRatio: incrementalData.compressionRatio,
        bytesSaved: this.calculateDownloadBytesSaved(incrementalData)
      }

    } catch (error) {
      logError(`❌ Error en descarga incremental:`, error)
      throw error
    }
  }

  /**
   * Sincronización incremental bidireccional completa
   * @param {string} campaignId ID de la campaña
   * @returns {Promise<Object>} Resultado completo
   */
  async syncIncrementalBidirectional(campaignId) {
    try {
      debug(`🔄 Sync incremental bidireccional para ${campaignId}`)

      // 1. Subir cambios locales
      const uploadResult = await this.syncIncrementalToCloud(campaignId)

      // 2. Descargar cambios remotos  
      const downloadResult = await this.syncIncrementalFromCloud(campaignId)

      const result = {
        type: 'incremental_bidirectional',
        campaignId,
        upload: uploadResult,
        download: downloadResult,
        totalBytesSaved: (uploadResult.bytesSaved || 0) + (downloadResult.bytesSaved || 0),
        efficiency: {
          upload: uploadResult.efficiency,
          overall: this.calculateOverallEfficiency(uploadResult, downloadResult)
        }
      }

      debug(`🔄 Sync bidireccional completado: ${result.totalBytesSaved}B ahorrados`)
      return result

    } catch (error) {
      logError(`❌ Error en sync bidireccional incremental:`, error)
      throw error
    }
  }

  /**
   * Crea datos incrementales con compresión avanzada
   * @param {Object} campaign Campaña completa
   * @param {Object} delta Delta de cambios
   * @returns {Promise<Object>} Datos incrementales con compresión
   */
  async createIncrementalData(campaign, delta) {
    const fullSizeBytes = JSON.stringify(campaign).length
    const deltaString = JSON.stringify(delta)
    const deltaSizeBytes = deltaString.length

    let compressedDelta = delta
    let compressionStats = {
      compressed: false,
      method: 'none',
      ratio: 1,
      bytesSaved: 0
    }

    // Aplicar compresión si está habilitada
    if (this.compressionEnabled) {
      const compressionResult = dataCompression.compress(delta, {
        ...this.compressionOptions,
        threshold: Math.min(this.compressionOptions.threshold, deltaSizeBytes * 0.1)
      })

      if (compressionResult.compressed) {
        compressedDelta = compressionResult
        compressionStats = {
          compressed: true,
          method: compressionResult.method,
          ratio: compressionResult.ratio,
          bytesSaved: compressionResult.originalSize - compressionResult.compressedSize,
          compressionTime: compressionResult.compressionTime
        }

        debug(`🗜️ Delta comprimido: ${deltaSizeBytes}B → ${compressionResult.compressedSize}B (${compressionResult.ratio.toFixed(2)}x)`)
      }
    }

    return {
      isDelta: true,
      baseCampaignId: campaign.id,
      deltaTimestamp: delta.timestamp,
      delta: compressedDelta,
      fullSizeBytes,
      deltaSizeBytes,
      compression: compressionStats,
      version: '2.0' // Versión del formato incremental
    }
  }

  /**
   * Extrae delta desde datos incrementales con descompresión
   * @param {Object} incrementalData Datos incrementales
   * @returns {Promise<Object>} Delta descomprimido
   */
  async extractDeltaFromIncrementalData(incrementalData) {
    if (!incrementalData.compression || !incrementalData.compression.compressed) {
      return incrementalData.delta
    }

    try {
      const decompressedDelta = dataCompression.decompress(incrementalData.delta)
      debug(`🗜️ Delta descomprimido usando ${incrementalData.compression.method}`)
      return decompressedDelta
    } catch (error) {
      logError('❌ Error al descomprimir delta:', error)
      throw new Error(`Error en descompresión: ${error.message}`)
    }
  }

  /**
   * Calcula bytes ahorrados en upload
   */
  calculateBytesSaved(campaign, delta) {
    const fullSize = JSON.stringify(campaign).length
    const deltaSize = delta.size
    return Math.max(0, fullSize - deltaSize)
  }

  /**
   * Calcula bytes ahorrados en download
   */
  calculateDownloadBytesSaved(incrementalData) {
    const baseDownloadSaving = Math.max(0, incrementalData.fullSizeBytes - incrementalData.deltaSizeBytes)
    const compressionSaving = incrementalData.compression?.bytesSaved || 0
    return baseDownloadSaving + compressionSaving
  }

  /**
   * Calcula eficiencia de la sincronización incremental
   */
  calculateEfficiency(campaign, delta) {
    const fullSize = JSON.stringify(campaign).length
    const deltaSize = delta.size
    
    if (fullSize === 0) return 0
    
    return Math.round(((fullSize - deltaSize) / fullSize) * 100)
  }

  /**
   * Calcula estadísticas de compresión para un delta
   */
  calculateCompressionStats(delta, incrementalData) {
    const baseEfficiency = this.calculateEfficiency({ size: JSON.stringify(delta).length }, delta)
    const compressionRatio = incrementalData.compression?.ratio || 1
    const compressionSaving = incrementalData.compression?.bytesSaved || 0

    return {
      baseEfficiency,
      compressionRatio,
      compressionSaving,
      totalEfficiency: Math.round((baseEfficiency * compressionRatio) * 0.8) // Factor de ajuste
    }
  }

  /**
   * Calcula eficiencia general del sync bidireccional
   */
  calculateOverallEfficiency(uploadResult, downloadResult) {
    const uploadBytes = uploadResult.bytesSaved || 0
    const downloadBytes = downloadResult.bytesSaved || 0
    const totalSaved = uploadBytes + downloadBytes

    if (totalSaved === 0) return 0

    // Estimación simple de eficiencia general
    return Math.round((totalSaved / (totalSaved + 1000)) * 100) // +1000 como overhead base
  }

  /**
   * Fallback a sincronización completa cuando delta es muy grande
   */
  async fallbackToFullSync(campaign) {
    const fullSize = JSON.stringify(campaign).length
    const result = await googleDrive.uploadCampaign(campaign.name, campaign)
    
    return {
      type: 'full_fallback',
      campaignId: campaign.id,
      campaignName: campaign.name,
      changes: true,
      reason: 'delta_too_large',
      fullSize,
      bytesSaved: 0,
      efficiency: 0
    }
  }

  /**
   * Maneja descarga completa cuando no hay delta
   */
  async handleFullDownload(localCampaign, driveData) {
    const campaigns = loadCampaigns()
    const updatedCampaigns = campaigns.map(c => 
      c.id === localCampaign.id ? driveData : c
    )
    saveCampaigns(updatedCampaigns)

    return {
      type: 'full_download',
      campaignId: localCampaign.id,
      campaignName: localCampaign.name,
      changes: true,
      reason: 'no_delta_available',
      fullSize: JSON.stringify(driveData).length,
      bytesSaved: 0
    }
  }

  /**
   * Obtiene estadísticas del servicio incremental
   */
  getStats() {
    const trackerStats = changeTracker.getStats()
    const compressionStats = dataCompression.getStats()
    
    return {
      ...trackerStats,
      deltaCache: {
        size: this.deltaCache.size,
        memoryUsage: JSON.stringify([...this.deltaCache.values()]).length
      },
      compression: compressionStats,
      settings: {
        compressionEnabled: this.compressionEnabled,
        maxDeltaSize: this.maxDeltaSize,
        compressionOptions: this.compressionOptions
      }
    }
  }

  /**
   * Limpia cache y optimiza memoria
   */
  cleanup() {
    this.deltaCache.clear()
    return changeTracker.cleanup()
  }
}

// Exportar instancia singleton
export const incrementalSync = new IncrementalSync()
export default incrementalSync