/**
 * Servicio Mock para Google Drive Sync
 * Simula todas las operaciones de sincronización sin conectar a Google Drive
 * Útil para desarrollo y testing sin credenciales reales
 */

import { debug, warn } from '../utils/logger'

class MockSyncService {
  constructor() {
    this.isConnected = false
    this.lastSync = null
    this.pendingChanges = false
    this.syncError = null
    this.mockUser = null
    this.mockCampaigns = []
    this.listeners = []
    this.autoSyncInterval = null
    
    debug('🧪 MockSyncService inicializado')
  }

  // =============================================================================
  // ESTADO Y CONFIGURACIÓN
  // =============================================================================

  getStatus() {
    return {
      isConnected: this.isConnected,
      lastSync: this.lastSync,
      pendingChanges: this.pendingChanges,
      error: this.syncError
    }
  }

  getCurrentUser() {
    return this.mockUser
  }

  markPendingChanges() {
    this.pendingChanges = true
    this.notifyListeners()
    debug('🧪 Mock: Cambios marcados como pendientes')
  }

  // =============================================================================
  // INICIALIZACIÓN Y CONEXIÓN
  // =============================================================================

  async init() {
    debug('🧪 Mock: Inicializando servicio de sync...')
    
    // Simular tiempo de inicialización
    await this.delay(500)
    
    return true
  }

  async connect() {
    debug('🧪 Mock: Simulando conexión con Google Drive...')
    
    // Simular tiempo de conexión
    await this.delay(1000)
    
    this.isConnected = true
    this.syncError = null
    this.mockUser = {
      id: 'mock-user-123',
      name: 'Usuario de Prueba',
      email: 'usuario.prueba@ejemplo.com',
      picture: null
    }
    
    this.startAutoSync()
    this.notifyListeners()
    
    debug('🧪 Mock: Conectado exitosamente')
    return true
  }

  async disconnect() {
    debug('🧪 Mock: Desconectando...')
    
    await this.delay(300)
    
    this.isConnected = false
    this.mockUser = null
    this.syncError = null
    this.stopAutoSync()
    this.notifyListeners()
    
    debug('🧪 Mock: Desconectado')
    return true
  }

  // =============================================================================
  // OPERACIONES DE SINCRONIZACIÓN
  // =============================================================================

  async syncToCloud() {
    if (!this.isConnected) {
      throw new Error('No está conectado a Google Drive')
    }

    debug('🧪 Mock: Sincronizando hacia la nube...')
    
    // Simular tiempo de subida
    await this.delay(2000)
    
    const result = {
      uploaded: Math.floor(Math.random() * 3) + 1,
      updated: Math.floor(Math.random() * 2),
      errors: []
    }
    
    // Simular errores ocasionales
    if (Math.random() < 0.1) {
      result.errors.push({
        campaign: 'Campaña de Ejemplo',
        error: 'Error simulado de red'
      })
    }
    
    this.lastSync = new Date()
    this.pendingChanges = false
    this.notifyListeners()
    
    debug('🧪 Mock: Sync to cloud completado:', result)
    return result
  }

  async syncFromCloud() {
    if (!this.isConnected) {
      throw new Error('No está conectado a Google Drive')
    }

    debug('🧪 Mock: Sincronizando desde la nube...')
    
    // Simular tiempo de descarga
    await this.delay(1500)
    
    const result = {
      downloaded: Math.floor(Math.random() * 3),
      updated: Math.floor(Math.random() * 2),
      conflicts: [],
      errors: [],
      newCampaigns: []
    }
    
    // Simular campañas nuevas descargadas
    if (result.downloaded > 0) {
      result.newCampaigns = Array.from({ length: result.downloaded }, (_, i) => 
        `Campaña Remota ${i + 1}`
      )
    }
    
    // Simular conflictos ocasionales
    if (Math.random() < 0.25) {
      result.conflicts.push({
        name: 'Campaña con Conflicto',
        driveId: 'mock-drive-id-123',
        localModified: new Date(Date.now() - 120000).toISOString(),
        driveModified: new Date().toISOString(),
        localData: { 
          name: 'Campaña con Conflicto', 
          description: 'Versión local',
          lastModified: new Date(Date.now() - 120000).toISOString()
        },
        driveData: { 
          name: 'Campaña con Conflicto', 
          description: 'Versión desde Drive con cambios diferentes',
          lastModified: new Date().toISOString()
        },
        conflictType: 'timestamp'
      })
    }
    
    // Simular errores ocasionales
    if (Math.random() < 0.15) {
      result.errors.push({
        campaign: 'Campaña Problemática',
        error: 'Error simulado de descarga',
        type: 'download'
      })
    }
    
    this.lastSync = new Date()
    this.pendingChanges = result.conflicts.length > 0
    this.notifyListeners()
    
    debug('🧪 Mock: Sync from cloud completado:', result)
    return result
  }

  async resolveConflict(campaignName, useDriveVersion) {
    debug(`🧪 Mock: Resolviendo conflicto para '${campaignName}', usar Drive: ${useDriveVersion}`)
    
    // Simular tiempo de resolución
    await this.delay(800)
    
    debug('🧪 Mock: Conflicto resuelto')
    return true
  }

  // =============================================================================
  // AUTO-SYNC
  // =============================================================================

  startAutoSync() {
    if (this.autoSyncInterval) return

    this.autoSyncInterval = setInterval(async () => {
      if (this.isConnected && !this.pendingChanges) {
        try {
          debug('🧪 Mock: Auto-sync ejecutándose...')
          await this.syncToCloud()
        } catch (error) {
          debug('🧪 Mock: Auto-sync falló:', error.message)
        }
      }
    }, 30000) // 30 segundos para testing más rápido

    debug('🧪 Mock: Auto-sync iniciado')
  }

  stopAutoSync() {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval)
      this.autoSyncInterval = null
      debug('🧪 Mock: Auto-sync detenido')
    }
  }

  // =============================================================================
  // GESTIÓN DE LISTENERS
  // =============================================================================

  addListener(listener) {
    this.listeners.push(listener)
  }

  removeListener(listener) {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.getStatus())
      } catch (error) {
        console.error('🧪 Mock: Error en listener:', error)
      }
    })
  }

  // =============================================================================
  // UTILIDADES
  // =============================================================================

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Simular operaciones adicionales para compatibilidad
  clearCache() {
    this.mockCampaigns = []
    debug('🧪 Mock: Cache limpiado')
  }

  // Métodos para testing
  simulateError(errorMessage) {
    this.syncError = errorMessage
    this.notifyListeners()
    warn('🧪 Mock: Error simulado:', errorMessage)
  }

  simulateConnection(connected = true) {
    this.isConnected = connected
    if (connected) {
      this.mockUser = {
        id: 'mock-user-123',
        name: 'Usuario de Prueba',
        email: 'test@ejemplo.com',
        picture: null
      }
    } else {
      this.mockUser = null
    }
    this.notifyListeners()
    debug(`🧪 Mock: Estado de conexión simulado: ${connected}`)
  }

  reset() {
    this.isConnected = false
    this.lastSync = null
    this.pendingChanges = false
    this.syncError = null
    this.mockUser = null
    this.mockCampaigns = []
    this.stopAutoSync()
    debug('🧪 Mock: Servicio reseteado')
  }
}

export default MockSyncService