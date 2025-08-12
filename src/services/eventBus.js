/**
 * Event Bus Simple para Desacoplamiento de Servicios
 * Permite comunicación entre servicios sin dependencias circulares
 */

import { debug, warn } from '../utils/logger'

class EventBus {
  constructor() {
    this.listeners = new Map()
    this.onceListeners = new Set()
    this.history = []
    this.maxHistory = 100
    
    debug('📡 EventBus inicializado')
  }

  /**
   * Suscribe a un evento
   * @param {string} event - Nombre del evento
   * @param {Function} callback - Función callback
   * @param {Object} options - Opciones (once, priority)
   * @returns {Function} Función para desuscribirse
   */
  on(event, callback, options = {}) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    
    const listener = {
      callback,
      priority: options.priority || 0,
      id: Math.random().toString(36).substr(2, 9)
    }
    
    if (options.once) {
      this.onceListeners.add(listener.id)
    }
    
    // Insertar ordenado por prioridad (mayor prioridad primero)
    const listeners = this.listeners.get(event)
    const insertIndex = listeners.findIndex(l => l.priority < listener.priority)
    
    if (insertIndex === -1) {
      listeners.push(listener)
    } else {
      listeners.splice(insertIndex, 0, listener)
    }
    
    debug(`📡 Suscriptor añadido a '${event}' (prioridad: ${listener.priority})`)
    
    // Retornar función de desuscripción
    return () => this.off(event, listener.id)
  }

  /**
   * Suscribe a un evento solo una vez
   * @param {string} event - Nombre del evento
   * @param {Function} callback - Función callback
   * @param {Object} options - Opciones adicionales
   * @returns {Function} Función para desuscribirse
   */
  once(event, callback, options = {}) {
    return this.on(event, callback, { ...options, once: true })
  }

  /**
   * Desuscribe de un evento
   * @param {string} event - Nombre del evento
   * @param {string} listenerId - ID del listener (opcional)
   */
  off(event, listenerId = null) {
    const listeners = this.listeners.get(event)
    if (!listeners) return
    
    if (listenerId) {
      const index = listeners.findIndex(l => l.id === listenerId)
      if (index > -1) {
        listeners.splice(index, 1)
        this.onceListeners.delete(listenerId)
        debug(`📡 Suscriptor ${listenerId} eliminado de '${event}'`)
      }
    } else {
      // Eliminar todos los listeners del evento
      this.listeners.delete(event)
      debug(`📡 Todos los suscriptores eliminados de '${event}'`)
    }
  }

  /**
   * Emite un evento
   * @param {string} event - Nombre del evento
   * @param {any} data - Datos del evento
   * @param {Object} options - Opciones (async, timeout)
   * @returns {Promise|Array} Resultados de los callbacks
   */
  emit(event, data = null, options = {}) {
    const listeners = this.listeners.get(event)
    if (!listeners || listeners.length === 0) {
      debug(`📡 Evento '${event}' emitido sin suscriptores`)
      return options.async ? Promise.resolve([]) : []
    }

    // Registrar en historia
    this.addToHistory(event, data)

    const eventData = {
      type: event,
      data,
      timestamp: Date.now(),
      source: 'EventBus'
    }

    debug(`📡 Emitiendo evento '${event}' a ${listeners.length} suscriptores`)

    const results = []
    const listenersToRemove = []

    for (const listener of listeners) {
      try {
        const result = listener.callback(eventData)
        results.push(result)

        // Marcar para eliminar si es 'once'
        if (this.onceListeners.has(listener.id)) {
          listenersToRemove.push(listener.id)
        }
      } catch (error) {
        warn(`📡 Error en callback de '${event}':`, error.message)
        results.push(null)
      }
    }

    // Limpiar listeners 'once'
    listenersToRemove.forEach(id => this.off(event, id))

    if (options.async) {
      return Promise.all(results.map(r => Promise.resolve(r)))
    }

    return results
  }

  /**
   * Emite un evento de forma asíncrona
   * @param {string} event - Nombre del evento
   * @param {any} data - Datos del evento
   * @returns {Promise} Promise con los resultados
   */
  async emitAsync(event, data = null) {
    return this.emit(event, data, { async: true })
  }

  /**
   * Espera a que se emita un evento específico
   * @param {string} event - Nombre del evento
   * @param {number} timeout - Timeout en ms
   * @returns {Promise} Promise que se resuelve cuando se emite el evento
   */
  waitFor(event, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        unsubscribe()
        reject(new Error(`Timeout esperando evento '${event}'`))
      }, timeout)

      const unsubscribe = this.once(event, (eventData) => {
        clearTimeout(timeoutId)
        resolve(eventData)
      })
    })
  }

  /**
   * Añade evento al historial
   * @param {string} event - Nombre del evento
   * @param {any} data - Datos del evento
   * @private
   */
  addToHistory(event, data) {
    this.history.push({
      event,
      data,
      timestamp: Date.now()
    })

    // Mantener tamaño máximo del historial
    if (this.history.length > this.maxHistory) {
      this.history.shift()
    }
  }

  /**
   * Obtiene el historial de eventos
   * @param {string} eventFilter - Filtrar por tipo de evento (opcional)
   * @param {number} limit - Límite de eventos (opcional)
   * @returns {Array} Historial de eventos
   */
  getHistory(eventFilter = null, limit = null) {
    let history = this.history

    if (eventFilter) {
      history = history.filter(h => h.event === eventFilter)
    }

    if (limit) {
      history = history.slice(-limit)
    }

    return history
  }

  /**
   * Obtiene estadísticas del EventBus
   * @returns {Object} Estadísticas
   */
  getStats() {
    const stats = {
      totalEvents: Array.from(this.listeners.keys()).length,
      totalListeners: 0,
      eventDetails: {},
      historySize: this.history.length,
      onceListeners: this.onceListeners.size
    }

    for (const [event, listeners] of this.listeners.entries()) {
      stats.totalListeners += listeners.length
      stats.eventDetails[event] = {
        listenerCount: listeners.length,
        priorities: listeners.map(l => l.priority)
      }
    }

    return stats
  }

  /**
   * Limpia todos los listeners y el historial
   */
  clear() {
    this.listeners.clear()
    this.onceListeners.clear()
    this.history = []
    debug('📡 EventBus limpiado completamente')
  }

  /**
   * Elimina listeners inactivos o huérfanos
   */
  cleanup() {
    let removed = 0

    for (const [event, listeners] of this.listeners.entries()) {
      const validListeners = listeners.filter(listener => {
        // Verificar si el callback sigue siendo válido
        return typeof listener.callback === 'function'
      })

      removed += listeners.length - validListeners.length

      if (validListeners.length === 0) {
        this.listeners.delete(event)
      } else if (validListeners.length !== listeners.length) {
        this.listeners.set(event, validListeners)
      }
    }

    if (removed > 0) {
      debug(`📡 EventBus cleanup: ${removed} listeners inválidos eliminados`)
    }

    return removed
  }
}

// Exportar instancia singleton
export const eventBus = new EventBus()
export default eventBus