/**
 * Registro de Servicios - Inyección de Dependencias
 * Permite acceso a servicios sin dependencias circulares
 */

import { debug } from '../utils/logger'

class ServiceRegistry {
  constructor() {
    this.services = new Map()
    debug('🏭 ServiceRegistry inicializado')
  }

  /**
   * Registra un servicio
   * @param {string} name - Nombre del servicio
   * @param {any} service - Instancia del servicio
   */
  register(name, service) {
    this.services.set(name, service)
    debug(`🏭 Servicio registrado: ${name}`)
  }

  /**
   * Obtiene un servicio
   * @param {string} name - Nombre del servicio
   * @returns {any} Instancia del servicio
   */
  get(name) {
    const service = this.services.get(name)
    if (!service) {
      throw new Error(`Servicio '${name}' no encontrado en el registro`)
    }
    return service
  }

  /**
   * Verifica si un servicio está registrado
   * @param {string} name - Nombre del servicio
   * @returns {boolean}
   */
  has(name) {
    return this.services.has(name)
  }

  /**
   * Lista todos los servicios registrados
   * @returns {Array<string>} Lista de nombres de servicios
   */
  list() {
    return Array.from(this.services.keys())
  }

  /**
   * Obtiene estadísticas del registry
   * @returns {Object} Estadísticas
   */
  getStats() {
    return {
      totalServices: this.services.size,
      services: this.list()
    }
  }

  /**
   * Limpia todos los servicios
   */
  clear() {
    this.services.clear()
    debug('🏭 Registry limpiado')
  }
}

// Exportar instancia singleton
export const serviceRegistry = new ServiceRegistry()
export default serviceRegistry