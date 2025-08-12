/**
 * Servicio de sincronización entre almacenamiento local y Google Drive - Versión Mejorada
 * Maneja la lógica de sync, conflictos y estado con configuración centralizada
 */

import { loadCampaigns, saveCampaigns } from './storage'
import googleDrive from './googleDrive'
import googleAuth from './googleAuth'
import syncConfig from '../config/syncConfig'
import MockSyncService from './mockSyncService'
import conflictDetector from './conflictDetector'
import dataMerger from './dataMerger'
import incrementalSync from './incrementalSync'
import changeTracker from './changeTracker'
import offlineCache from './offlineCache'
import offlineManager from './offlineManager'
import progressTracker from './progressTracker'
import backgroundSync from './backgroundSync'
import { debug, error as logError, warn } from '../utils/logger'

class SyncService {
  constructor() {
    this.config = syncConfig.getAll()
    this.syncStatus = {
      isConnected: false,
      lastSync: null,
      pendingChanges: false,
      error: null,
      isMockMode: syncConfig.isMockMode()
    }
    
    this.listeners = []
    this.autoSyncInterval = null
    this.initializationPromise = null
    
    // Instancia del servicio mock
    this.mockService = new MockSyncService()
    
    debug('🔄 SyncService inicializado:', {
      isMockMode: this.syncStatus.isMockMode,
      hasCredentials: syncConfig.hasRealCredentials(),
      autoSyncInterval: this.config.autoSyncInterval / 1000 + 's'
    })
    
  }


  /**
   * Verifica si debe usar el servicio mock
   * @returns {boolean}
   * @private
   */
  _shouldUseMock() {
    return this.syncStatus.isMockMode
  }

  /**
   * Inicializa el servicio de sincronización
   */
  async init() {
    if (this.initializationPromise) {
      return await this.initializationPromise
    }

    this.initializationPromise = this._performInit()
    
    try {
      return await this.initializationPromise
    } finally {
      this.initializationPromise = null
    }
  }

  /**
   * Realiza la inicialización real
   * @private
   */
  async _performInit() {
    try {
      debug('🚀 Inicializando servicio de sincronización...')

      if (this._shouldUseMock()) {
        debug('🧪 Inicialización en modo mock')
        await this.mockService.init()
        
        // Configurar listeners mock
        this.mockService.addListener((status) => {
          Object.assign(this.syncStatus, status)
          this.notifyListeners()
        })
        
        return true
      }

      // Inicialización real
      if (!syncConfig.hasRealCredentials()) {
        warn('⚠️ Credenciales no configuradas, sync deshabilitado')
        this.syncStatus.error = 'Credenciales no configuradas'
        this.notifyListeners()
        return false
      }

      // Inicializar Google Auth
      const authInitialized = await googleAuth.init()
      if (!authInitialized) {
        throw new Error('No se pudo inicializar Google Auth')
      }
      
      // Verificar estado de autenticación
      if (googleAuth.isSignedIn()) {
        this.syncStatus.isConnected = true
        this.startAutoSync()
      }

      // Configurar listener de cambios de autenticación
      googleAuth.onAuthStateChanged((isSignedIn) => {
        const wasConnected = this.syncStatus.isConnected
        this.syncStatus.isConnected = isSignedIn
        this.syncStatus.error = null
        
        if (isSignedIn && !wasConnected) {
          debug('✅ Usuario autenticado, iniciando auto-sync')
          this.startAutoSync()
        } else if (!isSignedIn && wasConnected) {
          debug('🔓 Usuario desautenticado, deteniendo auto-sync')
          this.stopAutoSync()
          googleDrive.clearCache()
        }
        
        this.notifyListeners()
      })

      debug('✅ Servicio de sincronización inicializado correctamente')
      return true
      
    } catch (error) {
      logError('❌ Error al inicializar servicio de sync:', error)
      this.syncStatus.error = error.message
      this.notifyListeners()
      return false
    }
  }

  /**
   * Conecta con Google Drive
   * @returns {Promise<boolean>} true si se conectó correctamente
   */
  async connect() {
    if (this._shouldUseMock()) {
      debug('🧪 Mock: Conectando con Google Drive...')
      return await this.mockService.connect()
    }

    try {
      debug('🔐 Conectando con Google Drive...')
      
      const user = await googleAuth.signIn()
      
      if (user) {
        this.syncStatus.isConnected = true
        this.syncStatus.error = null
        this.startAutoSync()
        this.notifyListeners()
        
        debug(`✅ Conectado a Google Drive como ${user.name}`)
        return true
      }
      
      return false
    } catch (error) {
      logError('❌ Error al conectar con Google Drive:', error)
      this.syncStatus.error = error.message
      this.notifyListeners()
      return false
    }
  }

  /**
   * Desconecta de Google Drive
   * @returns {Promise<boolean>} true si se desconectó correctamente
   */
  async disconnect() {
    try {
      const success = await googleAuth.signOut()
      
      if (success) {
        this.syncStatus.isConnected = false
        this.syncStatus.error = null
        this.stopAutoSync()
        googleDrive.clearCache()
        this.notifyListeners()
        
        debug('Desconectado de Google Drive')
        return true
      }
      
      return false
    } catch (error) {
      logError('Error al desconectar de Google Drive:', error)
      this.syncStatus.error = error.message
      this.notifyListeners()
      return false
    }
  }

  /**
   * Sincroniza todas las campañas locales con Drive
   * @returns {Promise<Object>} Resultado de la sincronización
   */
  async syncToCloud() {
    if (this._shouldUseMock()) {
      debug('🧪 Mock: Sincronizando hacia la nube...')
      const result = await this.mockService.syncToCloud()
      this.syncStatus.lastSync = new Date()
      this.syncStatus.pendingChanges = false
      this.notifyListeners()
      return result
    }

    if (!this.syncStatus.isConnected) {
      throw new Error('No está conectado a Google Drive')
    }

    try {
      debug('⬆️ Iniciando sincronización hacia la nube...')
      
      this.syncStatus.error = null
      this.notifyListeners()

      const localCampaigns = loadCampaigns()
      const result = {
        uploaded: 0,
        updated: 0,
        errors: []
      }

      if (localCampaigns.length === 0) {
        debug('ℹ️ No hay campañas locales para sincronizar')
        return result
      }

      // Obtener campañas existentes en Drive
      debug('🔍 Obteniendo lista de campañas en Drive...')
      const driveCampaigns = await googleDrive.listCampaigns()
      const driveMap = new Map(driveCampaigns.map(c => [c.name, c]))

      debug(`📊 ${localCampaigns.length} campañas locales, ${driveCampaigns.length} en Drive`)

      for (const campaign of localCampaigns) {
        try {
          const existingDrive = driveMap.get(campaign.name)
          
          if (existingDrive) {
            // Actualizar campaña existente
            debug(`🔄 Actualizando '${campaign.name}' en Drive...`)
            await googleDrive.updateCampaign(existingDrive.id, campaign)
            result.updated++
          } else {
            // Subir nueva campaña
            debug(`⬆️ Subiendo nueva campaña '${campaign.name}'...`)
            await googleDrive.uploadCampaign(campaign.name, campaign)
            result.uploaded++
          }
        } catch (error) {
          logError(`❌ Error al sincronizar campaña '${campaign.name}':`, error)
          result.errors.push({
            campaign: campaign.name,
            error: error.message
          })
        }
      }

      this.syncStatus.lastSync = new Date()
      this.syncStatus.pendingChanges = false
      this.notifyListeners()

      debug(`✅ Sync to cloud completado: ${result.uploaded} subidas, ${result.updated} actualizaciones, ${result.errors.length} errores`)
      return result
    } catch (error) {
      logError('❌ Error en sync to cloud:', error)
      this.syncStatus.error = error.message
      this.notifyListeners()
      throw error
    }
  }

  /**
   * Descarga y combina campañas desde Drive
   * @returns {Promise<Object>} Resultado de la descarga
   */
  async syncFromCloud() {
    if (this._shouldUseMock()) {
      debug('🧪 Mock: Sincronizando desde la nube...')
      const result = await this.mockService.syncFromCloud()
      this.syncStatus.lastSync = new Date()
      this.notifyListeners()
      return result
    }

    if (!this.syncStatus.isConnected) {
      throw new Error('No está conectado a Google Drive')
    }

    try {
      debug('⬇️ Iniciando sincronización desde la nube...')
      
      this.syncStatus.error = null
      this.notifyListeners()

      const driveCampaigns = await googleDrive.listCampaigns()
      const localCampaigns = loadCampaigns()
      const localMap = new Map(localCampaigns.map(c => [c.name, c]))

      const result = {
        downloaded: 0,
        updated: 0,
        conflicts: [],
        errors: [],
        newCampaigns: []
      }

      const updatedCampaigns = [...localCampaigns]

      debug(`📊 ${localCampaigns.length} campañas locales, ${driveCampaigns.length} en Drive`)

      for (const driveCampaign of driveCampaigns) {
        try {
          const campaignData = await googleDrive.downloadCampaign(driveCampaign.id)
          const existingLocal = localMap.get(driveCampaign.name)

          if (existingLocal) {
            // Usar el detector de conflictos avanzado
            const conflict = conflictDetector.detectConflict(
              existingLocal, 
              campaignData, 
              driveCampaign.name
            )

            if (conflict) {
              if (conflict.canAutoResolve) {
                // Resolver automáticamente
                try {
                  const resolution = conflictDetector.autoResolve(conflict)
                  const index = updatedCampaigns.findIndex(c => c.name === driveCampaign.name)
                  
                  if (index !== -1) {
                    updatedCampaigns[index] = {
                      ...resolution.data,
                      lastModified: new Date().toISOString(),
                      autoResolved: true,
                      resolutionReason: resolution.reason
                    }
                    result.updated++
                    debug(`🤖 Auto-resuelto: '${driveCampaign.name}' - ${resolution.reason}`)
                  }
                } catch (error) {
                  // Si falla la resolución automática, marcar como conflicto manual
                  result.conflicts.push({
                    ...conflict,
                    driveId: driveCampaign.id,
                    autoResolveFailed: true
                  })
                  warn(`⚠️ Falló auto-resolución de '${driveCampaign.name}', marcado como conflicto manual`)
                }
              } else {
                // Conflicto requiere intervención manual
                result.conflicts.push({
                  ...conflict,
                  driveId: driveCampaign.id,
                  summary: conflictDetector.generateSummary(conflict)
                })
                warn(`⚠️ Conflicto manual detectado en campaña '${driveCampaign.name}' - ${conflict.severity}`)
              }
            } else {
              // Sin conflicto - verificar si Drive es más reciente para actualizar
              const localModified = new Date(existingLocal.lastModified || existingLocal.createdAt || 0)
              const driveModified = driveCampaign.modifiedTime

              if (driveModified > localModified) {
                const index = updatedCampaigns.findIndex(c => c.name === driveCampaign.name)
                if (index !== -1) {
                  updatedCampaigns[index] = {
                    ...campaignData,
                    lastModified: driveModified.toISOString(),
                    syncedFromDrive: true
                  }
                  result.updated++
                  debug(`✅ Campaña '${driveCampaign.name}' actualizada desde Drive`)
                }
              } else {
                debug(`📌 Campaña '${driveCampaign.name}' sin cambios necesarios`)
              }
            }
          } else {
            // Nueva campaña desde Drive
            const newCampaign = {
              ...campaignData,
              lastModified: driveCampaign.modifiedTime.toISOString(),
              syncedFromDrive: true
            }
            
            updatedCampaigns.push(newCampaign)
            result.downloaded++
            result.newCampaigns.push(driveCampaign.name)
            debug(`📥 Nueva campaña '${driveCampaign.name}' descargada desde Drive`)
          }
        } catch (error) {
          logError(`❌ Error al descargar campaña '${driveCampaign.name}':`, error)
          result.errors.push({
            campaign: driveCampaign.name,
            error: error.message,
            type: 'download'
          })
        }
      }

      // Guardar campañas actualizadas solo si hubo cambios
      if (result.downloaded > 0 || result.updated > 0) {
        saveCampaigns(updatedCampaigns)
        debug(`💾 ${result.downloaded + result.updated} campañas guardadas localmente`)
      }

      this.syncStatus.lastSync = new Date()
      this.syncStatus.pendingChanges = result.conflicts.length > 0
      this.notifyListeners()

      debug(`✅ Sync from cloud completado: ${result.downloaded} nuevas, ${result.updated} actualizadas, ${result.conflicts.length} conflictos, ${result.errors.length} errores`)
      return result
    } catch (error) {
      logError('❌ Error en sync from cloud:', error)
      this.syncStatus.error = error.message
      this.notifyListeners()
      throw error
    }
  }

  /**
   * Resuelve un conflicto eligiendo usar la versión de Drive o local
   * @param {string} campaignName Nombre de la campaña en conflicto
   * @param {boolean} useDriveVersion true para usar Drive, false para usar local
   * @returns {Promise<Object>} Resultado de la resolución
   */
  async resolveConflict(campaignName, useDriveVersion) {
    if (this._shouldUseMock()) {
      debug(`🧪 Mock: Resolviendo conflicto para '${campaignName}', usar Drive: ${useDriveVersion}`)
      return await this.mockService.resolveConflict(campaignName, useDriveVersion)
    }

    try {
      debug(`🔧 Resolviendo conflicto para '${campaignName}', usar ${useDriveVersion ? 'Drive' : 'local'}`)
      
      const campaigns = loadCampaigns()
      const driveCampaigns = await googleDrive.listCampaigns()
      
      const localCampaign = campaigns.find(c => c.name === campaignName)
      const driveCampaign = driveCampaigns.find(c => c.name === campaignName)

      if (!localCampaign || !driveCampaign) {
        throw new Error('No se encontró la campaña en conflicto')
      }

      let result = {
        campaignName,
        resolution: useDriveVersion ? 'drive' : 'local',
        timestamp: new Date().toISOString()
      }

      if (useDriveVersion) {
        // Usar versión de Drive
        const driveData = await googleDrive.downloadCampaign(driveCampaign.id)
        const updatedCampaigns = campaigns.map(c => 
          c.name === campaignName ? {
            ...driveData,
            lastModified: driveCampaign.modifiedTime.toISOString(),
            resolvedConflict: true,
            resolutionType: 'manual_drive'
          } : c
        )
        saveCampaigns(updatedCampaigns)
        
        result.action = 'local_updated_from_drive'
        debug(`✅ Conflicto resuelto usando versión de Drive para '${campaignName}'`)
      } else {
        // Usar versión local, subir a Drive
        const updatedLocal = {
          ...localCampaign,
          lastModified: new Date().toISOString(),
          resolvedConflict: true,
          resolutionType: 'manual_local'
        }
        
        await googleDrive.updateCampaign(driveCampaign.id, updatedLocal)
        
        // Actualizar también local con marca de resolución
        const updatedCampaigns = campaigns.map(c => 
          c.name === campaignName ? updatedLocal : c
        )
        saveCampaigns(updatedCampaigns)
        
        result.action = 'drive_updated_from_local'
        debug(`✅ Conflicto resuelto usando versión local para '${campaignName}'`)
      }

      // Actualizar estado de sync
      this.syncStatus.pendingChanges = false
      this.syncStatus.lastSync = new Date()
      this.notifyListeners()

      return result
    } catch (error) {
      logError('❌ Error al resolver conflicto:', error)
      throw error
    }
  }

  /**
   * Obtiene la lista actual de conflictos pendientes
   * @returns {Array} Lista de conflictos
   */
  getPendingConflicts() {
    // En una implementación real, esto podría almacenarse en el estado
    // Por ahora, requiere una nueva sincronización para detectar conflictos
    return this.syncStatus.pendingConflicts || []
  }

  /**
   * Detecta conflictos sin realizar sincronización
   * @returns {Promise<Array>} Lista de conflictos detectados
   */
  async detectConflicts() {
    if (this._shouldUseMock()) {
      return []
    }

    if (!this.syncStatus.isConnected) {
      throw new Error('No está conectado a Google Drive')
    }

    try {
      debug('🔍 Detectando conflictos...')
      
      const driveCampaigns = await googleDrive.listCampaigns()
      const localCampaigns = loadCampaigns()
      const localMap = new Map(localCampaigns.map(c => [c.name, c]))
      const conflicts = []

      for (const driveCampaign of driveCampaigns) {
        const existingLocal = localMap.get(driveCampaign.name)
        
        if (existingLocal) {
          try {
            const campaignData = await googleDrive.downloadCampaign(driveCampaign.id)
            const conflict = conflictDetector.detectConflict(
              existingLocal, 
              campaignData, 
              driveCampaign.name
            )

            if (conflict && !conflict.canAutoResolve) {
              conflicts.push({
                ...conflict,
                driveId: driveCampaign.id,
                summary: conflictDetector.generateSummary(conflict)
              })
            }
          } catch (error) {
            logError(`Error al verificar conflictos en '${driveCampaign.name}':`, error)
          }
        }
      }

      debug(`🔍 ${conflicts.length} conflictos pendientes detectados`)
      return conflicts
    } catch (error) {
      logError('❌ Error al detectar conflictos:', error)
      throw error
    }
  }

  /**
   * Intenta resolver conflictos usando merge inteligente
   * @param {Array} conflicts Lista de conflictos
   * @param {Object} options Opciones de merge
   * @returns {Promise<Object>} Resultado del merge
   */
  async attemptSmartMerge(conflicts, options = {}) {
    if (this._shouldUseMock()) {
      debug('🧪 Mock: Intentando merge inteligente...')
      return {
        resolved: Math.min(conflicts.length, 2),
        remaining: Math.max(0, conflicts.length - 2),
        merged: conflicts.slice(0, 2).map(c => c.campaignName || c.name)
      }
    }

    try {
      debug('🤖 Iniciando merge inteligente automático...')
      
      const campaigns = loadCampaigns()
      const result = {
        resolved: 0,
        remaining: 0,
        merged: [],
        errors: []
      }

      const updatedCampaigns = [...campaigns]

      for (const conflict of conflicts) {
        try {
          const campaignName = conflict.campaignName || conflict.name

          // Verificar si el merge es seguro
          if (!dataMerger.isSafeMerge(conflict.localData, conflict.remoteData, options)) {
            result.remaining++
            debug(`⚠️ Merge no seguro para '${campaignName}', requiere intervención manual`)
            continue
          }

          // Realizar merge inteligente
          const mergedData = dataMerger.smartMerge(
            conflict.localData,
            conflict.remoteData,
            {
              resolveConflicts: 'combine',
              combineArrays: true,
              preserveLocalChanges: true,
              ...options
            }
          )

          // Actualizar campaña local
          const campaignIndex = updatedCampaigns.findIndex(c => c.name === campaignName)
          if (campaignIndex !== -1) {
            updatedCampaigns[campaignIndex] = {
              ...mergedData,
              autoMerged: true,
              mergedAt: new Date().toISOString()
            }

            // Actualizar en Drive también
            if (conflict.driveId) {
              await googleDrive.updateCampaign(conflict.driveId, mergedData)
            }

            result.resolved++
            result.merged.push(campaignName)
            debug(`✅ Merge automático exitoso para '${campaignName}'`)
          }
        } catch (error) {
          logError(`❌ Error en merge de '${conflict.campaignName || conflict.name}':`, error)
          result.errors.push({
            campaign: conflict.campaignName || conflict.name,
            error: error.message
          })
          result.remaining++
        }
      }

      // Guardar campañas actualizadas si hubo cambios
      if (result.resolved > 0) {
        saveCampaigns(updatedCampaigns)
        this.syncStatus.lastSync = new Date()
        this.notifyListeners()
      }

      debug(`🤖 Merge inteligente completado: ${result.resolved} resueltos, ${result.remaining} pendientes`)
      return result
    } catch (error) {
      logError('❌ Error en merge inteligente:', error)
      throw error
    }
  }

  /**
   * Sincronización completa con merge inteligente
   * @returns {Promise<Object>} Resultado de la sincronización
   */
  async smartSync() {
    if (this._shouldUseMock()) {
      debug('🧪 Mock: Sincronización inteligente...')
      // Simular sync completo con algunos merges automáticos
      const uploadResult = await this.mockService.syncToCloud()
      const downloadResult = await this.mockService.syncFromCloud()
      
      let mergeResult = { resolved: 0, remaining: 0, merged: [] }
      if (downloadResult.conflicts.length > 0) {
        mergeResult = await this.attemptSmartMerge(downloadResult.conflicts)
      }

      return {
        upload: uploadResult,
        download: downloadResult,
        smartMerge: mergeResult,
        totalConflicts: downloadResult.conflicts.length,
        resolvedConflicts: mergeResult.resolved,
        pendingConflicts: mergeResult.remaining
      }
    }

    if (!this.syncStatus.isConnected) {
      throw new Error('No está conectado a Google Drive')
    }

    try {
      debug('🚀 Iniciando sincronización inteligente completa...')

      // 1. Subir cambios locales
      const uploadResult = await this.syncToCloud()

      // 2. Descargar cambios remotos
      const downloadResult = await this.syncFromCloud()

      // 3. Intentar merge automático de conflictos
      let mergeResult = { resolved: 0, remaining: 0, merged: [] }
      if (downloadResult.conflicts && downloadResult.conflicts.length > 0) {
        mergeResult = await this.attemptSmartMerge(downloadResult.conflicts)
      }

      const result = {
        upload: uploadResult,
        download: downloadResult,
        smartMerge: mergeResult,
        totalConflicts: downloadResult.conflicts.length,
        resolvedConflicts: mergeResult.resolved,
        pendingConflicts: mergeResult.remaining,
        summary: {
          uploaded: uploadResult.uploaded,
          updated: uploadResult.updated + downloadResult.updated,
          downloaded: downloadResult.downloaded,
          autoMerged: mergeResult.resolved,
          manualConflicts: mergeResult.remaining,
          errors: (uploadResult.errors?.length || 0) + (downloadResult.errors?.length || 0) + (mergeResult.errors?.length || 0)
        }
      }

      debug(`🚀 Sync inteligente completado: ${JSON.stringify(result.summary)}`)
      return result
    } catch (error) {
      logError('❌ Error en sincronización inteligente:', error)
      throw error
    }
  }

  /**
   * Sincronización incremental optimizada - solo envía cambios
   * @param {Object} options Opciones de sincronización incremental
   * @returns {Promise<Object>} Resultado de la sincronización
   */
  async syncIncremental(options = {}) {
    if (this._shouldUseMock()) {
      debug('🧪 Mock: Sync incremental simulado')
      return {
        type: 'incremental_mock',
        campaigns: [],
        totalBytesSaved: Math.floor(Math.random() * 50000),
        efficiency: 85 + Math.floor(Math.random() * 15),
        changedCampaigns: Math.floor(Math.random() * 3)
      }
    }

    if (!this.syncStatus.isConnected) {
      throw new Error('No está conectado a Google Drive')
    }

    try {
      debug('⚡ Iniciando sincronización incremental...')

      const campaigns = loadCampaigns()
      const results = []
      let totalBytesSaved = 0
      let totalOperations = 0

      const campaignsToSync = options.campaignIds 
        ? campaigns.filter(c => options.campaignIds.includes(c.id))
        : campaigns

      if (campaignsToSync.length === 0) {
        debug('📭 No hay campañas para sincronizar incrementalmente')
        return {
          type: 'incremental',
          campaigns: [],
          totalBytesSaved: 0,
          efficiency: 0,
          message: 'No hay campañas para sincronizar'
        }
      }

      // Sincronizar cada campaña incrementalmente
      for (const campaign of campaignsToSync) {
        try {
          // Tomar snapshot inicial si no existe
          if (!changeTracker.snapshots.has(campaign.id)) {
            changeTracker.takeSnapshot(campaign)
          }

          const result = await incrementalSync.syncIncrementalBidirectional(campaign.id)
          results.push(result)
          
          totalBytesSaved += result.totalBytesSaved || 0
          totalOperations += (result.upload?.operationsCount || 0) + (result.download?.operationsApplied || 0)

          debug(`⚡ Campaña '${campaign.name}': ${result.totalBytesSaved}B ahorrados`)
        } catch (error) {
          logError(`❌ Error en sync incremental de '${campaign.name}':`, error)
          results.push({
            type: 'incremental_error',
            campaignId: campaign.id,
            campaignName: campaign.name,
            error: error.message
          })
        }
      }

      // Calcular estadísticas generales
      const changedCampaigns = results.filter(r => r.upload?.changes || r.download?.changes).length
      const averageEfficiency = results.length > 0 
        ? results.reduce((sum, r) => sum + (r.efficiency?.overall || 0), 0) / results.length
        : 0

      this.syncStatus.lastSync = new Date()
      this.notifyListeners()

      const finalResult = {
        type: 'incremental',
        campaigns: results,
        summary: {
          totalCampaigns: campaignsToSync.length,
          changedCampaigns,
          unchangedCampaigns: campaignsToSync.length - changedCampaigns,
          totalBytesSaved,
          totalOperations,
          averageEfficiency: Math.round(averageEfficiency),
          errors: results.filter(r => r.error).length
        }
      }

      debug(`⚡ Sync incremental completado: ${totalBytesSaved}B ahorrados, ${averageEfficiency.toFixed(1)}% eficiencia`)
      return finalResult

    } catch (error) {
      logError('❌ Error en sincronización incremental:', error)
      throw error
    }
  }

  /**
   * Sincronización bidireccional mejorada con progreso y cache
   */
  async syncBidirectional(campaignId, options = {}) {
    const operationId = `sync-bidirectional-${campaignId}-${Date.now()}`
    const progress = progressTracker.createSyncOperation(campaignId, 'bidirectional')
    
    try {
      progress.setPhase('initializing', 'Iniciando sincronización bidireccional...')
      
      // Usar cache si está disponible y es apropiado
      if (options.useCache !== false) {
        const cachedData = await offlineCache.getCampaign(campaignId)
        if (cachedData && options.cacheFirst) {
          progress.addStep('Datos obtenidos desde cache')
        }
      }
      
      // Ejecutar sync incremental bidireccional
      progress.setPhase('syncing', 'Sincronizando cambios...')
      const result = await incrementalSync.syncIncrementalBidirectional(campaignId)
      
      // Actualizar cache
      if (result.upload?.changes || result.download?.changes) {
        progress.addStep('Actualizando cache local...')
        const campaigns = loadCampaigns()
        const updatedCampaign = campaigns.find(c => c.id === campaignId)
        if (updatedCampaign) {
          await offlineCache.setCampaign(campaignId, updatedCampaign)
        }
      }
      
      progress.complete(result)
      return result
      
    } catch (error) {
      progress.error(error)
      throw error
    }
  }

  /**
   * Sincronización mejorada con estrategias offline
   */
  async syncWithOfflineStrategy(campaignIds = null, strategy = 'smart') {
    return await offlineManager.executeWithStrategy(
      'sync-campaign',
      campaignIds ? campaignIds.join(',') : 'all',
      async () => {
        if (campaignIds) {
          const results = []
          for (const id of campaignIds) {
            const result = await this.syncBidirectional(id)
            results.push(result)
          }
          return results
        } else {
          return await this.syncIncremental()
        }
      },
      'campaigns'
    )
  }

  /**
   * Optimiza todas las campañas tomando snapshots iniciales
   * @returns {Promise<Object>} Resultado de la optimización
   */
  async optimizeCampaigns() {
    try {
      debug('🔧 Optimizando campañas para sync incremental...')

      const campaigns = loadCampaigns()
      let snapshotsTaken = 0

      campaigns.forEach(campaign => {
        if (!changeTracker.snapshots.has(campaign.id)) {
          changeTracker.takeSnapshot(campaign)
          snapshotsTaken++
        }
      })

      // Limpiar datos antiguos
      const cleanedEntries = changeTracker.cleanup()

      debug(`🔧 Optimización completada: ${snapshotsTaken} snapshots, ${cleanedEntries} limpiezas`)

      return {
        snapshotsTaken,
        cleanedEntries,
        totalCampaigns: campaigns.length,
        stats: changeTracker.getStats()
      }

    } catch (error) {
      logError('❌ Error en optimización:', error)
      throw error
    }
  }

  /**
   * Obtiene estadísticas detalladas de sincronización
   */
  getSyncStats() {
    const baseStats = this.getStats()
    const changeTrackerStats = changeTracker.getStats()
    const incrementalStats = incrementalSync.getStats()

    return {
      ...baseStats,
      incremental: {
        ...incrementalStats,
        ...changeTrackerStats,
        isOptimized: changeTrackerStats.trackedCampaigns > 0
      }
    }
  }

  /**
   * Inicia el auto-sync automático
   */
  startAutoSync() {
    if (this.autoSyncInterval) return

    if (this._shouldUseMock()) {
      return this.mockService.startAutoSync()
    }

    this.autoSyncInterval = setInterval(async () => {
      if (this.syncStatus.isConnected && this.syncStatus.pendingChanges) {
        try {
          debug('🔄 Auto-sync ejecutándose...')
          await this.syncToCloud()
          debug('✅ Auto-sync completado')
        } catch (error) {
          // No logear como error crítico, es auto-sync
          debug('❌ Auto-sync falló:', error.message)
        }
      }
    }, this.config.autoSyncInterval)

    debug(`🕐 Auto-sync iniciado (cada ${this.config.autoSyncInterval / 1000}s)`)
  }

  /**
   * Detiene el auto-sync automático
   */
  stopAutoSync() {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval)
      this.autoSyncInterval = null
      debug('Auto-sync detenido')
    }
  }

  /**
   * Marca que hay cambios pendientes de sincronizar
   */
  markPendingChanges() {
    if (this._shouldUseMock()) {
      return this.mockService.markPendingChanges()
    }

    this.syncStatus.pendingChanges = true
    this.notifyListeners()
    debug('📝 Cambios marcados como pendientes')
  }

  /**
   * Obtiene el estado actual de sincronización
   */
  getStatus() {
    if (this._shouldUseMock()) {
      const mockStatus = this.mockService.getStatus()
      return {
        ...this.syncStatus,
        ...mockStatus
      }
    }
    
    return { ...this.syncStatus }
  }

  /**
   * Obtiene información del usuario actual
   */
  getCurrentUser() {
    if (this._shouldUseMock()) {
      return this.mockService.getCurrentUser()
    }
    
    return googleAuth.getCurrentUser()
  }

  /**
   * Obtiene estadísticas de sincronización
   */
  getStats() {
    const baseStats = {
      isMockMode: this._shouldUseMock(),
      hasCredentials: syncConfig.hasRealCredentials(),
      autoSyncActive: !!this.autoSyncInterval,
      autoSyncInterval: this.config.autoSyncInterval,
      listenersCount: this.listeners.length
    }

    if (this._shouldUseMock()) {
      return baseStats
    }

    return {
      ...baseStats,
      googleDriveStats: googleDrive.getStats(),
      googleAuthState: googleAuth.getInitState()
    }
  }

  /**
   * Verifica si el servicio está disponible
   */
  isAvailable() {
    return syncConfig.isSyncAvailable()
  }

  /**
   * Verifica si hay una sincronización en progreso
   */
  isSyncing() {
    return progressTracker.getOperationsByType('synchronization').length > 0 ||
           backgroundSync.getStatus().syncInProgress
  }

  /**
   * Suscribe un listener a cambios de estado
   * @param {Function} listener Función a llamar cuando cambie el estado
   */
  addListener(listener) {
    this.listeners.push(listener)
  }

  /**
   * Desuscribe un listener
   * @param {Function} listener Función a remover
   */
  removeListener(listener) {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  /**
   * Prepara el sistema para modo offline
   */
  async prepareOfflineMode() {
    try {
      await offlineManager.prepareOfflineMode()
      await offlineCache.optimize()
      debug('🌐 Sistema preparado para modo offline')
      return true
    } catch (error) {
      logError('❌ Error preparando modo offline:', error)
      return false
    }
  }

  /**
   * Inicia background sync automático
   */
  enableBackgroundSync(config = {}) {
    backgroundSync.configureAutoSync({
      enabled: true,
      ...config
    })
    debug('🔄 Background sync habilitado')
  }

  /**
   * Detiene background sync automático  
   */
  disableBackgroundSync() {
    backgroundSync.configureAutoSync({ enabled: false })
    debug('🔄 Background sync deshabilitado')
  }

  /**
   * Obtiene estado completo incluyendo optimizaciones
   */
  getExtendedStatus() {
    const baseStatus = this.getStatus()
    
    return {
      ...baseStatus,
      offline: offlineManager.getOfflineStatus(),
      backgroundSync: backgroundSync.getStatus(),
      cache: {
        available: true,
        // stats se obtienen async, por eso no se incluyen aquí
      },
      progress: {
        activeOperations: progressTracker.getActiveOperations().length,
        hasActiveSync: progressTracker.getOperationsByType('synchronization').length > 0
      }
    }
  }

  /**
   * Obtiene estadísticas completas de cache
   */
  async getCacheStats() {
    try {
      return await offlineCache.getStats()
    } catch (error) {
      logError('❌ Error obteniendo estadísticas de cache:', error)
      return { error: error.message }
    }
  }

  /**
   * Limpia cache y optimiza rendimiento
   */
  async optimizePerformance() {
    const progress = progressTracker.createCacheOperation('optimization', 1)
    
    try {
      progress.setPhase('cleaning', 'Limpiando cache obsoleto...')
      const cacheResult = await offlineCache.optimize()
      progress.addStep(`Cache optimizado: ${cacheResult.entriesRemoved || 0} entradas eliminadas`)
      
      progress.setPhase('tracking', 'Optimizando change tracking...')  
      const trackingResult = changeTracker.cleanup()
      progress.addStep(`Change tracking optimizado`)
      
      progress.setPhase('sync', 'Limpiando syncs fallidos...')
      backgroundSync.clearFailedSyncs()
      progress.addStep('Syncs fallidos limpiados')
      
      const result = {
        cache: cacheResult,
        tracking: trackingResult,
        backgroundSync: 'cleaned'
      }
      
      progress.complete(result)
      debug('🔧 Optimización de rendimiento completada')
      return result
      
    } catch (error) {
      progress.error(error)
      throw error
    }
  }

  /**
   * Notifica a todos los listeners sobre cambios de estado
   */
  notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.syncStatus)
      } catch (error) {
        logError('Error en listener de sync:', error)
      }
    })
  }
}

// Exportar instancia singleton
export const syncService = new SyncService()
export default syncService