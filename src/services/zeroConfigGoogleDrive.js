/**
 * Google Drive con CERO configuración
 * Usa credenciales públicas de desarrollo - funciona inmediatamente
 */

import { debug, error as logError } from '../utils/logger'

class ZeroConfigGoogleDrive {
  constructor() {
    this.isConnected = false
    this.accessToken = null
    this.selectedFolder = null
    this.userInfo = null
    
    // Auto-guardado
    this.autoSaveEnabled = false
    this.autoSaveInterval = null
    this.pendingChanges = new Map()
    
    // TUS CREDENCIALES DE GOOGLE DRIVE
    this.config = {
      // Tu Client ID personal de Google Cloud Console
      clientId: '683709048927-3ddtv1b059ir0tupu0aqmdep6c949pd6.apps.googleusercontent.com',
      // Scope para acceder a archivos de Drive que la app crea/modifica
      scope: 'https://www.googleapis.com/auth/drive.file'
    }
  }

  /**
   * ¡CONECTAR CON UN SOLO CLICK!
   * Sin configuración, sin archivos .env, sin nada
   */
  async connect() {
    try {
      debug('🚀 Conectando con Google Drive (zero config)...')
      
      // Paso 1: Cargar Google Identity
      await this.loadGoogleAPI()
      
      // Paso 2: Autenticación OAuth
      const authResult = await this.authenticate()
      
      if (authResult) {
        this.accessToken = authResult.access_token
        this.isConnected = true
        
        // Paso 3: Obtener info del usuario
        await this.fetchUserInfo()
        
        debug('✅ ¡Conectado exitosamente!')
        return true
      }
      
      return false
    } catch (error) {
      logError('❌ Error conectando:', error)
      return false
    }
  }

  /**
   * Cargar APIs de Google
   */
  async loadGoogleAPI() {
    // Cargar Google Identity Services
    if (!window.google?.accounts) {
      await this.loadScript('https://accounts.google.com/gsi/client')
    }
    
    // Cargar Google API para Drive
    if (!window.gapi) {
      await this.loadScript('https://apis.google.com/js/api.js')
      await new Promise((resolve) => {
        window.gapi.load('client', resolve)
      })
    }
  }

  /**
   * Utilidad para cargar scripts
   */
  loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve()
        return
      }
      
      const script = document.createElement('script')
      script.src = src
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  /**
   * Autenticación con popup de Google mejorado
   */
  authenticate() {
    return new Promise((resolve, reject) => {
      // Configurar ventana popup centrada
      const popupWidth = 520
      const popupHeight = 650
      const screenWidth = window.screen.availWidth || window.screen.width
      const screenHeight = window.screen.availHeight || window.screen.height
      const screenLeft = window.screen.availLeft || window.screenLeft || 0
      const screenTop = window.screen.availTop || window.screenTop || 0
      
      const left = Math.round(screenLeft + (screenWidth - popupWidth) / 2)
      const top = Math.round(screenTop + (screenHeight - popupHeight) / 2)
      
      // Debug para verificar cálculos
      debug('Popup centering:', {
        screenWidth, screenHeight, screenLeft, screenTop,
        popupWidth, popupHeight, left, top
      })
      
      // Configuración del popup
      const popupFeatures = [
        `width=${popupWidth}`,
        `height=${popupHeight}`,
        `left=${left}`,
        `top=${top}`,
        'resizable=yes',
        'scrollbars=yes',
        'status=no',
        'toolbar=no',
        'menubar=no',
        'location=no',
        'directories=no',
        'titlebar=yes',
        'copyhistory=no'
      ].join(',')

      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: this.config.clientId,
        scope: this.config.scope,
        callback: (response) => {
          if (response.access_token) {
            resolve(response)
          } else {
            reject(new Error('No se obtuvo token'))
          }
        },
        error_callback: (error) => {
          reject(new Error(`Error: ${error.type}`))
        }
      })
      
      // Interceptar la creación del popup para centrarlo
      const originalWindowOpen = window.open
      window.open = function(url, name, features) {
        if (url && url.includes('accounts.google.com')) {
          return originalWindowOpen.call(this, url, name, popupFeatures)
        }
        return originalWindowOpen.call(this, url, name, features)
      }
      
      // Abrir popup de autenticación
      try {
        tokenClient.requestAccessToken({
          prompt: 'consent'
        })
      } finally {
        // Restaurar window.open original después de un momento
        setTimeout(() => {
          window.open = originalWindowOpen
        }, 1000)
      }
    })
  }

  /**
   * Obtener información del usuario
   */
  async fetchUserInfo() {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      })
      
      if (response.ok) {
        this.userInfo = await response.json()
        debug(`👤 Usuario conectado: ${this.userInfo.name}`)
      }
    } catch (error) {
      logError('Error obteniendo usuario:', error)
    }
  }

  /**
   * ¡SELECTOR VISUAL DE CARPETAS!
   * Permite elegir cualquier carpeta de Google Drive
   */
  async selectFolder(useCustomPath = false) {
    if (!this.isConnected) {
      throw new Error('Primero conecta con Google')
    }

    try {
      debug('📁 Abriendo selector de carpetas...')
      
      if (useCustomPath) {
        // Mostrar picker visual para seleccionar carpeta
        return await this.showFolderPicker()
      } else {
        // Crear carpeta automática por defecto
        const appFolder = await this.createAppFolder()
        if (appFolder) {
          this.selectedFolder = appFolder
          this.startAutoSave()
          return appFolder
        }
      }
      
    } catch (error) {
      logError('Error seleccionando carpeta:', error)
      throw error
    }
  }

  /**
   * Crear carpeta automática de la app
   */
  async createAppFolder() {
    try {
      const folderName = 'Mi Gestor DnD'
      
      // Buscar si ya existe
      const searchResponse = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`, {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      })
      
      const searchData = await searchResponse.json()
      
      if (searchData.files && searchData.files.length > 0) {
        // Ya existe
        const folder = searchData.files[0]
        debug(`📁 Carpeta encontrada: ${folder.name}`)
        return { id: folder.id, name: folder.name }
      }
      
      // Crear nueva carpeta
      const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder'
        })
      })
      
      if (createResponse.ok) {
        const folder = await createResponse.json()
        debug(`📁 Carpeta creada: ${folder.name}`)
        return { id: folder.id, name: folder.name }
      }
      
      return null
    } catch (error) {
      logError('Error creando carpeta:', error)
      return null
    }
  }

  /**
   * Mostrar picker mejorado para seleccionar carpeta
   */
  async showFolderPicker() {
    try {
      // Cargar Google Picker API
      await this.loadGooglePicker()
      
      return new Promise((resolve, reject) => {
        // Configurar tamaño del picker
        const pickerWidth = 750
        const pickerHeight = 600
        
        // Crear vista de carpetas filtrada
        const folderView = new window.google.picker.DocsView(window.google.picker.ViewId.FOLDERS)
          .setSelectFolderEnabled(true)
          .setIncludeFolders(true)
          .setOwnedByMe(true) // Solo carpetas propias
          .setParent('root') // Empezar desde raíz
        
        const picker = new window.google.picker.PickerBuilder()
          .enableFeature(window.google.picker.Feature.SUPPORT_DRIVES)
          .enableFeature(window.google.picker.Feature.SIMPLE_UPLOAD_ENABLED)
          .setAppId('683709048927')
          .setOAuthToken(this.accessToken)
          .setSize(pickerWidth, pickerHeight)
          .setTitle('Seleccionar carpeta para Mi Gestor D&D')
          .addView(folderView)
          .setCallback(async (data) => {
            if (data[window.google.picker.Response.ACTION] === window.google.picker.Action.PICKED) {
              const folder = data[window.google.picker.Response.DOCUMENTS][0]
              const selectedFolder = {
                id: folder[window.google.picker.Document.ID],
                name: folder[window.google.picker.Document.NAME]
              }
              
              // Preguntar si quiere usar esta carpeta o crear una nueva dentro
              const useExisting = await this.showFolderConfirmation(selectedFolder)
              
              if (useExisting === 'use') {
                this.selectedFolder = selectedFolder
                this.startAutoSave()
                debug(`✅ Carpeta existente seleccionada: ${selectedFolder.name}`)
                resolve(selectedFolder)
              } else if (useExisting === 'create') {
                // Crear subcarpeta "Mi Gestor DnD" dentro de la seleccionada
                const newFolder = await this.createSubfolder(selectedFolder.id, 'Mi Gestor DnD')
                this.selectedFolder = newFolder
                this.startAutoSave()
                debug(`✅ Nueva carpeta creada: ${newFolder.name}`)
                resolve(newFolder)
              } else {
                reject(new Error('Selección cancelada por el usuario'))
              }
            } else if (data[window.google.picker.Response.ACTION] === window.google.picker.Action.CANCEL) {
              reject(new Error('Selección cancelada por el usuario'))
            }
          })
          .build()
        
        // Aplicar estilos personalizados al picker
        this.customizePickerStyles()
        
        // Mostrar y centrar el picker
        picker.setVisible(true)
        
        // Centrar después del renderizado
        setTimeout(() => {
          this.centerPicker(pickerWidth, pickerHeight)
        }, 300)
      })
    } catch (error) {
      logError('Error mostrando picker de carpetas:', error)
      throw error
    }
  }

  /**
   * Mostrar confirmación de carpeta
   */
  async showFolderConfirmation(folder) {
    return new Promise((resolve) => {
      const modal = document.createElement('div')
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      `
      
      modal.innerHTML = `
        <div style="
          background: white;
          border-radius: 12px;
          padding: 24px;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        ">
          <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px;">
            📁 Carpeta seleccionada: "${folder.name}"
          </h3>
          <p style="margin: 0 0 24px 0; color: #6b7280; line-height: 1.5;">
            ¿Qué quieres hacer?
          </p>
          <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button id="cancelBtn" style="
              padding: 8px 16px;
              border: 1px solid #d1d5db;
              background: white;
              border-radius: 8px;
              cursor: pointer;
              font-size: 14px;
            ">Cancelar</button>
            <button id="useBtn" style="
              padding: 8px 16px;
              border: none;
              background: #3b82f6;
              color: white;
              border-radius: 8px;
              cursor: pointer;
              font-size: 14px;
            ">Usar esta carpeta</button>
            <button id="createBtn" style="
              padding: 8px 16px;
              border: none;
              background: #10b981;
              color: white;
              border-radius: 8px;
              cursor: pointer;
              font-size: 14px;
            ">Crear "Mi Gestor DnD" aquí</button>
          </div>
        </div>
      `
      
      document.body.appendChild(modal)
      
      modal.querySelector('#cancelBtn').onclick = () => {
        document.body.removeChild(modal)
        resolve('cancel')
      }
      
      modal.querySelector('#useBtn').onclick = () => {
        document.body.removeChild(modal)
        resolve('use')
      }
      
      modal.querySelector('#createBtn').onclick = () => {
        document.body.removeChild(modal)
        resolve('create')
      }
      
      modal.onclick = (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal)
          resolve('cancel')
        }
      }
    })
  }

  /**
   * Crear subcarpeta dentro de una carpeta existente
   */
  async createSubfolder(parentId, folderName) {
    try {
      const response = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentId]
        })
      })
      
      if (response.ok) {
        const folder = await response.json()
        return { id: folder.id, name: folder.name }
      }
      
      throw new Error('Error creando subcarpeta')
    } catch (error) {
      logError('Error creando subcarpeta:', error)
      throw error
    }
  }

  /**
   * Personalizar estilos del picker
   */
  customizePickerStyles() {
    const style = document.createElement('style')
    style.textContent = `
      .picker-dialog {
        border-radius: 12px !important;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3) !important;
      }
      .picker-dialog-content {
        border-radius: 12px !important;
      }
      .goog-toolbar {
        background: #f8fafc !important;
        border-radius: 12px 12px 0 0 !important;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * Centrar picker en pantalla
   */
  centerPicker(width, height) {
    try {
      const pickerDialog = document.querySelector('.picker-dialog')
      if (pickerDialog) {
        const screenWidth = window.innerWidth
        const screenHeight = window.innerHeight
        const left = (screenWidth - width) / 2
        const top = (screenHeight - height) / 2
        
        pickerDialog.style.left = `${left}px`
        pickerDialog.style.top = `${top}px`
        pickerDialog.style.position = 'fixed'
      }
    } catch (e) {
      debug('No se pudo centrar el picker:', e.message)
    }
  }

  /**
   * Cargar Google Picker API
   */
  async loadGooglePicker() {
    if (window.google?.picker) {
      return
    }

    // Cargar Google API si no está cargado
    if (!window.gapi) {
      await this.loadScript('https://apis.google.com/js/api.js')
    }

    return new Promise((resolve, reject) => {
      window.gapi.load('picker', {
        callback: resolve,
        onerror: reject
      })
    })
  }

  /**
   * Guardar campaña automáticamente
   */
  async saveCampaign(campaignName, campaignData) {
    if (!this.selectedFolder) {
      throw new Error('No hay carpeta seleccionada')
    }

    try {
      const fileName = `${campaignName}.json`
      const content = JSON.stringify(campaignData, null, 2)
      
      // Buscar si ya existe
      const searchResponse = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and '${this.selectedFolder.id}' in parents and trashed=false`, {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      })
      
      const searchData = await searchResponse.json()
      
      if (searchData.files && searchData.files.length > 0) {
        // Actualizar existente
        const fileId = searchData.files[0].id
        await this.updateFile(fileId, content)
        debug(`💾 ${campaignName} actualizada`)
      } else {
        // Crear nueva
        await this.createFile(fileName, content)
        debug(`💾 ${campaignName} creada`)
      }
      
      return true
    } catch (error) {
      logError(`Error guardando ${campaignName}:`, error)
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

    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`)
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

    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`)
    return response.json()
  }

  /**
   * Listar campañas existentes
   */
  async listCampaigns() {
    if (!this.selectedFolder) return []

    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files?q='${this.selectedFolder.id}' in parents and name contains '.json' and trashed=false&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc`, {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      })

      if (response.ok) {
        const data = await response.json()
        return data.files.map(file => ({
          id: file.id,
          name: file.name.replace('.json', ''),
          lastModified: new Date(file.modifiedTime)
        }))
      }
      
      return []
    } catch (error) {
      logError('Error listando campañas:', error)
      return []
    }
  }

  /**
   * Cargar campaña desde Drive
   */
  async loadCampaign(campaignName) {
    try {
      const fileName = `${campaignName}.json`
      
      const searchResponse = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and '${this.selectedFolder.id}' in parents and trashed=false`, {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      })
      
      const searchData = await searchResponse.json()
      if (!searchData.files || searchData.files.length === 0) {
        throw new Error(`Campaña "${campaignName}" no encontrada`)
      }
      
      const fileId = searchData.files[0].id
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      })
      
      if (response.ok) {
        const jsonData = await response.text()
        return JSON.parse(jsonData)
      }
      
      throw new Error('Error descargando archivo')
    } catch (error) {
      logError(`Error cargando ${campaignName}:`, error)
      throw error
    }
  }

  // ========== AUTO-GUARDADO ==========

  startAutoSave() {
    this.autoSaveEnabled = true
    this.autoSaveInterval = setInterval(() => {
      this.processAutoSave()
    }, 30000)
    debug('🔄 Auto-guardado iniciado')
  }

  stopAutoSave() {
    this.autoSaveEnabled = false
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
    }
    debug('⏹️ Auto-guardado detenido')
  }

  markForAutoSave(campaignName, campaignData) {
    if (this.autoSaveEnabled && this.selectedFolder) {
      this.pendingChanges.set(campaignName, {
        data: campaignData,
        timestamp: Date.now()
      })
    }
  }

  async processAutoSave() {
    if (this.pendingChanges.size === 0) return

    for (const [campaignName, change] of this.pendingChanges) {
      try {
        await this.saveCampaign(campaignName, change.data)
        this.pendingChanges.delete(campaignName)
      } catch (error) {
        logError(`Error auto-guardando ${campaignName}:`, error)
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
    debug('👋 Desconectado')
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
export const zeroConfigGoogleDrive = new ZeroConfigGoogleDrive()
export default zeroConfigGoogleDrive