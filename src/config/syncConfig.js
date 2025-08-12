/**
 * Configuración centralizada para Google Drive Sync
 * Maneja variables de entorno, validación y configuración por defecto
 */

import { debug, error as logError, warn } from '../utils/logger'

class SyncConfig {
  constructor() {
    this.config = {
      // Credenciales de Google API
      clientId: this.getEnvVar('VITE_GOOGLE_CLIENT_ID'),
      apiKey: this.getEnvVar('VITE_GOOGLE_API_KEY'),
      
      // Configuración de la aplicación
      appName: this.getEnvVar('VITE_APP_NAME', 'Mi Gestor DnD'),
      debugMode: this.getBooleanEnvVar('VITE_DEBUG', false),
      
      // Configuración de Google Drive
      driveFolderName: this.getEnvVar('VITE_DRIVE_FOLDER_NAME', 'Mi Gestor DnD'),
      autoSyncInterval: this.getNumberEnvVar('VITE_AUTO_SYNC_INTERVAL', 5) * 60 * 1000, // Convertir a ms
      
      // Configuración de desarrollo
      enableMockSync: this.getBooleanEnvVar('VITE_ENABLE_MOCK_SYNC', false),
      devUrl: this.getEnvVar('VITE_DEV_URL', 'http://localhost:4000'),
      
      // Configuración técnica
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
      scopes: 'https://www.googleapis.com/auth/drive.file',
      fileExtension: '.dnd-campaign.json',
      
      // Configuración de timeouts y reintentos
      requestTimeout: 30000, // 30 segundos
      maxRetries: 3,
      retryDelay: 1000, // 1 segundo
    }
    
    this.isValid = this.validateConfig()
    this.logConfigStatus()
  }

  /**
   * Obtiene una variable de entorno con valor por defecto
   */
  getEnvVar(key, defaultValue = '') {
    if (typeof window !== 'undefined' && window.import?.meta?.env) {
      return window.import.meta.env[key] || defaultValue
    }
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || defaultValue
    }
    return defaultValue
  }

  /**
   * Obtiene una variable de entorno como booleano
   */
  getBooleanEnvVar(key, defaultValue = false) {
    const value = this.getEnvVar(key, defaultValue.toString())
    return value === 'true' || value === true
  }

  /**
   * Obtiene una variable de entorno como número
   */
  getNumberEnvVar(key, defaultValue = 0) {
    const value = this.getEnvVar(key, defaultValue.toString())
    const parsed = parseInt(value, 10)
    return isNaN(parsed) ? defaultValue : parsed
  }

  /**
   * Valida que la configuración sea correcta
   */
  validateConfig() {
    const errors = []
    
    // Validar credenciales obligatorias
    if (!this.config.clientId) {
      errors.push('VITE_GOOGLE_CLIENT_ID no está configurado')
    } else if (!this.isValidClientId(this.config.clientId)) {
      errors.push('VITE_GOOGLE_CLIENT_ID no tiene formato válido')
    }
    
    if (!this.config.apiKey) {
      errors.push('VITE_GOOGLE_API_KEY no está configurado')
    } else if (!this.isValidApiKey(this.config.apiKey)) {
      errors.push('VITE_GOOGLE_API_KEY no tiene formato válido')
    }
    
    // Validar configuración numérica
    if (this.config.autoSyncInterval < 30000) { // Mínimo 30 segundos
      warn('Intervalo de auto-sync muy bajo, ajustando a 30 segundos')
      this.config.autoSyncInterval = 30000
    }
    
    if (this.config.maxRetries < 1 || this.config.maxRetries > 10) {
      warn('Número de reintentos inválido, ajustando a 3')
      this.config.maxRetries = 3
    }
    
    // Si hay errores pero el modo mock está habilitado, solo advertir
    if (errors.length > 0) {
      if (this.config.enableMockSync) {
        warn('Credenciales no configuradas, pero modo mock habilitado:', errors)
        return 'mock' // Estado especial para modo mock
      } else {
        logError('Errores de configuración de Google Drive:', errors)
        return false
      }
    }
    
    return true
  }

  /**
   * Valida formato de Client ID de Google
   */
  isValidClientId(clientId) {
    // Formato: xxxxxx-xxxxxxxx.apps.googleusercontent.com
    const pattern = /^\d+-[a-zA-Z0-9]+\.apps\.googleusercontent\.com$/
    return pattern.test(clientId)
  }

  /**
   * Valida formato de API Key de Google
   */
  isValidApiKey(apiKey) {
    // Formato: AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    const pattern = /^AIza[0-9A-Za-z-_]{35}$/
    return pattern.test(apiKey)
  }

  /**
   * Verifica si Google Drive sync está disponible
   */
  isSyncAvailable() {
    return this.isValid === true || this.isValid === 'mock'
  }

  /**
   * Verifica si está en modo mock
   */
  isMockMode() {
    return this.isValid === 'mock' && this.config.enableMockSync
  }

  /**
   * Verifica si las credenciales reales están configuradas
   */
  hasRealCredentials() {
    return this.isValid === true
  }

  /**
   * Obtiene configuración para Google API
   */
  getGoogleApiConfig() {
    return {
      apiKey: this.config.apiKey,
      clientId: this.config.clientId,
      discoveryDocs: this.config.discoveryDocs,
      scope: this.config.scopes
    }
  }

  /**
   * Log del estado de configuración
   */
  logConfigStatus() {
    if (this.config.debugMode) {
      debug('🔧 Configuración de Google Drive Sync:', {
        isValid: this.isValid,
        isMockMode: this.isMockMode(),
        hasRealCredentials: this.hasRealCredentials(),
        appName: this.config.appName,
        driveFolderName: this.config.driveFolderName,
        autoSyncInterval: `${this.config.autoSyncInterval / 1000}s`,
        enableMockSync: this.config.enableMockSync
      })
    }
    
    if (this.isMockMode()) {
      warn('🧪 Google Drive Sync en modo MOCK - funcionalidad simulada')
    } else if (!this.hasRealCredentials()) {
      warn('⚠️ Google Drive Sync no disponible - credenciales no configuradas')
    } else {
      debug('✅ Google Drive Sync configurado correctamente')
    }
  }

  /**
   * Obtiene todas las configuraciones
   */
  getAll() {
    return { ...this.config }
  }

  /**
   * Obtiene una configuración específica
   */
  get(key) {
    return this.config[key]
  }
}

// Exportar instancia singleton
export const syncConfig = new SyncConfig()
export default syncConfig