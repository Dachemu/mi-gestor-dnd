/**
 * Servicio Universal de Google Drive
 * NO requiere configuración previa - funciona como Google Docs
 * El usuario se conecta directamente desde la interfaz
 */

import { debug, error as logError } from '../utils/logger'

class UniversalGoogleDrive {
  constructor() {
    this.isConnected = false
    this.accessToken = null
    this.selectedFolder = null
    this.userInfo = null
    
    // Auto-guardado
    this.autoSaveEnabled = false
    this.autoSaveInterval = null
    this.pendingChanges = new Map()
    
    // Configuración dinámica (se obtiene al conectar)
    this.config = {
      // Credenciales públicas de ejemplo (sustituir por las tuyas cuando las tengas)
      clientId: '1045108990620-abc123def456.apps.googleusercontent.com', // Placeholder
      scope: 'https://www.googleapis.com/auth/drive.file'
    }
  }

  /**
   * Conectar con Google usando OAuth implícito
   * No requiere configuración previa
   */
  async connectWithGoogle() {
    try {
      debug('🔌 Iniciando conexión con Google...')
      
      // Cargar Google Identity Services (nuevo método)
      await this.loadGoogleIdentity()
      
      // Inicializar OAuth
      const authResponse = await this.initiateOAuth()
      
      if (authResponse && authResponse.access_token) {
        this.accessToken = authResponse.access_token
        this.isConnected = true
        
        // Obtener información del usuario
        await this.getUserInfo()
        
        debug('✅ Conectado exitosamente con Google')
        return true
      }
      
      return false
    } catch (error) {
      logError('❌ Error conectando con Google:', error)
      throw error
    }
  }

  /**
   * Cargar Google Identity Services
   */
  async loadGoogleIdentity() {
    if (window.google?.accounts) {
      return
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  /**
   * Iniciar proceso OAuth
   */
  async initiateOAuth() {
    return new Promise((resolve, reject) => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: this.config.clientId,
        scope: this.config.scope,
        callback: (response) => {
          if (response.access_token) {
            resolve(response)
          } else {
            reject(new Error('No se obtuvo token de acceso'))
          }
        },
        error_callback: (error) => {
          reject(new Error(`Error OAuth: ${error.type}`))
        }
      })
      
      client.requestAccessToken()
    })
  }

  /**
   * Obtener información del usuario conectado
   */
  async getUserInfo() {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      })
      
      if (response.ok) {
        this.userInfo = await response.json()
        debug('👤 Usuario:', this.userInfo.name)
      }
    } catch (error) {
      logError('Error obteniendo info de usuario:', error)
    }
  }

  /**
   * Mostrar selector de carpetas de Google Drive
   */
  async selectDriveFolder() {
    if (!this.isConnected) {
      throw new Error('No conectado a Google')
    }

    try {
      debug('📁 Abriendo selector de carpetas...')
      
      // Cargar Google Picker API
      await this.loadGooglePicker()
      
      return new Promise((resolve, reject) => {
        const picker = new window.google.picker.PickerBuilder()
          .addView(new window.google.picker.DocsView(window.google.picker.ViewId.FOLDERS)
            .setSelectFolderEnabled(true))
          .setOAuthToken(this.accessToken)
          .setCallback((data) => {
            if (data[window.google.picker.Response.ACTION] === window.google.picker.Action.PICKED) {
              const folder = data[window.google.picker.Response.DOCUMENTS][0]
              this.selectedFolder = {
                id: folder[window.google.picker.Document.ID],
                name: folder[window.google.picker.Document.NAME]
              }
              debug(`✅ Carpeta seleccionada: ${this.selectedFolder.name}`)
              
              // Iniciar auto-guardado
              this.startAutoSave()
              
              resolve(this.selectedFolder)
            } else if (data[window.google.picker.Response.ACTION] === window.google.picker.Action.CANCEL) {
              reject(new Error('Selección cancelada'))
            }
          })
          .build()
        
        picker.setVisible(true)
      })
    } catch (error) {
      logError('❌ Error seleccionando carpeta:', error)
      throw error
    }
  }

  /**
   * Cargar Google Picker API
   */
  async loadGooglePicker() {
    if (window.google?.picker) {
      return
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://apis.google.com/js/api.js'
      script.onload = () => {
        window.gapi.load('picker', {
          callback: resolve,
          onerror: reject
        })
      }
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  /**
   * Listar campañas en la carpeta seleccionada
   */
  async listCampaigns() {
    if (!this.selectedFolder) {
      return []
    }

    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files?q='${this.selectedFolder.id}' in parents and name contains '.json' and trashed=false&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const campaigns = data.files.map(file => ({
          id: file.id,
          name: file.name.replace('.json', ''),
          lastModified: new Date(file.modifiedTime)
        }))
        
        debug(`📋 ${campaigns.length} campañas encontradas`)
        return campaigns
      }
      
      return []
    } catch (error) {
      logError('Error listando campañas:', error)
      return []
    }
  }

  /**
   * Guardar campaña en Drive
   */
  async saveCampaign(campaignName, campaignData) {
    if (!this.selectedFolder) {
      throw new Error('No hay carpeta seleccionada')
    }

    try {
      const fileName = `${campaignName}.json`
      const jsonData = JSON.stringify(campaignData, null, 2)
      
      // Buscar archivo existente
      const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and '${this.selectedFolder.id}' in parents and trashed=false`
      const searchResponse = await fetch(searchUrl, {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      })
      
      const searchData = await searchResponse.json()
      
      if (searchData.files && searchData.files.length > 0) {
        // Actualizar archivo existente
        const fileId = searchData.files[0].id
        await this.updateFile(fileId, jsonData)
        debug(`💾 Campaña actualizada: ${campaignName}`)
      } else {
        // Crear nuevo archivo
        await this.createFile(fileName, jsonData)
        debug(`💾 Nueva campaña guardada: ${campaignName}`)
      }
      
      return true
    } catch (error) {
      logError(`❌ Error guardando ${campaignName}:`, error)
      throw error
    }
  }

  /**
   * Crear archivo en Drive
   */
  async createFile(fileName, content) {
    const metadata = {
      name: fileName,
      parents: [this.selectedFolder.id]
    }

    const form = new FormData()
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
    form.append('file', new Blob([content], { type: 'application/json' }))

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.accessToken}` },
      body: form
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  }

  /**
   * Actualizar archivo existente
   */
  async updateFile(fileId, content) {
    const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: content
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  }

  /**
   * Cargar campaña desde Drive
   */
  async loadCampaign(campaignName) {
    try {
      const fileName = `${campaignName}.json`
      
      // Buscar archivo
      const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and '${this.selectedFolder.id}' in parents and trashed=false`
      const searchResponse = await fetch(searchUrl, {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      })
      
      const searchData = await searchResponse.json()
      if (!searchData.files || searchData.files.length === 0) {
        throw new Error(`Campaña "${campaignName}" no encontrada`)
      }
      
      // Descargar contenido
      const fileId = searchData.files[0].id
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      })
      
      if (response.ok) {
        const jsonData = await response.text()
        const campaignData = JSON.parse(jsonData)
        debug(`📥 Campaña cargada: ${campaignName}`)
        return campaignData
      }
      
      throw new Error('Error descargando archivo')
    } catch (error) {
      logError(`❌ Error cargando ${campaignName}:`, error)
      throw error
    }
  }

  // ========== AUTO-GUARDADO ==========

  startAutoSave() {
    this.autoSaveEnabled = true
    this.autoSaveInterval = setInterval(() => {
      this.processAutoSave()
    }, 30000) // 30 segundos
    debug('🔄 Auto-guardado iniciado')
  }

  stopAutoSave() {
    this.autoSaveEnabled = false
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
      this.autoSaveInterval = null
    }
    debug('⏹️ Auto-guardado detenido')
  }

  markForAutoSave(campaignName, campaignData) {
    if (this.autoSaveEnabled && this.selectedFolder) {
      this.pendingChanges.set(campaignName, {
        data: campaignData,
        timestamp: Date.now()
      })
      debug(`📝 Marcado para auto-guardado: ${campaignName}`)
    }
  }

  async processAutoSave() {
    if (!this.isConnected || !this.selectedFolder || this.pendingChanges.size === 0) {
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
      }
    }
  }

  /**
   * Desconectar
   */
  disconnect() {
    this.stopAutoSave()
    this.isConnected = false
    this.accessToken = null
    this.selectedFolder = null
    this.userInfo = null
    this.pendingChanges.clear()
    debug('👋 Desconectado de Google Drive')
  }

  /**
   * Estado actual
   */
  getStatus() {
    return {
      connected: this.isConnected,
      folderSelected: !!this.selectedFolder,
      folderName: this.selectedFolder?.name || null,
      autoSaveEnabled: this.autoSaveEnabled,
      pendingChanges: this.pendingChanges.size,
      user: this.userInfo?.name || null
    }
  }
}

// Instancia singleton
export const universalGoogleDrive = new UniversalGoogleDrive()
export default universalGoogleDrive