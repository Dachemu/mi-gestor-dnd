/**
 * Servicio de Tracking de Cambios para Sincronización Incremental
 * Detecta y rastrea cambios específicos para optimizar las sincronizaciones
 */

import { debug, warn } from '../utils/logger'

class ChangeTracker {
  constructor() {
    this.snapshots = new Map() // Almacena snapshots de campañas
    this.changeLog = new Map()  // Log de cambios por campaña
    this.trackingEnabled = true
    
    debug('🔍 ChangeTracker inicializado')
  }

  /**
   * Toma un snapshot inicial de una campaña para tracking
   * @param {Object} campaign Datos de la campaña
   */
  takeSnapshot(campaign) {
    if (!this.trackingEnabled || !campaign?.id) return

    const snapshot = {
      id: campaign.id,
      name: campaign.name,
      timestamp: new Date().toISOString(),
      checksum: this.calculateChecksum(campaign),
      entityCounts: this.getEntityCounts(campaign),
      fieldHashes: this.calculateFieldHashes(campaign)
    }

    this.snapshots.set(campaign.id, snapshot)
    debug(`📸 Snapshot tomado para campaña '${campaign.name}'`)
    
    return snapshot
  }

  /**
   * Detecta cambios comparando con el snapshot anterior
   * @param {Object} campaign Datos actuales de la campaña
   * @returns {Object} Detalle de cambios encontrados
   */
  detectChanges(campaign) {
    if (!this.trackingEnabled || !campaign?.id) {
      return this.createEmptyChangeSet()
    }

    const previousSnapshot = this.snapshots.get(campaign.id)
    if (!previousSnapshot) {
      // Primera vez que vemos esta campaña, todo es nuevo
      this.takeSnapshot(campaign)
      return this.createFullChangeSet(campaign, 'initial')
    }

    const changes = {
      campaignId: campaign.id,
      campaignName: campaign.name,
      hasChanges: false,
      changeTypes: [],
      timestamp: new Date().toISOString(),
      details: {
        basic: {},           // Cambios en campos básicos
        entities: {},        // Cambios en arrays de entidades
        metadata: {},        // Cambios en metadatos
        structural: {}       // Cambios estructurales
      },
      summary: {
        fieldsChanged: 0,
        entitiesAdded: 0,
        entitiesModified: 0,
        entitiesDeleted: 0,
        totalSize: 0
      }
    }

    // 1. Detectar cambios en campos básicos
    this.detectBasicFieldChanges(campaign, previousSnapshot, changes)

    // 2. Detectar cambios en entidades
    this.detectEntityChanges(campaign, previousSnapshot, changes)

    // 3. Detectar cambios estructurales
    this.detectStructuralChanges(campaign, previousSnapshot, changes)

    // 4. Actualizar snapshot si hay cambios
    if (changes.hasChanges) {
      this.takeSnapshot(campaign)
      this.logChange(campaign.id, changes)
    }

    debug(`🔍 Cambios detectados en '${campaign.name}': ${changes.hasChanges ? 'SÍ' : 'NO'}`)
    return changes
  }

  /**
   * Detecta cambios en campos básicos (name, description, etc.)
   */
  detectBasicFieldChanges(campaign, snapshot, changes) {
    const basicFields = ['name', 'description', 'setting', 'theme', 'rules', 'notes']
    const currentHashes = this.calculateFieldHashes(campaign)

    basicFields.forEach(field => {
      const currentHash = currentHashes[field]
      const previousHash = snapshot.fieldHashes[field]

      if (currentHash !== previousHash) {
        changes.hasChanges = true
        changes.changeTypes.push('basic_field')
        changes.details.basic[field] = {
          type: 'modified',
          previousHash,
          currentHash,
          value: campaign[field]
        }
        changes.summary.fieldsChanged++

        debug(`📝 Campo '${field}' modificado en '${campaign.name}'`)
      }
    })
  }

  /**
   * Detecta cambios en arrays de entidades
   */
  detectEntityChanges(campaign, snapshot, changes) {
    const entityTypes = ['players', 'npcs', 'locations', 'quests', 'objects', 'notes']

    entityTypes.forEach(entityType => {
      const currentEntities = campaign[entityType] || []
      const previousCount = snapshot.entityCounts[entityType] || 0
      const currentCount = currentEntities.length

      // Cambio en cantidad
      if (currentCount !== previousCount) {
        changes.hasChanges = true
        changes.changeTypes.push('entity_count')
        
        const countDiff = currentCount - previousCount
        if (countDiff > 0) {
          changes.summary.entitiesAdded += countDiff
        } else {
          changes.summary.entitiesDeleted += Math.abs(countDiff)
        }

        debug(`📊 ${entityType}: ${previousCount} → ${currentCount} (${countDiff > 0 ? '+' : ''}${countDiff})`)
      }

      // Detectar cambios específicos en entidades
      const entityChanges = this.detectSpecificEntityChanges(
        currentEntities,
        entityType,
        campaign.id
      )

      if (entityChanges.length > 0) {
        changes.hasChanges = true
        changes.changeTypes.push('entity_content')
        changes.details.entities[entityType] = entityChanges
        changes.summary.entitiesModified += entityChanges.length
      }
    })
  }

  /**
   * Detecta cambios específicos dentro de entidades
   */
  detectSpecificEntityChanges(currentEntities, entityType, campaignId) {
    const changes = []
    const previousEntities = this.getPreviousEntities(campaignId, entityType)

    if (!previousEntities) {
      // Primera vez, marcar todas como nuevas
      return currentEntities.map(entity => ({
        id: entity.id,
        type: 'added',
        entity: entity
      }))
    }

    const previousMap = new Map(previousEntities.map(e => [e.id, e]))
    const currentMap = new Map(currentEntities.map(e => [e.id, e]))

    // Detectar entidades añadidas
    currentEntities.forEach(current => {
      if (!previousMap.has(current.id)) {
        changes.push({
          id: current.id,
          type: 'added',
          entity: current
        })
      }
    })

    // Detectar entidades eliminadas
    previousEntities.forEach(previous => {
      if (!currentMap.has(previous.id)) {
        changes.push({
          id: previous.id,
          type: 'deleted',
          entity: previous
        })
      }
    })

    // Detectar entidades modificadas
    currentEntities.forEach(current => {
      const previous = previousMap.get(current.id)
      if (previous) {
        const entityChecksum = this.calculateChecksum(current)
        const previousChecksum = this.calculateChecksum(previous)
        
        if (entityChecksum !== previousChecksum) {
          changes.push({
            id: current.id,
            type: 'modified',
            entity: current,
            previousEntity: previous,
            fieldChanges: this.compareEntityFields(previous, current)
          })
        }
      }
    })

    return changes
  }

  /**
   * Compara campos específicos de una entidad
   */
  compareEntityFields(previous, current) {
    const fields = ['name', 'description', 'notes', 'content', 'stats', 'linkedItems']
    const changes = []

    fields.forEach(field => {
      if (JSON.stringify(previous[field]) !== JSON.stringify(current[field])) {
        changes.push({
          field,
          previousValue: previous[field],
          currentValue: current[field]
        })
      }
    })

    return changes
  }

  /**
   * Detecta cambios estructurales (nuevos campos, etc.)
   */
  detectStructuralChanges(campaign, snapshot, changes) {
    const currentKeys = new Set(Object.keys(campaign))
    const previousKeys = new Set(Object.keys(snapshot.fieldHashes))

    const addedKeys = [...currentKeys].filter(k => !previousKeys.has(k))
    const removedKeys = [...previousKeys].filter(k => !currentKeys.has(k))

    if (addedKeys.length > 0 || removedKeys.length > 0) {
      changes.hasChanges = true
      changes.changeTypes.push('structural')
      changes.details.structural = {
        addedFields: addedKeys,
        removedFields: removedKeys
      }

      debug(`🏗️ Cambios estructurales: +${addedKeys.length}, -${removedKeys.length}`)
    }
  }

  /**
   * Genera un delta (diferencia) optimizado para sincronización
   * @param {Object} changes Cambios detectados
   * @returns {Object} Delta compacto
   */
  generateDelta(changes) {
    if (!changes.hasChanges) {
      return null
    }

    const delta = {
      campaignId: changes.campaignId,
      campaignName: changes.campaignName,
      timestamp: changes.timestamp,
      changeTypes: changes.changeTypes,
      size: 0,
      operations: []
    }

    // Generar operaciones para campos básicos
    Object.entries(changes.details.basic || {}).forEach(([field, change]) => {
      delta.operations.push({
        type: 'update_field',
        path: field,
        value: change.value,
        size: JSON.stringify(change.value).length
      })
      delta.size += delta.operations[delta.operations.length - 1].size
    })

    // Generar operaciones para entidades
    Object.entries(changes.details.entities || {}).forEach(([entityType, entityChanges]) => {
      entityChanges.forEach(entityChange => {
        let operation = {
          type: `${entityChange.type}_entity`,
          entityType,
          entityId: entityChange.id
        }

        switch (entityChange.type) {
          case 'added':
            operation.entity = entityChange.entity
            break
          case 'modified':
            operation.entity = entityChange.entity
            operation.fieldChanges = entityChange.fieldChanges
            break
          case 'deleted':
            // Solo necesitamos el ID para eliminar
            break
        }

        operation.size = JSON.stringify(operation).length
        delta.size += operation.size
        delta.operations.push(operation)
      })
    })

    debug(`📦 Delta generado: ${delta.operations.length} operaciones, ${delta.size} bytes`)
    return delta
  }

  /**
   * Aplica un delta a una campaña existente
   * @param {Object} campaign Campaña base
   * @param {Object} delta Delta a aplicar
   * @returns {Object} Campaña actualizada
   */
  applyDelta(campaign, delta) {
    if (!delta || !delta.operations) {
      return campaign
    }

    let updatedCampaign = { ...campaign }

    delta.operations.forEach(operation => {
      switch (operation.type) {
        case 'update_field':
          updatedCampaign[operation.path] = operation.value
          break

        case 'added_entity':
          if (!updatedCampaign[operation.entityType]) {
            updatedCampaign[operation.entityType] = []
          }
          updatedCampaign[operation.entityType].push(operation.entity)
          break

        case 'modified_entity':
          const entityArray = updatedCampaign[operation.entityType] || []
          const entityIndex = entityArray.findIndex(e => e.id === operation.entityId)
          if (entityIndex !== -1) {
            entityArray[entityIndex] = operation.entity
          }
          break

        case 'deleted_entity':
          if (updatedCampaign[operation.entityType]) {
            updatedCampaign[operation.entityType] = updatedCampaign[operation.entityType]
              .filter(e => e.id !== operation.entityId)
          }
          break
      }
    })

    // Actualizar metadatos
    updatedCampaign.lastModified = new Date().toISOString()
    updatedCampaign.deltaApplied = {
      timestamp: delta.timestamp,
      operationsCount: delta.operations.length,
      deltaSize: delta.size
    }

    debug(`🔧 Delta aplicado a '${campaign.name}': ${delta.operations.length} operaciones`)
    return updatedCampaign
  }

  // Métodos auxiliares...
  calculateChecksum(obj) {
    const str = JSON.stringify(obj, Object.keys(obj).sort())
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(16)
  }

  calculateFieldHashes(campaign) {
    const hashes = {}
    const fields = ['name', 'description', 'setting', 'theme', 'rules', 'notes']
    
    fields.forEach(field => {
      hashes[field] = campaign[field] ? this.calculateChecksum(campaign[field]) : null
    })
    
    return hashes
  }

  getEntityCounts(campaign) {
    const counts = {}
    const entityTypes = ['players', 'npcs', 'locations', 'quests', 'objects', 'notes']
    
    entityTypes.forEach(type => {
      counts[type] = (campaign[type] || []).length
    })
    
    return counts
  }

  createEmptyChangeSet() {
    return {
      hasChanges: false,
      changeTypes: [],
      details: { basic: {}, entities: {}, metadata: {}, structural: {} },
      summary: { fieldsChanged: 0, entitiesAdded: 0, entitiesModified: 0, entitiesDeleted: 0, totalSize: 0 }
    }
  }

  createFullChangeSet(campaign, reason) {
    return {
      campaignId: campaign.id,
      campaignName: campaign.name,
      hasChanges: true,
      changeTypes: ['full_sync'],
      reason,
      timestamp: new Date().toISOString(),
      details: { full: campaign },
      summary: { 
        fieldsChanged: 1,
        entitiesAdded: Object.values(campaign).filter(Array.isArray).reduce((sum, arr) => sum + arr.length, 0),
        entitiesModified: 0,
        entitiesDeleted: 0,
        totalSize: JSON.stringify(campaign).length
      }
    }
  }

  getPreviousEntities(campaignId, entityType) {
    const changeLog = this.changeLog.get(campaignId)
    if (!changeLog || !changeLog.length) return null

    // Buscar la última entrada que tenga entidades de este tipo
    for (let i = changeLog.length - 1; i >= 0; i--) {
      const entry = changeLog[i]
      if (entry.entities && entry.entities[entityType]) {
        return entry.entities[entityType]
      }
    }
    
    return null
  }

  logChange(campaignId, changes) {
    if (!this.changeLog.has(campaignId)) {
      this.changeLog.set(campaignId, [])
    }

    const log = this.changeLog.get(campaignId)
    log.push({
      timestamp: changes.timestamp,
      changeTypes: changes.changeTypes,
      summary: changes.summary
    })

    // Mantener solo los últimos 10 cambios por campaña
    if (log.length > 10) {
      log.splice(0, log.length - 10)
    }
  }

  /**
   * Obtiene estadísticas del tracker
   */
  getStats() {
    return {
      trackedCampaigns: this.snapshots.size,
      totalChangeLogs: this.changeLog.size,
      trackingEnabled: this.trackingEnabled,
      memoryUsage: {
        snapshots: JSON.stringify([...this.snapshots.values()]).length,
        changeLogs: JSON.stringify([...this.changeLog.values()]).length
      }
    }
  }

  /**
   * Limpia datos antiguos para optimizar memoria
   */
  cleanup(olderThanDays = 7) {
    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000)
    let cleaned = 0

    // Limpiar snapshots antiguos
    for (const [id, snapshot] of this.snapshots.entries()) {
      if (new Date(snapshot.timestamp).getTime() < cutoffTime) {
        this.snapshots.delete(id)
        cleaned++
      }
    }

    // Limpiar change logs antiguos
    for (const [id, logs] of this.changeLog.entries()) {
      const filteredLogs = logs.filter(log => 
        new Date(log.timestamp).getTime() >= cutoffTime
      )
      
      if (filteredLogs.length === 0) {
        this.changeLog.delete(id)
      } else {
        this.changeLog.set(id, filteredLogs)
      }
    }

    debug(`🧹 Cleanup completado: ${cleaned} entradas eliminadas`)
    return cleaned
  }
}

// Exportar instancia singleton
export const changeTracker = new ChangeTracker()
export default changeTracker