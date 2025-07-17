import { useState, useEffect } from 'react'
import React from 'react'
import { generateId } from '../services/storage'
import { useNotification } from './useNotification.jsx'

/**
 * Hook personalizado para manejar operaciones CRUD de manera uniforme
 * Elimina código duplicado entre todos los gestores
 * ✅ CORREGIDO: Ahora incluye el componente de notificación
 */
export function useCRUD(initialData = [], itemName = 'elemento', entityConfig = null) {
  // Estados principales
  const [items, setItems] = useState(initialData)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  
  // Hook de notificaciones
  const { showNotification, NotificationComponent } = useNotification()

  // ✅ Sincronizar con datos externos cuando cambien
  useEffect(() => {
    setItems(initialData || [])
  }, [initialData])

  // ✅ Separar la sincronización del selectedItem para evitar bucles
  useEffect(() => {
    if (selectedItem && initialData) {
      const updatedSelectedItem = initialData.find(item => item.id === selectedItem.id)
      if (updatedSelectedItem && JSON.stringify(updatedSelectedItem) !== JSON.stringify(selectedItem)) {
        setSelectedItem(updatedSelectedItem)
      } else if (!updatedSelectedItem) {
        // El elemento seleccionado ya no existe, deseleccionar
        setSelectedItem(null)
      }
    }
  }, [initialData, selectedItem?.id]) // Solo depender del ID para evitar bucles

  // ✅ Función para inicializar linkedItems si no existe
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

  // Crear nuevo elemento
  const handleCreate = (itemData) => {
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

  // Editar elemento existente
  const handleEdit = (itemData) => {
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

  // Guardar (crear o editar)
  const handleSave = (itemData) => {
    // Agregar icono fijo para notas si corresponde
    if (entityConfig && entityConfig.fixedIcon) {
      itemData = { ...itemData, icon: entityConfig.fixedIcon }
    }
    
    if (editingItem) {
      return handleEdit(itemData)
    } else {
      return handleCreate(itemData)
    }
  }

  // Eliminar elemento
  const handleDelete = (id, name) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${name}"?`)) {
      setItems(prev => prev.filter(item => item.id !== id))
      
      // Si el elemento eliminado estaba seleccionado, deseleccionar
      if (selectedItem?.id === id) {
        setSelectedItem(null)
      }
      
      showNotification(`${itemName} "${name}" eliminado`)
    }
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