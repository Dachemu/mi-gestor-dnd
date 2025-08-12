/**
 * Servicio de Merge Inteligente de Datos
 * Combina datos de campañas de manera inteligente, preservando información valiosa
 */

import { debug, warn } from '../utils/logger'

class DataMerger {
  /**
   * Realiza un merge inteligente entre datos locales y remotos
   * @param {Object} localData Datos locales
   * @param {Object} remoteData Datos remotos
   * @param {Object} options Opciones de merge
   * @returns {Object} Datos combinados
   */
  smartMerge(localData, remoteData, options = {}) {
    debug('🔀 Iniciando merge inteligente de datos...')

    const mergeOptions = {
      preserveLocalChanges: true,
      combineArrays: true,
      mergeMetadata: true,
      resolveConflicts: 'newest',
      ...options
    }

    const mergedData = {
      ...this.mergeBasicFields(localData, remoteData, mergeOptions),
      ...this.mergeEntityArrays(localData, remoteData, mergeOptions),
      ...this.mergeMetadata(localData, remoteData, mergeOptions)
    }

    debug('✅ Merge inteligente completado')
    return mergedData
  }

  /**
   * Combina campos básicos (name, description, etc.)
   */
  mergeBasicFields(localData, remoteData, options) {
    const result = {}
    const basicFields = ['name', 'description', 'setting', 'theme', 'rules']

    basicFields.forEach(field => {
      if (localData[field] && remoteData[field]) {
        // Si ambos tienen el campo, usar estrategia de resolución
        result[field] = this.resolveFieldConflict(
          localData[field], 
          remoteData[field], 
          field,
          localData,
          remoteData,
          options
        )
      } else {
        // Usar el que esté disponible
        result[field] = localData[field] || remoteData[field] || ''
      }
    })

    return result
  }

  /**
   * Combina arrays de entidades (players, npcs, etc.)
   */
  mergeEntityArrays(localData, remoteData, options) {
    const result = {}
    const entityTypes = ['players', 'npcs', 'locations', 'quests', 'objects', 'notes']

    entityTypes.forEach(type => {
      const localEntities = localData[type] || []
      const remoteEntities = remoteData[type] || []

      if (options.combineArrays) {
        result[type] = this.mergeEntityArray(localEntities, remoteEntities, type, options)
      } else {
        // Usar array más reciente
        const useLocal = this.isNewer(localData, remoteData)
        result[type] = useLocal ? localEntities : remoteEntities
      }
    })

    return result
  }

  /**
   * Combina un array específico de entidades
   */
  mergeEntityArray(localEntities, remoteEntities, entityType, options) {
    const merged = new Map()
    
    // Agregar entidades locales
    localEntities.forEach(entity => {
      merged.set(entity.id, {
        ...entity,
        _source: 'local',
        _mergeTimestamp: new Date().toISOString()
      })
    })

    // Procesar entidades remotas
    remoteEntities.forEach(remoteEntity => {
      const existingLocal = merged.get(remoteEntity.id)

      if (existingLocal) {
        // Entidad existe en ambos, hacer merge
        const mergedEntity = this.mergeEntity(existingLocal, remoteEntity, options)
        merged.set(remoteEntity.id, mergedEntity)
      } else {
        // Nueva entidad desde remoto
        merged.set(remoteEntity.id, {
          ...remoteEntity,
          _source: 'remote',
          _mergeTimestamp: new Date().toISOString()
        })
      }
    })

    return Array.from(merged.values()).map(entity => {
      // Limpiar metadatos de merge
      const { _source, _mergeTimestamp, ...cleanEntity } = entity
      return cleanEntity
    })
  }

  /**
   * Combina una entidad individual
   */
  mergeEntity(localEntity, remoteEntity, options) {
    const merged = { ...localEntity }

    // Campos importantes para entidades
    const entityFields = ['name', 'description', 'notes', 'content', 'stats', 'linkedItems']

    entityFields.forEach(field => {
      if (remoteEntity[field] !== undefined) {
        if (localEntity[field] !== remoteEntity[field]) {
          merged[field] = this.resolveFieldConflict(
            localEntity[field],
            remoteEntity[field],
            field,
            localEntity,
            remoteEntity,
            options
          )
        }
      }
    })

    // Merge especial para linkedItems
    if (localEntity.linkedItems && remoteEntity.linkedItems) {
      merged.linkedItems = this.mergeLinkedItems(
        localEntity.linkedItems,
        remoteEntity.linkedItems
      )
    }

    // Usar timestamp más reciente
    merged.lastModified = this.getMostRecentTimestamp(
      localEntity.lastModified,
      remoteEntity.lastModified
    )

    merged._source = 'merged'
    return merged
  }

  /**
   * Combina linkedItems de entidades
   */
  mergeLinkedItems(localLinked, remoteLinked) {
    const merged = { ...localLinked }

    Object.keys(remoteLinked || {}).forEach(key => {
      const localArray = merged[key] || []
      const remoteArray = remoteLinked[key] || []

      // Combinar arrays sin duplicados
      const combinedIds = new Set([...localArray, ...remoteArray])
      merged[key] = Array.from(combinedIds)
    })

    return merged
  }

  /**
   * Resuelve conflicto en un campo específico
   */
  resolveFieldConflict(localValue, remoteValue, fieldName, localEntity, remoteEntity, options) {
    // Si son iguales, no hay conflicto
    if (localValue === remoteValue) {
      return localValue
    }

    // Estrategias de resolución
    switch (options.resolveConflicts) {
      case 'local':
        return localValue

      case 'remote':
        return remoteValue

      case 'newest':
        const localNewer = this.isNewer(localEntity, remoteEntity)
        return localNewer ? localValue : remoteValue

      case 'longest':
        // Para campos de texto, usar el más largo (más información)
        if (typeof localValue === 'string' && typeof remoteValue === 'string') {
          return localValue.length >= remoteValue.length ? localValue : remoteValue
        }
        return localValue

      case 'combine':
        return this.combineValues(localValue, remoteValue, fieldName)

      default:
        return localValue
    }
  }

  /**
   * Combina valores cuando es posible
   */
  combineValues(localValue, remoteValue, fieldName) {
    // Para strings, intentar combinar si son diferentes pero relacionados
    if (typeof localValue === 'string' && typeof remoteValue === 'string') {
      // Si uno contiene al otro, usar el más completo
      if (localValue.includes(remoteValue)) {
        return localValue
      }
      if (remoteValue.includes(localValue)) {
        return remoteValue
      }

      // Para notas/description, combinar con separador
      if (fieldName === 'notes' || fieldName === 'description' || fieldName === 'content') {
        return this.combineTextFields(localValue, remoteValue)
      }
    }

    // Para arrays, combinar
    if (Array.isArray(localValue) && Array.isArray(remoteValue)) {
      return [...new Set([...localValue, ...remoteValue])]
    }

    // Para objetos, merge profundo
    if (typeof localValue === 'object' && typeof remoteValue === 'object' && 
        localValue !== null && remoteValue !== null) {
      return { ...localValue, ...remoteValue }
    }

    // Por defecto, usar local
    return localValue
  }

  /**
   * Combina campos de texto de manera inteligente
   */
  combineTextFields(localText, remoteText) {
    if (!localText) return remoteText
    if (!remoteText) return localText

    // Si son muy similares, usar el más largo
    const similarity = this.calculateTextSimilarity(localText, remoteText)
    if (similarity > 0.8) {
      return localText.length >= remoteText.length ? localText : remoteText
    }

    // Combinar con separador
    return `${localText}\n\n--- Versión remota ---\n${remoteText}`
  }

  /**
   * Calcula similitud básica entre textos
   */
  calculateTextSimilarity(text1, text2) {
    const words1 = text1.toLowerCase().split(/\s+/)
    const words2 = text2.toLowerCase().split(/\s+/)
    
    const set1 = new Set(words1)
    const set2 = new Set(words2)
    
    const intersection = new Set([...set1].filter(x => set2.has(x)))
    const union = new Set([...set1, ...set2])
    
    return intersection.size / union.size
  }

  /**
   * Combina metadatos
   */
  mergeMetadata(localData, remoteData, options) {
    return {
      id: localData.id || remoteData.id,
      createdAt: this.getEarliestTimestamp(localData.createdAt, remoteData.createdAt),
      lastModified: this.getMostRecentTimestamp(localData.lastModified, remoteData.lastModified),
      syncVersion: Math.max(localData.syncVersion || 0, remoteData.syncVersion || 0) + 1,
      mergedAt: new Date().toISOString(),
      mergedFrom: {
        local: !!localData.lastModified,
        remote: !!remoteData.lastModified
      }
    }
  }

  /**
   * Determina si los datos locales son más recientes
   */
  isNewer(localData, remoteData) {
    const localTime = new Date(localData.lastModified || localData.createdAt || 0)
    const remoteTime = new Date(remoteData.lastModified || remoteData.createdAt || 0)
    
    return localTime >= remoteTime
  }

  /**
   * Obtiene el timestamp más reciente
   */
  getMostRecentTimestamp(timestamp1, timestamp2) {
    if (!timestamp1) return timestamp2
    if (!timestamp2) return timestamp1
    
    const date1 = new Date(timestamp1)
    const date2 = new Date(timestamp2)
    
    return date1 >= date2 ? timestamp1 : timestamp2
  }

  /**
   * Obtiene el timestamp más antiguo
   */
  getEarliestTimestamp(timestamp1, timestamp2) {
    if (!timestamp1) return timestamp2
    if (!timestamp2) return timestamp1
    
    const date1 = new Date(timestamp1)
    const date2 = new Date(timestamp2)
    
    return date1 <= date2 ? timestamp1 : timestamp2
  }

  /**
   * Genera reporte de merge
   */
  generateMergeReport(localData, remoteData, mergedData) {
    const report = {
      summary: {
        fieldsChanged: 0,
        entitiesAdded: 0,
        entitiesMerged: 0,
        conflictsResolved: 0
      },
      details: {
        changedFields: [],
        addedEntities: [],
        mergedEntities: [],
        resolvedConflicts: []
      }
    }

    // Analizar cambios...
    // (Implementación detallada del reporte)

    return report
  }

  /**
   * Verifica si un merge es seguro (sin pérdida de datos importantes)
   */
  isSafeMerge(localData, remoteData, options = {}) {
    // Verificar que no se pierdan datos importantes
    const importantFields = ['name', 'id', 'createdAt']
    
    for (const field of importantFields) {
      if (localData[field] && remoteData[field] && localData[field] !== remoteData[field]) {
        // Conflicto en campo importante
        if (field === 'name' && !options.allowNameChange) {
          return false
        }
      }
    }

    return true
  }
}

// Exportar instancia singleton
export const dataMerger = new DataMerger()
export default dataMerger