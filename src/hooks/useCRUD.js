import { useState } from 'react'

/**
 * Hook personalizado para manejar operaciones CRUD de manera uniforme
 * Elimina código duplicado entre todos los gestores
 */
export function useCRUD(initialData = [], itemName = 'elemento') {
  // Estados principales
  const [items, setItems] = useState(initialData)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)

  // Crear nuevo elemento
  const handleCreate = (itemData) => {
    const newItem = {
      ...itemData,
      id: Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    }
    setItems(prev => [...prev, newItem])
    setShowForm(false)
    alert(`¡${itemName} "${newItem.name || newItem.title}" creado exitosamente! 🎉`)
    return newItem
  }

  // Editar elemento existente
  const handleEdit = (itemData) => {
    const updatedItem = {
      ...itemData,
      id: editingItem.id,
      createdAt: editingItem.createdAt
    }
    
    setItems(prev => prev.map(item => 
      item.id === editingItem.id ? updatedItem : item
    ))
    
    // Actualizar selectedItem si es el mismo que se está editando
    if (selectedItem?.id === editingItem.id) {
      setSelectedItem(updatedItem)
    }
    
    setEditingItem(null)
    setShowForm(false)
    alert(`¡${itemName} "${itemData.name || itemData.title}" actualizado! ✨`)
    return updatedItem
  }

  // Eliminar elemento
  const handleDelete = (itemId, itemDisplayName) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${itemDisplayName}"?`)) {
      setItems(prev => prev.filter(item => item.id !== itemId))
      
      // Cerrar panel de detalles si se elimina el elemento seleccionado
      if (selectedItem?.id === itemId) {
        setSelectedItem(null)
      }
      
      alert(`${itemName} "${itemDisplayName}" eliminado`)
      return true
    }
    return false
  }

  // Abrir formulario para editar
  const openEditForm = (item) => {
    setEditingItem(item)
    setShowForm(true)
  }

  // Abrir formulario para crear
  const openCreateForm = () => {
    setEditingItem(null)
    setShowForm(true)
  }

  // Cerrar formulario
  const closeForm = () => {
    setShowForm(false)
    setEditingItem(null)
  }

  // Seleccionar elemento (para panel de detalles)
  const selectItem = (item) => {
    setSelectedItem(item)
  }

  // Cerrar panel de detalles
  const closeDetails = () => {
    setSelectedItem(null)
  }

  // Función para guardar (determina si es crear o editar)
  const handleSave = (itemData) => {
    return editingItem ? handleEdit(itemData) : handleCreate(itemData)
  }

  // Estados derivados
  const isEditing = Boolean(editingItem)
  const isEmpty = items.length === 0

  return {
    // Estados
    items,
    showForm,
    editingItem,
    selectedItem,
    isEditing,
    isEmpty,
    
    // Acciones principales
    handleSave,
    handleDelete,
    selectItem,
    
    // Acciones de formulario
    openCreateForm,
    openEditForm,
    closeForm,
    
    // Acciones de detalles
    closeDetails,
    
    // Setters directos (para casos especiales)
    setItems,
    setSelectedItem,
    setShowForm,
    setEditingItem
  }
}