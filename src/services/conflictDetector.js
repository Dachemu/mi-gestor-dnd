/**
 * Sistema de detección y análisis de conflictos para sincronización
 * Detecta diferentes tipos de conflictos y proporciona información detallada
 */

import { debug, warn } from '../utils/logger'

class ConflictDetector {
  /**
   * Detecta conflictos entre datos locales y remotos
   * @param {Object} localData Datos locales
   * @param {Object} remoteData Datos remotos
   * @param {string} campaignName Nombre de la campaña
   * @returns {Object|null} Información del conflicto o null si no hay conflicto
   */
  detectConflict(localData, remoteData, campaignName) {
    if (!localData || !remoteData) {
      return null
    }

    const conflicts = []

    // 1. Conflicto de timestamp
    const timestampConflict = this.detectTimestampConflict(localData, remoteData)
    if (timestampConflict) {
      conflicts.push(timestampConflict)
    }

    // 2. Conflicto de contenido (sin cambios de timestamp)
    const contentConflict = this.detectContentConflict(localData, remoteData)
    if (contentConflict) {
      conflicts.push(contentConflict)
    }

    // 3. Conflicto de estructura (entidades diferentes)
    const structureConflict = this.detectStructureConflict(localData, remoteData)
    if (structureConflict) {
      conflicts.push(structureConflict)
    }

    if (conflicts.length === 0) {
      return null
    }

    const mainConflict = conflicts[0] // El más importante
    const severity = this.calculateSeverity(conflicts)

    return {
      campaignName,
      type: mainConflict.type,
      severity,
      conflicts: conflicts,
      localData,
      remoteData,
      suggestion: this.getSuggestion(conflicts, severity),
      canAutoResolve: this.canAutoResolve(conflicts, severity),
      details: {
        localModified: new Date(localData.lastModified || localData.createdAt || 0).toISOString(),
        remoteModified: new Date(remoteData.lastModified || remoteData.createdAt || 0).toISOString(),
        conflictCount: conflicts.length,
        affectedSections: conflicts.map(c => c.section).filter(Boolean)
      }
    }
  }

  /**
   * Detecta conflictos de timestamp
   */
  detectTimestampConflict(localData, remoteData) {
    const localModified = new Date(localData.lastModified || localData.createdAt || 0)
    const remoteModified = new Date(remoteData.lastModified || remoteData.createdAt || 0)

    const timeDiffMs = Math.abs(remoteModified.getTime() - localModified.getTime())
    const significantThreshold = 60000 // 1 minuto

    if (timeDiffMs < significantThreshold) {
      return null // No hay conflicto significativo
    }

    return {
      type: 'timestamp',
      severity: timeDiffMs > 3600000 ? 'high' : 'medium', // > 1 hora = alta
      message: 'Diferentes fechas de modificación',
      localTime: localModified,
      remoteTime: remoteModified,
      timeDiffMs
    }
  }

  /**
   * Detecta conflictos de contenido
   */
  detectContentConflict(localData, remoteData) {
    const differences = []

    // Comparar campos básicos
    const basicFields = ['name', 'description']
    basicFields.forEach(field => {
      if (localData[field] !== remoteData[field]) {
        differences.push({
          field,
          localValue: localData[field],
          remoteValue: remoteData[field]
        })
      }
    })

    // Comparar entidades
    const entityTypes = ['players', 'npcs', 'locations', 'quests', 'objects', 'notes']
    entityTypes.forEach(type => {
      const localEntities = localData[type] || []
      const remoteEntities = remoteData[type] || []

      if (localEntities.length !== remoteEntities.length) {
        differences.push({
          field: type,
          type: 'count_difference',
          localCount: localEntities.length,
          remoteCount: remoteEntities.length
        })
      } else {
        // Comparar contenido de entidades
        const entityDiffs = this.compareEntityArrays(localEntities, remoteEntities, type)
        differences.push(...entityDiffs)
      }
    })

    if (differences.length === 0) {
      return null
    }

    return {
      type: 'content',
      severity: differences.length > 10 ? 'high' : differences.length > 3 ? 'medium' : 'low',
      message: `${differences.length} diferencias de contenido encontradas`,
      differences,
      section: 'content'
    }
  }

  /**
   * Detecta conflictos de estructura
   */
  detectStructureConflict(localData, remoteData) {
    const localKeys = new Set(Object.keys(localData))
    const remoteKeys = new Set(Object.keys(remoteData))

    const missingInLocal = [...remoteKeys].filter(key => !localKeys.has(key))
    const missingInRemote = [...localKeys].filter(key => !remoteKeys.has(key))

    if (missingInLocal.length === 0 && missingInRemote.length === 0) {
      return null
    }

    return {
      type: 'structure',
      severity: (missingInLocal.length + missingInRemote.length) > 5 ? 'high' : 'medium',
      message: 'Diferentes estructuras de datos',
      missingInLocal,
      missingInRemote,
      section: 'structure'
    }
  }

  /**
   * Compara arrays de entidades
   */
  compareEntityArrays(localEntities, remoteEntities, type) {
    const differences = []
    const localMap = new Map(localEntities.map(e => [e.id, e]))
    const remoteMap = new Map(remoteEntities.map(e => [e.id, e]))

    // Verificar entidades modificadas
    localEntities.forEach(localEntity => {
      const remoteEntity = remoteMap.get(localEntity.id)
      if (remoteEntity) {
        // Comparar contenido básico
        const importantFields = ['name', 'description', 'content', 'notes']
        importantFields.forEach(field => {
          if (localEntity[field] !== remoteEntity[field] && (localEntity[field] || remoteEntity[field])) {
            differences.push({
              field: `${type}.${localEntity.id}.${field}`,
              type: 'entity_modification',
              entityId: localEntity.id,
              entityName: localEntity.name || `${type} ${localEntity.id}`,
              localValue: localEntity[field],
              remoteValue: remoteEntity[field]
            })
          }
        })
      }
    })

    return differences
  }

  /**
   * Calcula la severidad general del conflicto
   */
  calculateSeverity(conflicts) {
    const severities = conflicts.map(c => c.severity)
    
    if (severities.includes('high')) return 'high'
    if (severities.includes('medium')) return 'medium'
    return 'low'
  }

  /**
   * Proporciona una sugerencia para resolver el conflicto
   */
  getSuggestion(conflicts, severity) {
    const hasTimestamp = conflicts.some(c => c.type === 'timestamp')
    const hasContent = conflicts.some(c => c.type === 'content')
    const hasStructure = conflicts.some(c => c.type === 'structure')

    if (severity === 'low' && hasTimestamp && !hasContent) {
      return 'merge_auto' // Puede resolverse automáticamente
    }

    if (hasStructure) {
      return 'manual_review' // Requiere revisión manual
    }

    if (hasContent && severity === 'high') {
      return 'manual_merge' // Merge manual recomendado
    }

    return 'choose_version' // Usuario elige versión
  }

  /**
   * Determina si el conflicto puede resolverse automáticamente
   */
  canAutoResolve(conflicts, severity) {
    // Solo auto-resolver conflictos de timestamp de baja severidad
    return severity === 'low' && 
           conflicts.length === 1 && 
           conflicts[0].type === 'timestamp'
  }

  /**
   * Resuelve automáticamente un conflicto si es posible
   */
  autoResolve(conflict) {
    if (!conflict.canAutoResolve) {
      throw new Error('Este conflicto no puede resolverse automáticamente')
    }

    const { localData, remoteData } = conflict
    const localModified = new Date(localData.lastModified || localData.createdAt || 0)
    const remoteModified = new Date(remoteData.lastModified || remoteData.createdAt || 0)

    // Usar la versión más reciente
    const useRemote = remoteModified > localModified

    debug(`🤖 Auto-resolviendo conflicto: usando versión ${useRemote ? 'remota' : 'local'}`)

    return {
      resolution: useRemote ? 'use_remote' : 'use_local',
      data: useRemote ? remoteData : localData,
      reason: `Versión ${useRemote ? 'remota' : 'local'} más reciente (${useRemote ? remoteModified : localModified})`
    }
  }

  /**
   * Genera un resumen legible del conflicto
   */
  generateSummary(conflict) {
    const { campaignName, type, severity, conflicts, details } = conflict

    let summary = `🔄 Conflicto en "${campaignName}" (${severity.toUpperCase()})\n\n`

    if (type === 'timestamp') {
      summary += `📅 Local: ${new Date(details.localModified).toLocaleString()}\n`
      summary += `📅 Remoto: ${new Date(details.remoteModified).toLocaleString()}\n\n`
    }

    if (conflicts.length > 1) {
      summary += `📊 ${conflicts.length} tipos de conflicto detectados:\n`
      conflicts.forEach((c, i) => {
        summary += `  ${i + 1}. ${c.type}: ${c.message}\n`
      })
    } else {
      summary += `📋 ${conflicts[0].message}\n`
    }

    if (details.affectedSections.length > 0) {
      summary += `\n🎯 Secciones afectadas: ${details.affectedSections.join(', ')}`
    }

    return summary
  }
}

// Exportar instancia singleton
export const conflictDetector = new ConflictDetector()
export default conflictDetector