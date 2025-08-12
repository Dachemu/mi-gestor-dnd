/**
 * Servicio de Seguimiento de Progreso
 * Gestiona indicadores de progreso para operaciones largas
 */

import { debug, error as logError } from '../utils/logger'

class ProgressTracker {
  constructor() {
    this.activeOperations = new Map()
    this.subscribers = new Map()
    this.globalListeners = []
    
    debug('📊 ProgressTracker inicializado')
  }

  /**
   * Inicia el seguimiento de una operación
   */
  startOperation(operationId, config = {}) {
    const operation = {
      id: operationId,
      type: config.type || 'generic',
      title: config.title || 'Procesando...',
      description: config.description || '',
      startTime: Date.now(),
      currentStep: 0,
      totalSteps: config.totalSteps || 100,
      progress: 0,
      status: 'running',
      substeps: config.substeps || [],
      metadata: config.metadata || {},
      estimatedDuration: config.estimatedDuration || null,
      phase: 'initializing'
    }
    
    this.activeOperations.set(operationId, operation)
    this.notifySubscribers(operationId, 'started', operation)
    this.notifyGlobalListeners('operation-started', operation)
    
    debug(`📊 Operación iniciada: ${operationId} (${operation.type})`)
    
    return {
      update: (updates) => this.updateOperation(operationId, updates),
      setProgress: (progress, step) => this.setProgress(operationId, progress, step),
      setPhase: (phase) => this.setPhase(operationId, phase),
      addStep: (description) => this.addStep(operationId, description),
      complete: (result) => this.completeOperation(operationId, result),
      error: (error) => this.errorOperation(operationId, error),
      cancel: () => this.cancelOperation(operationId)
    }
  }

  /**
   * Actualiza el progreso de una operación
   */
  updateOperation(operationId, updates) {
    const operation = this.activeOperations.get(operationId)
    if (!operation) return false
    
    const oldProgress = operation.progress
    
    Object.assign(operation, {
      ...updates,
      lastUpdate: Date.now()
    })
    
    // Calcular ETA si hay progreso
    if (operation.progress !== oldProgress && operation.progress > 0) {
      const elapsed = Date.now() - operation.startTime
      const remaining = (elapsed / operation.progress) * (100 - operation.progress)
      operation.estimatedTimeRemaining = remaining
    }
    
    this.notifySubscribers(operationId, 'updated', operation)
    this.notifyGlobalListeners('operation-updated', operation)
    
    return true
  }

  /**
   * Establece el progreso específico
   */
  setProgress(operationId, progress, stepDescription) {
    const updates = { progress: Math.min(100, Math.max(0, progress)) }
    
    if (stepDescription) {
      updates.currentStepDescription = stepDescription
    }
    
    return this.updateOperation(operationId, updates)
  }

  /**
   * Cambia la fase de la operación
   */
  setPhase(operationId, phase, description) {
    const updates = { phase }
    
    if (description) {
      updates.description = description
    }
    
    return this.updateOperation(operationId, updates)
  }

  /**
   * Añade un paso completado
   */
  addStep(operationId, stepDescription, metadata = {}) {
    const operation = this.activeOperations.get(operationId)
    if (!operation) return false
    
    operation.currentStep++
    
    const step = {
      step: operation.currentStep,
      description: stepDescription,
      timestamp: Date.now(),
      metadata
    }
    
    if (!operation.completedSteps) {
      operation.completedSteps = []
    }
    
    operation.completedSteps.push(step)
    
    // Actualizar progreso basado en pasos
    if (operation.totalSteps > 0) {
      const stepProgress = (operation.currentStep / operation.totalSteps) * 100
      operation.progress = Math.min(100, stepProgress)
    }
    
    operation.lastStep = step
    
    this.updateOperation(operationId, {
      currentStepDescription: stepDescription,
      completedSteps: operation.completedSteps,
      lastStep: step
    })
    
    debug(`📊 Paso completado en ${operationId}: ${stepDescription}`)
    return true
  }

  /**
   * Completa una operación exitosamente
   */
  completeOperation(operationId, result = null) {
    const operation = this.activeOperations.get(operationId)
    if (!operation) return false
    
    const completionData = {
      status: 'completed',
      progress: 100,
      endTime: Date.now(),
      duration: Date.now() - operation.startTime,
      result,
      phase: 'completed'
    }
    
    Object.assign(operation, completionData)
    
    this.notifySubscribers(operationId, 'completed', operation)
    this.notifyGlobalListeners('operation-completed', operation)
    
    debug(`📊 Operación completada: ${operationId} (${operation.duration}ms)`)
    
    // Limpiar después de un delay
    setTimeout(() => {
      this.activeOperations.delete(operationId)
      this.subscribers.delete(operationId)
    }, 5000)
    
    return true
  }

  /**
   * Marca una operación como fallida
   */
  errorOperation(operationId, error) {
    const operation = this.activeOperations.get(operationId)
    if (!operation) return false
    
    const errorData = {
      status: 'error',
      endTime: Date.now(),
      duration: Date.now() - operation.startTime,
      error: error instanceof Error ? error.message : error,
      errorDetails: error instanceof Error ? error.stack : null,
      phase: 'error'
    }
    
    Object.assign(operation, errorData)
    
    this.notifySubscribers(operationId, 'error', operation)
    this.notifyGlobalListeners('operation-error', operation)
    
    logError(`📊 Operación falló: ${operationId}`, error)
    
    // Mantener por más tiempo para debug
    setTimeout(() => {
      this.activeOperations.delete(operationId)
      this.subscribers.delete(operationId)
    }, 10000)
    
    return true
  }

  /**
   * Cancela una operación
   */
  cancelOperation(operationId) {
    const operation = this.activeOperations.get(operationId)
    if (!operation) return false
    
    const cancellationData = {
      status: 'cancelled',
      endTime: Date.now(),
      duration: Date.now() - operation.startTime,
      phase: 'cancelled'
    }
    
    Object.assign(operation, cancellationData)
    
    this.notifySubscribers(operationId, 'cancelled', operation)
    this.notifyGlobalListeners('operation-cancelled', operation)
    
    debug(`📊 Operación cancelada: ${operationId}`)
    
    setTimeout(() => {
      this.activeOperations.delete(operationId)
      this.subscribers.delete(operationId)
    }, 2000)
    
    return true
  }

  /**
   * Suscribe a actualizaciones de una operación específica
   */
  subscribe(operationId, callback) {
    if (!this.subscribers.has(operationId)) {
      this.subscribers.set(operationId, [])
    }
    
    this.subscribers.get(operationId).push(callback)
    
    // Enviar estado actual si existe
    const operation = this.activeOperations.get(operationId)
    if (operation) {
      callback('current', operation)
    }
    
    // Retornar función de desuscripción
    return () => {
      const callbacks = this.subscribers.get(operationId)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  /**
   * Suscribe a eventos globales de operaciones
   */
  subscribeGlobal(callback) {
    this.globalListeners.push(callback)
    
    // Retornar función de desuscripción
    return () => {
      const index = this.globalListeners.indexOf(callback)
      if (index > -1) {
        this.globalListeners.splice(index, 1)
      }
    }
  }

  /**
   * Notifica a suscriptores específicos
   */
  notifySubscribers(operationId, event, operation) {
    const callbacks = this.subscribers.get(operationId)
    if (!callbacks) return
    
    callbacks.forEach(callback => {
      try {
        callback(event, operation)
      } catch (error) {
        logError('📊 Error en callback de suscriptor:', error)
      }
    })
  }

  /**
   * Notifica a listeners globales
   */
  notifyGlobalListeners(event, operation) {
    this.globalListeners.forEach(callback => {
      try {
        callback(event, operation)
      } catch (error) {
        logError('📊 Error en callback global:', error)
      }
    })
  }

  /**
   * Obtiene el estado de una operación
   */
  getOperation(operationId) {
    return this.activeOperations.get(operationId)
  }

  /**
   * Obtiene todas las operaciones activas
   */
  getActiveOperations() {
    return Array.from(this.activeOperations.values())
  }

  /**
   * Obtiene operaciones por tipo
   */
  getOperationsByType(type) {
    return Array.from(this.activeOperations.values())
      .filter(op => op.type === type)
  }

  /**
   * Verifica si hay operaciones activas
   */
  hasActiveOperations() {
    return this.activeOperations.size > 0
  }

  /**
   * Obtiene estadísticas de operaciones
   */
  getStats() {
    const active = Array.from(this.activeOperations.values())
    const byType = {}
    const byStatus = {}
    
    active.forEach(op => {
      byType[op.type] = (byType[op.type] || 0) + 1
      byStatus[op.status] = (byStatus[op.status] || 0) + 1
    })
    
    return {
      total: active.length,
      byType,
      byStatus,
      subscribers: this.subscribers.size,
      globalListeners: this.globalListeners.length
    }
  }

  /**
   * Helper para crear operaciones de sincronización
   */
  createSyncOperation(campaignId, type = 'sync') {
    const operationId = `${type}-${campaignId}-${Date.now()}`
    
    const config = {
      type: 'synchronization',
      title: type === 'upload' ? 'Subiendo campaña' : 
             type === 'download' ? 'Descargando campaña' : 
             'Sincronizando campaña',
      description: `Procesando campaña ${campaignId}`,
      totalSteps: type === 'bidirectional' ? 6 : 4,
      substeps: type === 'bidirectional' ? [
        'Detectando cambios locales',
        'Subiendo cambios',
        'Descargando cambios remotos', 
        'Aplicando cambios',
        'Resolviendo conflictos',
        'Finalizando sincronización'
      ] : type === 'upload' ? [
        'Preparando datos',
        'Comprimiendo archivos',
        'Subiendo a Drive',
        'Verificando integridad'
      ] : [
        'Conectando a Drive',
        'Descargando archivos',
        'Descomprimiendo datos',
        'Aplicando cambios'
      ],
      metadata: { campaignId, syncType: type }
    }
    
    return this.startOperation(operationId, config)
  }

  /**
   * Helper para operaciones de compresión
   */
  createCompressionOperation(fileCount, totalSize) {
    const operationId = `compression-${Date.now()}`
    
    const config = {
      type: 'compression',
      title: 'Comprimiendo archivos',
      description: `${fileCount} archivos (${Math.round(totalSize / 1024)}KB)`,
      totalSteps: fileCount,
      metadata: { fileCount, totalSize }
    }
    
    return this.startOperation(operationId, config)
  }

  /**
   * Helper para operaciones de cache
   */
  createCacheOperation(operation, itemCount = 1) {
    const operationId = `cache-${operation}-${Date.now()}`
    
    const config = {
      type: 'cache',
      title: operation === 'cleanup' ? 'Limpiando cache' :
             operation === 'optimization' ? 'Optimizando cache' :
             'Procesando cache',
      description: `${itemCount} elementos`,
      totalSteps: Math.max(1, itemCount),
      metadata: { operation, itemCount }
    }
    
    return this.startOperation(operationId, config)
  }

  /**
   * Limpia operaciones completadas antiguas
   */
  cleanup(maxAge = 300000) { // 5 minutos por defecto
    const now = Date.now()
    const toDelete = []
    
    for (const [id, operation] of this.activeOperations) {
      if (operation.status !== 'running' && 
          operation.endTime && 
          (now - operation.endTime) > maxAge) {
        toDelete.push(id)
      }
    }
    
    toDelete.forEach(id => {
      this.activeOperations.delete(id)
      this.subscribers.delete(id)
    })
    
    if (toDelete.length > 0) {
      debug(`📊 Limpieza: ${toDelete.length} operaciones antiguas eliminadas`)
    }
    
    return toDelete.length
  }
}

// Exportar instancia singleton
export const progressTracker = new ProgressTracker()
export default progressTracker