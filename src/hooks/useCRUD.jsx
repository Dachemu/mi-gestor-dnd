import { useState, useEffect } from 'react'
import { generateId } from '../services/storage'
import { useNotification } from './useNotification.jsx'
import changeTracker from '../services/changeTracker'

/**
 * Hook personalizado para manejar operaciones CRUD de manera uniforme
 * Elimina código duplicado entre todos los gestores
 * ✅ SIMPLIFICADO: Versión más estable sin optimizaciones complejas
 */
export function useCRUD(initialData = [], itemName = 'elemento', entityConfig = null, entityType = '', updateCampaign = null) {
  // Estados principales
  const [items, setItems] = useState(initialData || [])
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  
  // Hook de notificaciones
  const { showNotification, NotificationComponent } = useNotification()

  // Sincronizar SIEMPRE que initialData cambie externamente (incluye arrays vacíos)
  useEffect(() => {
    if (Array.isArray(initialData)) {
      setItems(initialData)
    }
  }, [initialData])

  // Función para inicializar linkedItems si no existe
  const ensureLinkedItems = (item) => {
    if (!item.linkedItems || typeof item.linkedItems !== 'object') {
      return {
        ...item,
        linkedItems: {
          locations: [],
          players: [],
          npcs: [],
          quests: [],
          objects: [],
          notes: []
        }
      }
    }
    return item
  }

  // Marcar cambios pendientes cuando hay modificaciones
  const markSyncChanges = (campaignData = null) => {
    try {
      if (campaignData) {
        changeTracker.detectChanges(campaignData)
      }
    } catch (error) {
      // Silenciar errores de sync para no interrumpir el flujo normal
      console.debug('Sync service not available:', error.message)
    }
  }

  // Guardar (crear o editar) - simplificado para evitar problemas con useCallback
  const handleSave = (itemData) => {
    // Agregar icono fijo para notas si corresponde
    if (entityConfig && entityConfig.fixedIcon) {
      itemData = { ...itemData, icon: entityConfig.fixedIcon }
    }
    
    // Determinar si es creación o edición
    // Caso 1: Modo edición (formulario modal)
    if (editingItem) {
      const updatedItem = ensureLinkedItems({
        ...itemData,
        id: editingItem.id,
        createdAt: editingItem.createdAt,
        lastModified: new Date().toISOString()
      })
      
      setItems(prev => prev.map(item => 
        item.id === editingItem.id ? updatedItem : item
      ))
      
      // Actualizar selectedItem si es el mismo que se está editando
      if (selectedItem?.id === editingItem.id) {
        setSelectedItem(updatedItem)
      }
      
      setEditingItem(null)
      setShowForm(false)
      markSyncChanges()
      showNotification(`${itemName} "${itemData.name || itemData.title}" actualizado`)
      return updatedItem
    }
    
    // Caso 2: Edición inline (itemData tiene ID existente)
    if (itemData.id && items.some(item => item.id === itemData.id)) {
      const updatedItems = items.map(item => 
        item.id === itemData.id 
          ? { ...item, ...itemData, lastModified: new Date().toISOString() }
          : item
      )
      
      setItems(updatedItems)
      updateCampaign?.({ [entityType]: updatedItems })
      setShowForm(false)
      markSyncChanges()
      showNotification(`${itemName} "${itemData.name || itemData.title}" actualizado`)
      
      return updatedItems.find(item => item.id === itemData.id)
    }
    
    // Caso 3: Creación nueva
    const newItem = ensureLinkedItems({
      ...itemData,
      id: generateId(),
      createdAt: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString()
    })
    
    const updatedItems = [...items, newItem]
    setItems(updatedItems)
    updateCampaign?.({ [entityType]: updatedItems })
    setShowForm(false)
    markSyncChanges()
    showNotification(`${itemName} "${newItem.name || newItem.title}" creado exitosamente`)
    return newItem
  }

  // Eliminar elemento
  const handleDelete = (id, name) => {
    const updatedItems = items.filter(item => item.id !== id)
    setItems(updatedItems)
    updateCampaign?.({ [entityType]: updatedItems })
    
    // Si el elemento eliminado estaba seleccionado, deseleccionar
    if (selectedItem?.id === id) {
      setSelectedItem(null)
    }
    
    markSyncChanges()
    showNotification(`${itemName} "${name}" eliminado`)
  }

  // Seleccionar elemento para ver detalles
  const selectItem = (item) => {
    setSelectedItem(item)
  }

  // Abrir formulario para crear
  const openCreateForm = () => {
    setEditingItem(null)
    setShowForm(true)
  }

  // Abrir formulario para editar
  const openEditForm = (item) => {
    setEditingItem(item)
    setShowForm(true)
  }

  // Cerrar formulario
  const closeForm = () => {
    setShowForm(false)
    setEditingItem(null)
  }

  // Cerrar detalles
  const closeDetails = () => {
    setSelectedItem(null)
  }

  // Reordenar elementos (para drag & drop)
  const handleReorder = (newOrder) => {
    setItems(newOrder)
    updateCampaign?.({ [entityType]: newOrder })
    markSyncChanges()
  }

  // Estado vacío
  const isEmpty = items.length === 0

  // ✅ COMPONENTE DE NOTIFICACIÓN ahora viene del hook centralizado

  return {
    // Estados
    items,
    showForm,
    editingItem,
    selectedItem,
    isEmpty,

    // Acciones principales
    handleSave,
    handleDelete,
    selectItem,
    handleReorder,

    // Acciones de formulario
    openCreateForm,
    openEditForm,
    closeForm,
    closeDetails,

    // Utilidades
    showNotification,

    // ✅ Componente de notificación
    NotificationComponent
  }
}