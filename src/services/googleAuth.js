/**
 * Servicio de autenticación con Google Drive - Versión Mejorada
 * Maneja OAuth y tokens de acceso con configuración centralizada y manejo de errores robusto
 */

import { debug, error as logError, warn } from '../utils/logger'
import syncConfig from '../config/syncConfig'

class GoogleAuthService {
  constructor() {
    this.gapi = null
    this.authInstance = null
    this.isInitialized = false
    this.initializationPromise = null
    this.config = syncConfig.getGoogleApiConfig()
    
    // Estados de inicialización
    this.initState = {
      scriptLoaded: false,
      gapiInitialized: false,
      authInitialized: false,
      error: null
    }
    
    // Callbacks para cambios de estado
    this.authStateCallbacks = []
  }

  /**
   * Inicializa la API de Google con manejo de errores mejorado
   * @returns {Promise<boolean>} true si se inicializó correctamente
   */
  async init() {
    // Si ya está inicializado, devolver true
    if (this.isInitialized) return true
    
    // Si ya hay una inicialización en curso, esperar a que termine
    if (this.initializationPromise) {
      return await this.initializationPromise
    }

    // Verificar configuración antes de inicializar
    if (!syncConfig.hasRealCredentials()) {
      if (syncConfig.isMockMode()) {
        debug('Google Auth en modo mock - inicialización simulada')
        this.isInitialized = true
        return true
      } else {
        warn('Google Auth: credenciales no configuradas')
        this.initState.error = 'Credenciales no configuradas'
        return false
      }
    }

    // Crear promesa de inicialización para evitar múltiples intentos simultáneos
    this.initializationPromise = this._performInit()
    
    try {
      const result = await this.initializationPromise
      return result
    } finally {
      this.initializationPromise = null
    }
  }

  /**
   * Realiza la inicialización real de Google API
   * @private
   */
  async _performInit() {
    try {
      debug('🚀 Iniciando Google API...')
      
      // Paso 1: Cargar script de Google API
      await this._loadGoogleAPIScript()
      this.initState.scriptLoaded = true
      
      // Paso 2: Inicializar GAPI
      await this._initializeGAPI()
      this.initState.gapiInitialized = true
      
      // Paso 3: Inicializar autenticación
      await this._initializeAuth()
      this.initState.authInitialized = true
      
      this.isInitialized = true
      debug('✅ Google API inicializada correctamente')
      return true
      
    } catch (error) {
      this.initState.error = error.message
      logError('❌ Error al inicializar Google API:', error)
      return false
    }
  }

  /**
   * Carga el script de Google API
   * @private
   */
  async _loadGoogleAPIScript() {
    if (window.gapi) {
      this.gapi = window.gapi
      return
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://apis.google.com/js/api.js'
      script.async = true
      script.defer = true
      
      script.onload = () => {
        this.gapi = window.gapi
        debug('📄 Google API script cargado')
        resolve()
      }
      
      script.onerror = () => {
        reject(new Error('Error al cargar Google API script'))
      }
      
      document.head.appendChild(script)
    })
  }

  /**
   * Inicializa GAPI
   * @private
   */
  async _initializeGAPI() {
    return new Promise((resolve, reject) => {
      this.gapi.load('auth2:client', {
        callback: resolve,
        onerror: () => reject(new Error('Error al cargar módulos de GAPI'))
      })
    })
  }

  /**
   * Inicializa la autenticación
   * @private
   */
  async _initializeAuth() {
    await this.gapi.client.init(this.config)
    this.authInstance = this.gapi.auth2.getAuthInstance()
    
    // Configurar listener para cambios de estado de autenticación
    this.authInstance.isSignedIn.listen((isSignedIn) => {
      this._notifyAuthStateChange(isSignedIn)
    })
    
    debug('🔐 Autenticación inicializada')
  }

  /**
   * Notifica cambios de estado de autenticación
   * @private
   */
  _notifyAuthStateChange(isSignedIn) {
    debug('🔄 Cambio de estado de autenticación:', isSignedIn)
    this.authStateCallbacks.forEach(callback => {
      try {
        callback(isSignedIn)
      } catch (error) {
        logError('Error en callback de estado de autenticación:', error)
      }
    })
  }

  /**
   * Verifica si el usuario está autenticado
   * @returns {boolean}
   */
  isSignedIn() {
    if (syncConfig.isMockMode()) {
      return true // En modo mock siempre está "conectado"
    }
    
    if (!this.authInstance) return false
    return this.authInstance.isSignedIn.get()
  }

  /**
   * Verifica si el servicio está listo para usar
   * @returns {boolean}
   */
  isReady() {
    if (syncConfig.isMockMode()) return true
    return this.isInitialized && this.authInstance !== null
  }

  /**
   * Obtiene la información del usuario actual
   * @returns {Object|null} Información del usuario o null si no está autenticado
   */
  getCurrentUser() {
    if (syncConfig.isMockMode()) {
      return {
        id: 'mock-user-id',
        name: 'Usuario de Prueba',
        email: 'test@ejemplo.com',
        picture: null
      }
    }
    
    if (!this.isSignedIn()) return null

    try {
      const user = this.authInstance.currentUser.get()
      const profile = user.getBasicProfile()

      return {
        id: profile.getId(),
        name: profile.getName(),
        email: profile.getEmail(),
        picture: profile.getImageUrl()
      }
    } catch (error) {
      logError('Error al obtener información del usuario:', error)
      return null
    }
  }

  /**
   * Inicia sesión con Google
   * @returns {Promise<Object|null>} Información del usuario o null si falló
   */
  async signIn() {
    if (syncConfig.isMockMode()) {
      debug('🧪 Sign-in simulado en modo mock')
      return this.getCurrentUser()
    }
    
    try {
      if (!this.isInitialized) {
        const initialized = await this.init()
        if (!initialized) {
          throw new Error('No se pudo inicializar Google API')
        }
      }

      if (this.isSignedIn()) {
        return this.getCurrentUser()
      }

      debug('🔐 Iniciando sesión con Google...')
      await this.authInstance.signIn()
      const user = this.getCurrentUser()
      
      debug('✅ Usuario autenticado:', user?.name)
      return user
    } catch (error) {
      logError('❌ Error al iniciar sesión:', error)
      
      // Proporcionar información más detallada del error
      if (error.error === 'popup_blocked_by_browser') {
        throw new Error('Popup bloqueado por el navegador. Permite popups para este sitio.')
      } else if (error.error === 'access_denied') {
        throw new Error('Acceso denegado. El usuario rechazó los permisos.')
      } else if (error.error === 'immediate_failed') {
        throw new Error('No se pudo iniciar sesión automáticamente.')
      }
      
      return null
    }
  }

  /**
   * Cierra sesión
   * @returns {Promise<boolean>} true si se cerró sesión correctamente
   */
  async signOut() {
    if (syncConfig.isMockMode()) {
      debug('🧪 Sign-out simulado en modo mock')
      return true
    }
    
    try {
      if (!this.authInstance) return true

      debug('🔓 Cerrando sesión...')
      await this.authInstance.signOut()
      debug('✅ Sesión cerrada correctamente')
      return true
    } catch (error) {
      logError('❌ Error al cerrar sesión:', error)
      return false
    }
  }

  /**
   * Obtiene el token de acceso actual
   * @returns {string|null} Token de acceso o null si no está autenticado
   */
  getAccessToken() {
    if (syncConfig.isMockMode()) {
      return 'mock-access-token'
    }
    
    if (!this.isSignedIn()) return null

    try {
      const user = this.authInstance.currentUser.get()
      const authResponse = user.getAuthResponse()
      return authResponse.access_token
    } catch (error) {
      logError('Error al obtener token de acceso:', error)
      return null
    }
  }

  /**
   * Suscribe a cambios en el estado de autenticación
   * @param {Function} callback Función a llamar cuando cambie el estado
   */
  onAuthStateChanged(callback) {
    if (syncConfig.isMockMode()) {
      // En modo mock, simular que siempre está autenticado
      setTimeout(() => callback(true), 100)
      return
    }
    
    this.authStateCallbacks.push(callback)
    
    // Si ya está inicializado, enviar estado actual
    if (this.isReady()) {
      setTimeout(() => callback(this.isSignedIn()), 0)
    }
  }

  /**
   * Desuscribe un callback de cambios de estado
   * @param {Function} callback Función a remover
   */
  offAuthStateChanged(callback) {
    const index = this.authStateCallbacks.indexOf(callback)
    if (index > -1) {
      this.authStateCallbacks.splice(index, 1)
    }
  }

  /**
   * Obtiene el estado de inicialización detallado
   * @returns {Object} Estado detallado del servicio
   */
  getInitState() {
    return {
      ...this.initState,
      isInitialized: this.isInitialized,
      isReady: this.isReady(),
      isSignedIn: this.isSignedIn(),
      isMockMode: syncConfig.isMockMode(),
      hasCredentials: syncConfig.hasRealCredentials()
    }
  }

  /**
   * Resetea el servicio (útil para testing)
   */
  reset() {
    this.isInitialized = false
    this.initializationPromise = null
    this.authInstance = null
    this.gapi = null
    this.authStateCallbacks = []
    this.initState = {
      scriptLoaded: false,
      gapiInitialized: false,
      authInitialized: false,
      error: null
    }
  }
}

// Exportar instancia singleton
export const googleAuth = new GoogleAuthService()
export default googleAuth