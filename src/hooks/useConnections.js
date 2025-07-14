import { useState, useCallback } from 'react'

/**
 * Hook para manejar las conexiones entre elementos de la campaña
 * Permite conectar cualquier tipo de elemento con cualquier otro
 */
export function useConnections(campaign, updateCampaign) {
  const [showConnectionModal, setShowConnectionModal] = useState(false)
  const [connectionSource, setConnectionSource] = useState(null)

  // Crear conexión bidireccional entre dos elementos
  const createConnection = useCallback((sourceItem, sourceType, targetItem, targetType) => {
    if (!campaign || !updateCampaign) return

    console.log('Conectando:', sourceItem.name, 'con', targetItem.name)

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
      
      // Evitar duplicados
      if (!sourceItems[sourceIndex].linkedItems[targetType].includes(targetItem.id)) {
        sourceItems[sourceIndex].linkedItems[targetType].push(targetItem.id)
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
      
      // Evitar duplicados
      if (!targetItems[targetIndex].linkedItems[sourceType].includes(sourceItem.id)) {
        targetItems[targetIndex].linkedItems[sourceType].push(sourceItem.id)
      }
      updates[targetType] = targetItems
    }

    updateCampaign(updates)
  }, [campaign, updateCampaign])

  // Eliminar conexión bidireccional entre dos elementos
  const removeConnection = useCallback((sourceItem, sourceType, targetItem, targetType) => {
    if (!campaign || !updateCampaign) return

    console.log('Desconectando:', sourceItem.name, 'de', targetItem.name)

    const updates = { ...campaign }

    // Remover del item fuente
    const sourceItems = [...(updates[sourceType] || [])]
    const sourceIndex = sourceItems.findIndex(item => item.id === sourceItem.id)
    
    if (sourceIndex !== -1 && sourceItems[sourceIndex].linkedItems?.[targetType]) {
      sourceItems[sourceIndex].linkedItems[targetType] = 
        sourceItems[sourceIndex].linkedItems[targetType].filter(id => id !== targetItem.id)
      updates[sourceType] = sourceItems
    }

    // Remover del item destino
    const targetItems = [...(updates[targetType] || [])]
    const targetIndex = targetItems.findIndex(item => item.id === targetItem.id)
    
    if (targetIndex !== -1 && targetItems[targetIndex].linkedItems?.[sourceType]) {
      targetItems[targetIndex].linkedItems[sourceType] = 
        targetItems[targetIndex].linkedItems[sourceType].filter(id => id !== sourceItem.id)
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
      linked[linkedType] = ids.map(id => 
        campaignItems.find(i => i.id === id)
      ).filter(Boolean) // Filtrar elementos que ya no existen
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
      // No incluir los ya conectados
      return !safeExistingLinks.includes(item.id)
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