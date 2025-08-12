/**
 * Servicio para interactuar con Google Drive - Versión Mejorada
 * Maneja subida, descarga y gestión de archivos de campañas con configuración centralizada
 */

import googleAuth from './googleAuth'
import syncConfig from '../config/syncConfig'
import MockSyncService from './mockSyncService'
import dataCompression from './dataCompression'
import { debug, error as logError, warn } from '../utils/logger'

class GoogleDriveService {
  constructor() {
    this.config = syncConfig.getAll()
    this.folderCache = null
    this.requestQueue = []
    this.isProcessingQueue = false
    
    // Instancia del servicio mock para desarrollo
    this.mockService = new MockSyncService()
    
    debug('🚀 GoogleDriveService inicializado:', {
      isMockMode: syncConfig.isMockMode(),
      hasCredentials: syncConfig.hasRealCredentials(),
      folderName: this.config.driveFolderName
    })
  }

  /**
   * Verifica si debe usar el servicio mock o real
   * @returns {boolean}
   */
  _shouldUseMock() {
    return syncConfig.isMockMode()
  }

  /**
   * Verifica que Google API esté disponible y el usuario autenticado
   */
  async ensureAuthenticated() {
    if (this._shouldUseMock()) {
      debug('🧪 Mock: Autenticación simulada')
      return true
    }

    try {
      const initialized = await googleAuth.init()
      if (!initialized) {
        throw new Error('No se pudo inicializar Google API')
      }

      if (!googleAuth.isSignedIn()) {
        throw new Error('Usuario no autenticado')
      }

      return true
    } catch (error) {
      logError('Error de autenticación:', error)
      throw error
    }
  }

  /**
   * Busca o crea la carpeta de la aplicación en Google Drive
   * @returns {Promise<string>} ID de la carpeta
   */
  async ensureAppFolder() {
    if (this._shouldUseMock()) {
      debug('🧪 Mock: ID de carpeta simulado')
      return 'mock-folder-id'
    }

    if (this.folderCache) return this.folderCache

    try {
      await this.ensureAuthenticated()

      const folderName = this.config.driveFolderName
      debug(`🔍 Buscando carpeta '${folderName}'...`)

      // Buscar carpeta existente
      const response = await this._executeRequest(() => 
        window.gapi.client.drive.files.list({
          q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
          spaces: 'drive'
        })
      )

      if (response.result.files && response.result.files.length > 0) {
        this.folderCache = response.result.files[0].id
        debug(`✅ Carpeta encontrada: ${this.folderCache}`)
        return this.folderCache
      }

      // Crear carpeta si no existe
      debug(`📁 Creando carpeta '${folderName}'...`)
      const createResponse = await this._executeRequest(() =>
        window.gapi.client.drive.files.create({
          resource: {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder'
          }
        })
      )

      this.folderCache = createResponse.result.id
      debug(`✅ Carpeta creada: ${this.folderCache}`)
      return this.folderCache
    } catch (error) {
      logError('❌ Error al crear/buscar carpeta:', error)
      throw error
    }
  }

  /**
   * Ejecuta una request con manejo de errores y reintentos
   * @param {Function} requestFn Función que ejecuta la request
   * @param {number} retries Número de reintentos restantes  
   * @returns {Promise} Resultado de la request
   * @private
   */
  async _executeRequest(requestFn, retries = this.config.maxRetries) {
    try {
      return await requestFn()
    } catch (error) {
      if (retries > 0 && this._isRetryableError(error)) {
        warn(`🔄 Reintentando request (${retries} intentos restantes):`, error.message)
        await this._delay(this.config.retryDelay)
        return this._executeRequest(requestFn, retries - 1)
      }
      throw error
    }
  }

  /**
   * Determina si un error es reintentable
   * @param {Error} error 
   * @returns {boolean}
   * @private
   */
  _isRetryableError(error) {
    const retryableCodes = [429, 500, 502, 503, 504]
    return retryableCodes.includes(error.status) || 
           error.message.includes('network') ||
           error.message.includes('timeout')
  }

  /**
   * Delay utility
   * @param {number} ms 
   * @returns {Promise}
   * @private
   */
  async _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Lista todas las campañas guardadas en Drive
   * @returns {Promise<Array>} Lista de archivos de campaña
   */
  async listCampaigns() {
    if (this._shouldUseMock()) {
      return this.mockService.listCampaigns ? await this.mockService.listCampaigns() : []
    }

    try {
      const folderId = await this.ensureAppFolder()
      
      debug('📋 Listando campañas desde Drive...')
      const response = await this._executeRequest(() =>
        window.gapi.client.drive.files.list({
          q: `'${folderId}' in parents and name contains '${this.config.fileExtension}' and trashed=false`,
          fields: 'files(id, name, modifiedTime, size)',
          orderBy: 'modifiedTime desc'
        })
      )

      const campaigns = response.result.files.map(file => ({
        id: file.id,
        name: file.name.replace(this.config.fileExtension, ''),
        modifiedTime: new Date(file.modifiedTime),
        size: parseInt(file.size) || 0
      }))

      debug(`✅ ${campaigns.length} campañas encontradas en Drive`)
      return campaigns
    } catch (error) {
      logError('❌ Error al listar campañas:', error)
      return []
    }
  }

  /**
   * Sube una campaña a Google Drive
   * @param {string} campaignName Nombre de la campaña
   * @param {Object} campaignData Datos de la campaña
   * @returns {Promise<string>} ID del archivo creado
   */
  async uploadCampaign(campaignName, campaignData) {
    if (this._shouldUseMock()) {
      debug(`🧪 Mock: Subiendo campaña '${campaignName}'`)
      await this._delay(1500)
      return `mock-file-id-${campaignName.replace(/\s+/g, '-')}`
    }

    try {
      const folderId = await this.ensureAppFolder()
      const fileName = `${campaignName}${this.config.fileExtension}`
      
      debug(`⬆️ Subiendo campaña '${campaignName}'...`)

      // Preparar metadata del archivo
      const fileMetadata = {
        name: fileName,
        parents: [folderId],
        description: `Campaña D&D: ${campaignName}`,
        appProperties: {
          'app': 'Mi Gestor DnD',
          'type': 'campaign',
          'version': '1.0'
        }
      }

      // Añadir timestamp de modificación
      const campaignWithMeta = {
        ...campaignData,
        lastModified: new Date().toISOString(),
        syncVersion: 1
      }

      // Convertir y comprimir datos
      const jsonData = JSON.stringify(campaignWithMeta, null, 2)
      const originalSize = jsonData.length
      
      let finalData = jsonData
      let compressionInfo = null
      
      // Aplicar compresión si el archivo es grande
      if (originalSize > 10 * 1024) { // > 10KB
        debug(`📦 Aplicando compresión a campaña '${campaignName}' (${originalSize}B)`)
        const compressionResult = dataCompression.compress(campaignWithMeta, {
          method: 'auto',
          level: 'balanced',
          threshold: 5 * 1024 // 5KB threshold para campaigns
        })
        
        if (compressionResult.compressed) {
          // Crear estructura con datos comprimidos
          const compressedCampaign = {
            ...campaignWithMeta,
            _compressionData: compressionResult,
            _originalSize: originalSize,
            _compressed: true
          }
          finalData = JSON.stringify(compressedCampaign)
          compressionInfo = {
            method: compressionResult.method,
            ratio: compressionResult.ratio,
            originalSize,
            compressedSize: finalData.length,
            bytesSaved: originalSize - finalData.length
          }
          debug(`📦 Compresión exitosa: ${originalSize}B → ${finalData.length}B (${compressionResult.ratio.toFixed(2)}x)`)
        }
      }
      
      // Crear blob
      const blob = new Blob([finalData], { type: 'application/json' })

      // Subir archivo
      const response = await this._uploadFile(fileMetadata, blob)
      
      if (compressionInfo) {
        debug(`✅ Campaña '${campaignName}' subida con compresión:`, {
          fileId: response.result.id,
          ...compressionInfo
        })
      } else {
        debug(`✅ Campaña '${campaignName}' subida exitosamente:`, response.result.id)
      }
      return response.result.id
    } catch (error) {
      logError(`❌ Error al subir campaña '${campaignName}':`, error)
      throw error
    }
  }

  /**
   * Actualiza una campaña existente en Drive
   * @param {string} fileId ID del archivo en Drive
   * @param {Object} campaignData Datos actualizados de la campaña
   * @returns {Promise<string>} ID del archivo actualizado
   */
  async updateCampaign(fileId, campaignData) {
    if (this._shouldUseMock()) {
      debug(`🧪 Mock: Actualizando campaña ID '${fileId}'`)
      await this._delay(1200)
      return fileId
    }

    try {
      debug(`🔄 Actualizando campaña ID '${fileId}'...`)

      // Añadir metadata de sincronización
      const campaignWithMeta = {
        ...campaignData,
        lastModified: new Date().toISOString(),
        syncVersion: (campaignData.syncVersion || 0) + 1
      }

      // Convertir y comprimir datos
      const jsonData = JSON.stringify(campaignWithMeta, null, 2)
      const originalSize = jsonData.length
      
      let finalData = jsonData
      let compressionInfo = null
      
      // Aplicar compresión si el archivo es grande
      if (originalSize > 10 * 1024) { // > 10KB
        debug(`📦 Aplicando compresión a actualización de campaña ID '${fileId}' (${originalSize}B)`)
        const compressionResult = dataCompression.compress(campaignWithMeta, {
          method: 'auto',
          level: 'balanced',
          threshold: 5 * 1024 // 5KB threshold
        })
        
        if (compressionResult.compressed) {
          // Crear estructura con datos comprimidos
          const compressedCampaign = {
            ...campaignWithMeta,
            _compressionData: compressionResult,
            _originalSize: originalSize,
            _compressed: true
          }
          finalData = JSON.stringify(compressedCampaign)
          compressionInfo = {
            method: compressionResult.method,
            ratio: compressionResult.ratio,
            originalSize,
            compressedSize: finalData.length,
            bytesSaved: originalSize - finalData.length
          }
          debug(`📦 Compresión exitosa: ${originalSize}B → ${finalData.length}B (${compressionResult.ratio.toFixed(2)}x)`)
        }
      }

      const blob = new Blob([finalData], { type: 'application/json' })

      const response = await this._updateFile(fileId, blob)
      
      if (compressionInfo) {
        debug(`✅ Campaña actualizada con compresión:`, {
          fileId: response.result.id,
          ...compressionInfo
        })
      } else {
        debug(`✅ Campaña actualizada exitosamente:`, response.result.id)
      }
      return response.result.id
    } catch (error) {
      logError(`❌ Error al actualizar campaña '${fileId}':`, error)
      throw error
    }
  }

  /**
   * Descarga una campaña desde Google Drive
   * @param {string} fileId ID del archivo en Drive
   * @returns {Promise<Object>} Datos de la campaña
   */
  async downloadCampaign(fileId) {
    if (this._shouldUseMock()) {
      debug(`🧪 Mock: Descargando campaña ID '${fileId}'`)
      await this._delay(1000)
      return {
        name: 'Campaña de Ejemplo',
        description: 'Campaña descargada desde modo mock',
        lastModified: new Date().toISOString(),
        syncVersion: 1,
        players: [],
        npcs: [],
        locations: [],
        quests: [],
        objects: [],
        notes: []
      }
    }

    try {
      debug(`⬇️ Descargando campaña ID '${fileId}'...`)

      const response = await this._executeRequest(() =>
        window.gapi.client.drive.files.get({
          fileId: fileId,
          alt: 'media'
        })
      )

      let campaignData = JSON.parse(response.body)
      
      // Verificar si los datos están comprimidos
      if (campaignData._compressed && campaignData._compressionData) {
        debug(`📦 Descomprimiendo campaña descargada (${campaignData._compressionData.method})`)
        
        try {
          // Descomprimir los datos
          const decompressedData = dataCompression.decompress(campaignData._compressionData)
          
          // Limpiar metadatos de compresión
          delete decompressedData._compressionData
          delete decompressedData._originalSize
          delete decompressedData._compressed
          
          campaignData = decompressedData
          debug(`📦 Descompresión exitosa: ${campaignData._compressionData?.compressedSize || 'N/A'}B → ${campaignData._originalSize || 'N/A'}B`)
        } catch (error) {
          warn(`📦 Error al descomprimir, usando datos originales:`, error.message)
          // Remover metadatos de compresión fallidos
          delete campaignData._compressionData
          delete campaignData._originalSize
          delete campaignData._compressed
        }
      }
      
      debug(`✅ Campaña descargada exitosamente desde Drive`)
      return campaignData
    } catch (error) {
      logError(`❌ Error al descargar campaña '${fileId}':`, error)
      throw error
    }
  }

  /**
   * Elimina una campaña de Google Drive
   * @param {string} fileId ID del archivo en Drive
   * @returns {Promise<boolean>} true si se eliminó correctamente
   */
  async deleteCampaign(fileId) {
    if (this._shouldUseMock()) {
      debug(`🧪 Mock: Eliminando campaña ID '${fileId}'`)
      await this._delay(800)
      return true
    }

    try {
      debug(`🗑️ Eliminando campaña ID '${fileId}'...`)

      await this._executeRequest(() =>
        window.gapi.client.drive.files.delete({
          fileId: fileId
        })
      )

      debug(`✅ Campaña eliminada de Drive:`, fileId)
      return true
    } catch (error) {
      logError(`❌ Error al eliminar campaña '${fileId}':`, error)
      return false
    }
  }

  /**
   * Sube un archivo a Google Drive (método auxiliar refactorizado)
   * @param {Object} fileMetadata Metadata del archivo
   * @param {Blob} blob Contenido del archivo
   * @returns {Promise} Respuesta de la API
   * @private
   */
  async _uploadFile(fileMetadata, blob) {
    const form = new FormData()
    form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }))
    form.append('file', blob)

    return await this._executeRequest(async () => {
      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleAuth.getAccessToken()}`
        },
        body: form
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      return { result: await response.json() }
    })
  }

  /**
   * Actualiza un archivo existente en Google Drive (método auxiliar refactorizado)
   * @param {string} fileId ID del archivo
   * @param {Blob} blob Nuevo contenido del archivo
   * @returns {Promise} Respuesta de la API
   * @private
   */
  async _updateFile(fileId, blob) {
    return await this._executeRequest(async () => {
      const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${googleAuth.getAccessToken()}`,
          'Content-Type': 'application/json'
        },
        body: blob
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      return { result: await response.json() }
    })
  }

  /**
   * Obtiene información de un archivo específico
   * @param {string} fileId ID del archivo
   * @returns {Promise<Object>} Información del archivo
   */
  async getFileInfo(fileId) {
    if (this._shouldUseMock()) {
      debug(`🧪 Mock: Información de archivo '${fileId}'`)
      await this._delay(500)
      return {
        id: fileId,
        name: 'Campaña Mock.dnd-campaign.json',
        modifiedTime: new Date(),
        size: '2048',
        parents: ['mock-folder-id']
      }
    }

    try {
      debug(`ℹ️ Obteniendo información de archivo '${fileId}'...`)

      const response = await this._executeRequest(() =>
        window.gapi.client.drive.files.get({
          fileId: fileId,
          fields: 'id, name, modifiedTime, size, parents, appProperties'
        })
      )

      const fileInfo = {
        id: response.result.id,
        name: response.result.name,
        modifiedTime: new Date(response.result.modifiedTime),
        size: parseInt(response.result.size) || 0,
        parents: response.result.parents || [],
        appProperties: response.result.appProperties || {}
      }

      debug(`✅ Información de archivo obtenida:`, fileInfo)
      return fileInfo
    } catch (error) {
      logError(`❌ Error al obtener información del archivo '${fileId}':`, error)
      throw error
    }
  }

  /**
   * Limpia la caché (útil para testing o cambio de usuario)
   */
  clearCache() {
    this.folderCache = null
    debug('🧹 Cache limpiado')
  }

  /**
   * Obtiene estadísticas del servicio
   * @returns {Object} Estadísticas de uso
   */
  getStats() {
    return {
      isMockMode: this._shouldUseMock(),
      hasCredentials: syncConfig.hasRealCredentials(),
      folderCached: !!this.folderCache,
      queueSize: this.requestQueue.length,
      isProcessing: this.isProcessingQueue,
      config: {
        folderName: this.config.driveFolderName,
        fileExtension: this.config.fileExtension,
        maxRetries: this.config.maxRetries,
        retryDelay: this.config.retryDelay
      }
    }
  }

  /**
   * Resetea el servicio (útil para testing)
   */
  reset() {
    this.folderCache = null
    this.requestQueue = []
    this.isProcessingQueue = false
    this.mockService.reset()
    debug('🔄 GoogleDriveService reseteado')
  }
}

// Exportar instancia singleton
export const googleDrive = new GoogleDriveService()
export default googleDrive