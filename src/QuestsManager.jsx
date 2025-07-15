import React, { useState, useEffect } from 'react'
import { useCRUD } from './hooks/useCRUD.jsx'
import ConnectionsDisplay from './components/ConnectionsDisplay'
import Modal from './components/Modal'
import CompactList from './components/CompactList'

function QuestsManager({ campaign, connections, selectedItemForNavigation, updateCampaign }) {
  // ✨ Hook CRUD usando datos de la campaña
  const {
    items: quests,
    showForm,
    editingItem,
    selectedItem: selectedQuest,
    isEmpty,
    handleSave: handleSaveInternal,
    handleDelete: handleDeleteInternal,
    selectItem: selectQuest,
    openCreateForm,
    openEditForm,
    closeForm,
    closeDetails,
    NotificationComponent
  } = useCRUD(campaign.quests || [], 'Misión')

  // ✅ Función mejorada para guardar que actualiza la campaña
  const handleSave = (itemData) => {
    const savedItem = handleSaveInternal(itemData)
    if (savedItem && updateCampaign) {
      updateCampaign({
        quests: editingItem 
          ? campaign.quests.map(quest => quest.id === savedItem.id ? savedItem : quest)
          : [...(campaign.quests || []), savedItem]
      })
    }
  }

  // ✅ Función mejorada para eliminar que actualiza la campaña
  const handleDelete = (id, name) => {
    handleDeleteInternal(id, name)
    if (updateCampaign) {
      updateCampaign({
        quests: (campaign.quests || []).filter(quest => quest.id !== id)
      })
    }
  }

  // ✨ Efecto para seleccionar automáticamente una misión cuando se navega desde conexiones
  useEffect(() => {
    if (selectedItemForNavigation && selectedItemForNavigation.type === 'quests') {
      const questToSelect = quests.find(quest => quest.id === selectedItemForNavigation.item.id)
      if (questToSelect) {
        selectQuest(questToSelect)
      }
    }
  }, [selectedItemForNavigation, quests, selectQuest])

  return (
    <div className="fade-in">
      {/* ✨ Componente de notificación */}
      <NotificationComponent />

      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h2 style={{ 
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            margin: 0
          }}>
            📜 Misiones
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>
            Las aventuras y objetivos de {campaign.name}
          </p>
        </div>
        <button onClick={openCreateForm} className="btn-primary">
          ➕ Añadir Misión
        </button>
      </div>

      {/* Lista compacta de misiones */}
      <CompactList
        items={quests}
        itemType="quests"
        onSelectItem={selectQuest}
        getConnectionCount={connections?.getConnectionCount}
        emptyMessage="No hay misiones aún. ¡Crea la primera aventura de tu campaña!"
        emptyIcon="📜"
      />

      {/* Modal de formulario */}
      <Modal
        isOpen={showForm}
        onClose={closeForm}
        title={editingItem ? 'Editar Misión' : 'Nueva Misión'}
        size="large"
      >
        <QuestForm
          quest={editingItem}
          onSave={handleSave}
          onClose={closeForm}
        />
      </Modal>

      {/* Modal de detalles */}
      <Modal
        isOpen={!!selectedQuest}
        onClose={closeDetails}
        title={selectedQuest?.name}
        size="large"
      >
        {selectedQuest && (
          <QuestDetails
            quest={selectedQuest}
            onClose={closeDetails}
            onEdit={() => openEditForm(selectedQuest)}
            onDelete={() => handleDelete(selectedQuest.id, selectedQuest.name)}
            connections={connections}
            campaign={campaign}
          />
        )}
      </Modal>
    </div>
  )
}

// Panel de detalles de la misión seleccionada
function QuestDetails({ quest, onClose, onEdit, onDelete, connections, campaign }) {
  // Obtener elementos conectados
  const linkedItems = connections?.getLinkedItems(quest) || {}

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completada': return '#10b981'
      case 'En progreso': return '#f59e0b'
      case 'Pendiente': return '#6b7280'
      case 'Fallida': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta': return '#ef4444'
      case 'Media': return '#f59e0b'
      case 'Baja': return '#10b981'
      default: return '#6b7280'
    }
  }

  return (
    <div>
      {/* Información básica */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '3rem' }}>
            {quest.icon || '📜'}
          </div>
          <div>
            <h3 style={{ color: 'white', margin: 0, fontSize: '1.5rem' }}>
              {quest.name}
            </h3>
            
            {/* Estado y prioridad */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              {quest.status && (
                <span style={{
                  padding: '0.5rem 1rem',
                  background: `${getStatusColor(quest.status)}20`,
                  color: getStatusColor(quest.status),
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  {quest.status === 'Completada' && '✅ '} 
                  {quest.status === 'En progreso' && '⏳ '} 
                  {quest.status === 'Pendiente' && '⏸️ '} 
                  {quest.status === 'Fallida' && '❌ '} 
                  {quest.status}
                </span>
              )}
              
              {quest.priority && (
                <span style={{
                  padding: '0.5rem 1rem',
                  background: `${getPriorityColor(quest.priority)}20`,
                  color: getPriorityColor(quest.priority),
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  {quest.priority === 'Alta' && '🔥 '} 
                  {quest.priority === 'Media' && '⭐ '} 
                  {quest.priority === 'Baja' && '💫 '} 
                  {quest.priority}
                </span>
              )}
            </div>
          </div>
        </div>

        {quest.description && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Descripción</h4>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {quest.description}
            </p>
          </div>
        )}

        {quest.location && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Ubicación</h4>
            <p style={{ color: 'var(--text-secondary)' }}>
              📍 {quest.location}
            </p>
          </div>
        )}

        {quest.reward && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Recompensa</h4>
            <p style={{ color: 'var(--text-secondary)' }}>
              💰 {quest.reward}
            </p>
          </div>
        )}
      </div>

      {/* Notas del DM */}
      {quest.notes && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Notas del DM</h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {quest.notes}
          </p>
        </div>
      )}

      {/* 🔗 SISTEMA DE CONEXIONES */}
      {connections && (
        <div style={{ marginBottom: '2rem' }}>
          <ConnectionsDisplay
            item={quest}
            itemType="quests"
            linkedItems={linkedItems}
            onRemoveConnection={connections.removeConnection}
            onOpenConnectionModal={connections.openConnectionModal}
            onNavigateToItem={connections.navigateToItem}
          />
        </div>
      )}

      {/* Acciones */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={onEdit}
          className="btn-primary"
          style={{ flex: 1 }}
        >
          ✏️ Editar
        </button>
        <button
          onClick={onDelete}
          style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            color: '#ef4444',
            padding: '0.75rem 1rem',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          🗑️
        </button>
      </div>
    </div>
  )
}

// Formulario para crear/editar misiones
function QuestForm({ quest, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: quest?.name || '',
    description: quest?.description || '',
    status: quest?.status || 'Pendiente',
    priority: quest?.priority || 'Media',
    location: quest?.location || '',
    reward: quest?.reward || '',
    notes: quest?.notes || '',
    icon: quest?.icon || '📜'
  })

  const [errors, setErrors] = useState({})

  // Opciones para selects
  const statusOptions = ['Pendiente', 'En progreso', 'Completada', 'Fallida']
  const priorityOptions = ['Alta', 'Media', 'Baja']

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Limpiar error si el campo ahora tiene valor
    if (errors[name] && value.trim()) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validaciones
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio'
    if (!formData.description.trim()) newErrors.description = 'La descripción es obligatoria'
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0) {
      onSave(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{
        display: 'grid',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Nombre */}
        <div>
          <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
            Nombre de la misión *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ej: Recuperar el Amuleto Perdido"
            className="input-field"
            style={{
              borderColor: errors.name ? '#ef4444' : undefined
            }}
          />
          {errors.name && (
            <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>
              {errors.name}
            </p>
          )}
        </div>

        {/* Descripción */}
        <div>
          <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
            Descripción *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe la misión: objetivos, contexto, lo que deben hacer los jugadores..."
            className="input-field"
            style={{ 
              minHeight: '100px', 
              resize: 'vertical',
              borderColor: errors.description ? '#ef4444' : undefined
            }}
          />
          {errors.description && (
            <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>
              {errors.description}
            </p>
          )}
        </div>

        {/* Estado y Prioridad */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
              Estado
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-field"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
              Prioridad
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="input-field"
            >
              {priorityOptions.map(priority => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ubicación */}
        <div>
          <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
            Ubicación
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="¿Dónde tiene lugar esta misión?"
            className="input-field"
          />
        </div>

        {/* Recompensa */}
        <div>
          <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
            Recompensa
          </label>
          <input
            type="text"
            name="reward"
            value={formData.reward}
            onChange={handleChange}
            placeholder="Ej: 1000 monedas de oro + Espada mágica"
            className="input-field"
          />
        </div>

        {/* Notas */}
        <div>
          <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
            Notas del DM
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Pistas, secretos, información adicional para el DM..."
            className="input-field"
            style={{ minHeight: '80px', resize: 'vertical' }}
          />
        </div>
      </div>

      {/* Botones */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginTop: '2rem',
        justifyContent: 'flex-end'
      }}>
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn-primary"
        >
          {quest ? '💾 Guardar Cambios' : '➕ Crear Misión'}
        </button>
      </div>
    </form>
  )
}

export default QuestsManager