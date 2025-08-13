/**
 * Servicio simplificado de Google Drive
 * Funcionalidad esencial: conectar, guardar automático, cargar
 */

import { debug, error as logError } from '../utils/logger'

class SimpleGoogleDrive {
  constructor() {
    this.isInitialized = false
    this.isConnected = false
    this.authInstance = null
    this.folderId = null
    
    // Configuración básica
    this.config = {
      apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/drive.file',
      folderName: 'Mi Gestor DnD'
    }

    // Auto-guardado
    this.autoSaveEnabled = false
    this.autoSaveInterval = null
    this.pendingChanges = new Map()
  }

  /**
   * Inicializar y conectar con Google Drive
   */
  async connect() {
    try {
      debug('🔌 Conectando con Google Drive...')
      
      // Verificar credenciales
      if (!this.config.apiKey || !this.config.clientId) {
        throw new Error('Credenciales de Google no configuradas. Verifica tu archivo .env')
      }
      
      // Cargar Google API si no está cargada
      if (!window.gapi) {
        await this.loadGoogleAPI()
      }

      // Inicializar
      await new Promise((resolve, reject) => {
        window.gapi.load('auth2:client', {
          callback: resolve,
          onerror: () => reject(new Error('Error cargando Google API'))
        })
      })

      await window.gapi.client.init({
        apiKey: this.config.apiKey,
        clientId: this.config.clientId,
        scope: this.config.scope,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
      })

      this.authInstance = window.gapi.auth2.getAuthInstance()
      
      // Verificar que authInstance se inicializó correctamente
      if (!this.authInstance) {
        throw new Error('No se pudo inicializar la autenticación de Google')
      }
      
      // Conectar usuario
      if (!this.authInstance.isSignedIn.get()) {
        await this.authInstance.signIn()
      }

      this.isConnected = true
      this.isInitialized = true

      // Crear/encontrar carpeta de la app
      await this.ensureAppFolder()

      // Iniciar auto-guardado
      this.startAutoSave()

      debug('✅ Conectado exitosamente a Google Drive')
      return true

    } catch (error) {
      logError('❌ Error conectando con Google Drive:', error)
      this.isConnected = false
      this.authInstance = null
      throw error
    }
  }

  /**
   * Desconectar de Google Drive
   */
  async disconnect() {
    if (this.authInstance?.isSignedIn.get()) {
      await this.authInstance.signOut()
    }
    
    this.stopAutoSave()
    this.isConnected = false
    this.folderId = null
    
    debug('👋 Desconectado de Google Drive')
  }

  /**
   * Cargar el script de Google API
   */
  async loadGoogleAPI() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://apis.google.com/js/api.js'
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  /**
   * Buscar o crear la carpeta de la aplicación
   */
  async ensureAppFolder() {
    try {
      // Buscar carpeta existente
      const response = await window.gapi.client.drive.files.list({
        q: `name='${this.config.folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)'
      })

      if (response.result.files.length > 0) {
        this.folderId = response.result.files[0].id
        debug(`📁 Carpeta encontrada: ${this.folderId}`)
      } else {
        // Crear carpeta
        const createResponse = await window.gapi.client.drive.files.create({
          resource: {
            name: this.config.folderName,
            mimeType: 'application/vnd.google-apps.folder'
          }
        })
        this.folderId = createResponse.result.id
        debug(`📁 Carpeta creada: ${this.folderId}`)
      }
    } catch (error) {
      logError('❌ Error con carpeta de app:', error)
      throw error
    }
  }

  /**
   * Guardar campaña en Drive
   */
  async saveCampaign(campaignName, campaignData) {
    if (!this.isConnected) {
      throw new Error('No conectado a Google Drive')
    }

    try {
      const fileName = `${campaignName}.json`
      const jsonData = JSON.stringify(campaignData, null, 2)

      // Buscar archivo existente
      const searchResponse = await window.gapi.client.drive.files.list({
        q: `name='${fileName}' and '${this.folderId}' in parents and trashed=false`,
        fields: 'files(id)'
      })

      const fileBlob = new Blob([jsonData], { type: 'application/json' })

      if (searchResponse.result.files.length > 0) {
        // Actualizar archivo existente
        const fileId = searchResponse.result.files[0].id
        await this.updateFile(fileId, fileBlob)
        debug(`💾 Campaña actualizada: ${campaignName}`)
      } else {
        // Crear nuevo archivo
        await this.createFile(fileName, fileBlob)
        debug(`💾 Nueva campaña guardada: ${campaignName}`)
      }

      return true
    } catch (error) {
      logError(`❌ Error guardando campaña ${campaignName}:`, error)
      throw error
    }
  }

  /**
   * Cargar campaña desde Drive
   */
  async loadCampaign(campaignName) {
    if (!this.isConnected) {
      throw new Error('No conectado a Google Drive')
    }

    try {
      const fileName = `${campaignName}.json`

      // Buscar archivo
      const searchResponse = await window.gapi.client.drive.files.list({
        q: `name='${fileName}' and '${this.folderId}' in parents and trashed=false`,
        fields: 'files(id)'
      })

      if (searchResponse.result.files.length === 0) {
        throw new Error(`Campaña "${campaignName}" no encontrada en Drive`)
      }

      // Descargar contenido
      const fileId = searchResponse.result.files[0].id
      const response = await window.gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media'
      })

      const campaignData = JSON.parse(response.body)
      debug(`📥 Campaña cargada: ${campaignName}`)
      return campaignData

    } catch (error) {
      logError(`❌ Error cargando campaña ${campaignName}:`, error)
      throw error
    }
  }

  /**
   * Listar todas las campañas en Drive
   */
  async listCampaigns() {
    if (!this.isConnected) {
      return []
    }

    try {
      const response = await window.gapi.client.drive.files.list({
        q: `'${this.folderId}' in parents and name contains '.json' and trashed=false`,
        fields: 'files(id, name, modifiedTime)',
        orderBy: 'modifiedTime desc'
      })

      const campaigns = response.result.files.map(file => ({
        id: file.id,
        name: file.name.replace('.json', ''),
        lastModified: new Date(file.modifiedTime)
      }))

      debug(`📋 ${campaigns.length} campañas encontradas en Drive`)
      return campaigns

    } catch (error) {
      logError('❌ Error listando campañas:', error)
      return []
    }
  }

  /**
   * Crear archivo en Drive
   */
  async createFile(fileName, blob) {
    const metadata = {
      name: fileName,
      parents: [this.folderId]
    }

    const form = new FormData()
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
    form.append('file', blob)

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.authInstance.currentUser.get().getAuthResponse().access_token}`
      },
      body: form
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  }

  /**
   * Actualizar archivo existente
   */
  async updateFile(fileId, blob) {
    const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${this.authInstance.currentUser.get().getAuthResponse().access_token}`,
        'Content-Type': 'application/json'
      },
      body: blob
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  }

  // ========== AUTO-GUARDADO ==========

  /**
   * Iniciar sistema de auto-guardado
   */
  startAutoSave() {
    this.autoSaveEnabled = true
    this.autoSaveInterval = setInterval(() => {
      this.processAutoSave()
    }, 30000) // Auto-guardar cada 30 segundos
    debug('🔄 Auto-guardado iniciado')
  }

  /**
   * Detener auto-guardado
   */
  stopAutoSave() {
    this.autoSaveEnabled = false
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
      this.autoSaveInterval = null
    }
    debug('⏹️ Auto-guardado detenido')
  }

  /**
   * Marcar campaña para auto-guardado
   */
  markForAutoSave(campaignName, campaignData) {
    if (this.autoSaveEnabled) {
      this.pendingChanges.set(campaignName, {
        data: campaignData,
        timestamp: Date.now()
      })
      debug(`📝 Marcado para auto-guardado: ${campaignName}`)
    }
  }

  /**
   * Procesar cambios pendientes de auto-guardado
   */
  async processAutoSave() {
    if (!this.isConnected || this.pendingChanges.size === 0) {
      return
    }

    debug(`🔄 Procesando ${this.pendingChanges.size} cambios pendientes...`)

    for (const [campaignName, change] of this.pendingChanges) {
      try {
        await this.saveCampaign(campaignName, change.data)
        this.pendingChanges.delete(campaignName)
        debug(`✅ Auto-guardado: ${campaignName}`)
      } catch (error) {
        logError(`❌ Error en auto-guardado de ${campaignName}:`, error)
        // Mantener el cambio para reintentar después
      }
    }
  }

  /**
   * Verificar estado de conexión
   */
  getStatus() {
    let userName = null
    
    if (this.isConnected && this.authInstance) {
      try {
        const currentUser = this.authInstance.currentUser.get()
        if (currentUser) {
          const profile = currentUser.getBasicProfile()
          userName = profile ? profile.getName() : null
        }
      } catch (error) {
        logError('Error obteniendo nombre de usuario:', error)
      }
    }
    
    return {
      connected: this.isConnected,
      autoSaveEnabled: this.autoSaveEnabled,
      pendingChanges: this.pendingChanges.size,
      user: userName
    }
  }
}

// Instancia singleton
export const simpleGoogleDrive = new SimpleGoogleDrive()
export default simpleGoogleDrive