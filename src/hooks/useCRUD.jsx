import { useState, useEffect } from 'react'
import { generateId } from '../services/storage'
import { useNotification } from './useNotification.jsx'

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

  // Sincronizar SOLO cuando initialData cambie externamente (ej. cambio de campaña)
  useEffect(() => {
    if (initialData && initialData.length > 0) {
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

  // Función de notificaciones ahora viene del hook centralizado

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
        createdAt: editingItem.createdAt
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
      showNotification(`${itemName} "${itemData.name || itemData.title}" actualizado`)
      return updatedItem
    }
    
    // Caso 2: Edición inline (itemData tiene ID existente)
    if (itemData.id && items.some(item => item.id === itemData.id)) {
      const updatedItems = items.map(item => 
        item.id === itemData.id 
          ? { ...item, ...itemData, modifiedAt: new Date().toISOString() }
          : item
      )
      
      setItems(updatedItems)
      updateCampaign?.(entityType, updatedItems)
      setShowForm(false)
      showNotification(`${itemName} "${itemData.name || itemData.title}" actualizado`)
      
      return updatedItems.find(item => item.id === itemData.id)
    }
    
    // Caso 3: Creación nueva
    const newItem = ensureLinkedItems({
      ...itemData,
      id: generateId(),
      createdAt: new Date().toISOString().split('T')[0]
    })
    
    setItems(prev => [...prev, newItem])
    setShowForm(false)
    showNotification(`${itemName} "${newItem.name || newItem.title}" creado exitosamente`)
    return newItem
  }

  // Eliminar elemento
  const handleDelete = (id, name) => {
    setItems(prev => prev.filter(item => item.id !== id))
    
    // Si el elemento eliminado estaba seleccionado, deseleccionar
    if (selectedItem?.id === id) {
      setSelectedItem(null)
    }
    
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