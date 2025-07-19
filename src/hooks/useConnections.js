import { useState, useCallback } from 'react'
import { debug } from '../utils/logger'

// ✨ Función para obtener tipo de relación inversa
const getInverseRelationship = (relationshipType) => {
  const inverseMap = {
    ally: 'ally',
    enemy: 'enemy',
    mentor: 'serves', // El mentor es servido por el estudiante
    serves: 'mentor', // El que sirve tiene un mentor
    rival: 'rival',
    family: 'family',
    romantic: 'romantic',
    business: 'business',
    secret: 'secret',
    location: 'owns', // Si A está ubicado en B, entonces B posee a A
    owns: 'location', // Si A posee B, entonces B está ubicado en A
    created: 'general', // Relación general para lo creado
    destroyed: 'general', // Relación general para lo destruido
    general: 'general'
  }
  return inverseMap[relationshipType] || 'general'
}

// ✨ Tipos de relación narrativa para organización
export const RELATIONSHIP_TYPES = {
  general: { name: 'General', icon: '🔗', color: '#6b7280' },
  ally: { name: 'Aliado', icon: '🤝', color: '#10b981' },
  enemy: { name: 'Enemigo', icon: '⚔️', color: '#ef4444' },
  mentor: { name: 'Mentor', icon: '🎓', color: '#8b5cf6' },
  rival: { name: 'Rival', icon: '🥊', color: '#f59e0b' },
  family: { name: 'Familia', icon: '👨‍👩‍👧‍👦', color: '#ec4899' },
  romantic: { name: 'Romance', icon: '💕', color: '#f43f5e' },
  business: { name: 'Negocio', icon: '💼', color: '#06b6d4' },
  secret: { name: 'Secreto', icon: '🤫', color: '#64748b' },
  location: { name: 'Ubicado en', icon: '📍', color: '#3b82f6' },
  owns: { name: 'Posee', icon: '🏠', color: '#84cc16' },
  serves: { name: 'Sirve a', icon: '🛡️', color: '#a855f7' },
  created: { name: 'Creó', icon: '🔨', color: '#f97316' },
  destroyed: { name: 'Destruyó', icon: '💥', color: '#dc2626' }
}

/**
 * Hook para manejar las conexiones entre elementos de la campaña
 * Permite conectar cualquier tipo de elemento con cualquier otro
 * ✨ MEJORADO: Ahora incluye tipos de relación narrativa
 */
export function useConnections(campaign, updateCampaign) {
  const [showConnectionModal, setShowConnectionModal] = useState(false)
  const [connectionSource, setConnectionSource] = useState(null)

  // Crear conexión bidireccional entre dos elementos con tipo de relación
  const createConnection = useCallback((sourceItem, sourceType, targetItem, targetType, relationshipType = 'general', context = '') => {
    if (!campaign || !updateCampaign) return

    debug('Conectando:', sourceItem.name, 'con', targetItem.name)

    const updates = { ...campaign }

    // Actualizar item fuente
    const sourceItems = [...(updates[sourceType] || [])]
    const sourceIndex = sourceItems.findIndex(item => item.id === sourceItem.id)
    
    if (sourceIndex !== -1) {
      if (!sourceItems[sourceIndex].linkedItems) {
        sourceItems[sourceIndex].linkedItems = {}
      }
      if (!sourceItems[sourceIndex].linkedItems[targetType]) {
        sourceItems[sourceIndex].linkedItems[targetType] = []
      }
      
      // Crear objeto de conexión con tipo de relación
      const connectionData = {
        id: targetItem.id,
        relationshipType,
        context,
        createdAt: new Date().toISOString()
      }
      
      // Evitar duplicados (verificar por ID)
      if (!sourceItems[sourceIndex].linkedItems[targetType].some(conn => conn.id === targetItem.id)) {
        sourceItems[sourceIndex].linkedItems[targetType].push(connectionData)
      }
      updates[sourceType] = sourceItems
    }

    // Actualizar item destino (conexión bidireccional)
    const targetItems = [...(updates[targetType] || [])]
    const targetIndex = targetItems.findIndex(item => item.id === targetItem.id)
    
    if (targetIndex !== -1) {
      if (!targetItems[targetIndex].linkedItems) {
        targetItems[targetIndex].linkedItems = {}
      }
      if (!targetItems[targetIndex].linkedItems[sourceType]) {
        targetItems[targetIndex].linkedItems[sourceType] = []
      }
      
      // Crear objeto de conexión inversa
      const inverseConnectionData = {
        id: sourceItem.id,
        relationshipType: getInverseRelationship(relationshipType),
        context,
        createdAt: new Date().toISOString()
      }
      
      // Evitar duplicados (verificar por ID)
      if (!targetItems[targetIndex].linkedItems[sourceType].some(conn => conn.id === sourceItem.id)) {
        targetItems[targetIndex].linkedItems[sourceType].push(inverseConnectionData)
      }
      updates[targetType] = targetItems
    }

    updateCampaign(updates)
  }, [campaign, updateCampaign])

  // Eliminar conexión bidireccional entre dos elementos
  const removeConnection = useCallback((sourceItem, sourceType, targetItem, targetType) => {
    if (!campaign || !updateCampaign) return

    debug('Desconectando:', sourceItem.name, 'de', targetItem.name)

    const updates = { ...campaign }

    // Remover del item fuente
    const sourceItems = [...(updates[sourceType] || [])]
    const sourceIndex = sourceItems.findIndex(item => item.id === sourceItem.id)
    
    if (sourceIndex !== -1 && sourceItems[sourceIndex].linkedItems?.[targetType]) {
      sourceItems[sourceIndex].linkedItems[targetType] = 
        sourceItems[sourceIndex].linkedItems[targetType].filter(conn => {
          // Compatibilidad: conn puede ser ID (legacy) o objeto
          const connId = typeof conn === 'object' ? conn.id : conn
          return connId !== targetItem.id
        })
      updates[sourceType] = sourceItems
    }

    // Remover del item destino
    const targetItems = [...(updates[targetType] || [])]
    const targetIndex = targetItems.findIndex(item => item.id === targetItem.id)
    
    if (targetIndex !== -1 && targetItems[targetIndex].linkedItems?.[sourceType]) {
      targetItems[targetIndex].linkedItems[sourceType] = 
        targetItems[targetIndex].linkedItems[sourceType].filter(conn => {
          // Compatibilidad: conn puede ser ID (legacy) o objeto
          const connId = typeof conn === 'object' ? conn.id : conn
          return connId !== sourceItem.id
        })
      updates[targetType] = targetItems
    }

    updateCampaign(updates)
  }, [campaign, updateCampaign])

  // Obtener elementos conectados a un item específico
  const getLinkedItems = useCallback((item) => {
    if (!campaign || !item || !item.linkedItems) return {}
    
    const linked = {}
    Object.entries(item.linkedItems).forEach(([linkedType, ids]) => {
      // ✅ Protección: verificar que ids sea un array
      if (!Array.isArray(ids)) {
        linked[linkedType] = []
        return
      }
      
      // ✅ Protección: verificar que la campaña tenga ese tipo
      const campaignItems = campaign[linkedType]
      if (!campaignItems || !Array.isArray(campaignItems)) {
        linked[linkedType] = []
        return
      }
      
      // ✅ Buscar elementos existentes y filtrar los que no existen
      linked[linkedType] = ids.map(conn => {
        // Compatibilidad: conn puede ser ID (legacy) o objeto con metadata
        const targetId = typeof conn === 'object' ? conn.id : conn
        const foundItem = campaignItems.find(i => i.id === targetId)
        
        if (foundItem && typeof conn === 'object') {
          // Agregar metadata de la conexión al item encontrado
          return {
            ...foundItem,
            _connectionMeta: {
              relationshipType: conn.relationshipType,
              context: conn.context,
              createdAt: conn.createdAt
            }
          }
        }
        
        return foundItem
      }).filter(Boolean) // Filtrar elementos que ya no existen
    })
    
    return linked
  }, [campaign])

  // Obtener elementos disponibles para conectar (sin los ya conectados)
  const getAvailableItems = useCallback((sourceItem, sourceType, targetType) => {
    if (!campaign || !sourceItem || !targetType) return []
    
    // ✅ Protección: verificar que la campaña tenga elementos de ese tipo
    const campaignItems = campaign[targetType]
    if (!campaignItems || !Array.isArray(campaignItems)) return []
    
    // ✅ Protección: verificar que linkedItems exista y sea un objeto
    const linkedItems = sourceItem.linkedItems || {}
    const existingLinks = linkedItems[targetType] || []
    
    // ✅ Verificar que existingLinks sea un array
    const safeExistingLinks = Array.isArray(existingLinks) ? existingLinks : []
    
    return campaignItems.filter(item => {
      // No conectar consigo mismo
      if (targetType === sourceType && item.id === sourceItem.id) return false
      // No incluir los ya conectados (verificar tanto IDs legacy como objetos)
      return !safeExistingLinks.some(conn => {
        const connId = typeof conn === 'object' ? conn.id : conn
        return connId === item.id
      })
    })
  }, [campaign])

  // Abrir modal de conexiones
  const openConnectionModal = useCallback((item, itemType) => {
    setConnectionSource({ item, type: itemType })
    setShowConnectionModal(true)
  }, [])

  // Cerrar modal de conexiones
  const closeConnectionModal = useCallback(() => {
    setShowConnectionModal(false)
    setConnectionSource(null)
  }, [])

  // Contar total de conexiones de un elemento
  const getConnectionCount = useCallback((item) => {
    if (!item || !item.linkedItems || typeof item.linkedItems !== 'object') return 0
    
    return Object.values(item.linkedItems).reduce((total, links) => {
      // ✅ Protección: verificar que links sea un array
      if (!Array.isArray(links)) return total
      return total + links.length
    }, 0)
  }, [])

  return {
    // Estados
    showConnectionModal,
    connectionSource,
    
    // Acciones
    createConnection,
    removeConnection,
    openConnectionModal,
    closeConnectionModal,
    
    // Utilidades
    getLinkedItems,
    getAvailableItems,
    getConnectionCount
  }
}