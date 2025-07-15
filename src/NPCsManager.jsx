import React, { useState, useEffect } from 'react'
import { useCRUD } from './hooks/useCRUD.jsx'
import ConnectionsDisplay from './components/ConnectionsDisplay'
import Modal from './components/Modal'
import CompactList from './components/CompactList'

function NPCsManager({ campaign, connections, selectedItemForNavigation, updateCampaign }) {
  // ✨ Hook CRUD para manejar todos los estados - USA DATOS DE LA CAMPAÑA
  const {
    items: npcs,
    showForm,
    editingItem,
    selectedItem: selectedNPC,
    isEmpty,
    handleSave: handleSaveInternal,
    handleDelete: handleDeleteInternal,
    selectItem: selectNPC,
    openCreateForm,
    openEditForm,
    closeForm,
    closeDetails,
    NotificationComponent
  } = useCRUD(campaign.npcs || [], 'NPC')

  // ✅ Función mejorada para guardar que actualiza la campaña
  const handleSave = (itemData) => {
    const savedItem = handleSaveInternal(itemData)
    if (savedItem && updateCampaign) {
      updateCampaign({
        npcs: editingItem 
          ? campaign.npcs.map(npc => npc.id === savedItem.id ? savedItem : npc)
          : [...campaign.npcs, savedItem]
      })
    }
  }

  // ✅ Función mejorada para eliminar que actualiza la campaña
  const handleDelete = (id, name) => {
    handleDeleteInternal(id, name)
    if (updateCampaign) {
      updateCampaign({
        npcs: campaign.npcs.filter(npc => npc.id !== id)
      })
    }
  }

  // ✨ Efecto para seleccionar automáticamente un NPC cuando se navega desde conexiones
  useEffect(() => {
    if (selectedItemForNavigation && selectedItemForNavigation.type === 'npcs') {
      const npcToSelect = npcs.find(npc => npc.id === selectedItemForNavigation.item.id)
      if (npcToSelect) {
        selectNPC(npcToSelect)
      }
    }
  }, [selectedItemForNavigation, npcs, selectNPC])

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
            🧙 NPCs
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>
            Los personajes que dan vida al mundo de {campaign.name}
          </p>
        </div>
        <button onClick={openCreateForm} className="btn-primary">
          ➕ Añadir NPC
        </button>
      </div>

      {/* Lista compacta de NPCs */}
      <CompactList
        items={npcs}
        itemType="npcs"
        onSelectItem={selectNPC}
        onEditItem={openEditForm}
        onDeleteItem={handleDelete}
        onOpenConnections={connections?.openConnectionModal}
        getConnectionCount={connections?.getConnectionCount}
        emptyMessage="No hay NPCs aún. ¡Añade el primer personaje de tu campaña!"
        emptyIcon="🧙"
      />

      {/* Modal de formulario */}
      <Modal
        isOpen={showForm}
        onClose={closeForm}
        title={editingItem ? 'Editar NPC' : 'Nuevo NPC'}
        size="large"
      >
        <NPCForm
          npc={editingItem}
          onSave={handleSave}
          onClose={closeForm}
        />
      </Modal>

      {/* Modal de detalles */}
      <Modal
        isOpen={!!selectedNPC}
        onClose={closeDetails}
        title={selectedNPC?.name}
        size="large"
      >
        {selectedNPC && (
          <NPCDetails
            npc={selectedNPC}
            onClose={closeDetails}
            onEdit={() => openEditForm(selectedNPC)}
            onDelete={() => handleDelete(selectedNPC.id, selectedNPC.name)}
            connections={connections}
            campaign={campaign}
          />
        )}
      </Modal>
    </div>
  )
}

// Panel de detalles del NPC seleccionado
function NPCDetails({ npc, onClose, onEdit, onDelete, connections, campaign }) {
  // Obtener elementos conectados
  const linkedItems = connections?.getLinkedItems(npc) || {}

  return (
    <div>
      {/* Información básica */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '3rem' }}>
            {npc.icon || '👤'}
          </div>
          <div>
            <h3 style={{ color: 'white', margin: 0, fontSize: '1.5rem' }}>
              {npc.name}
            </h3>
            <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
              {npc.role}
            </p>
          </div>
        </div>

        {npc.description && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Descripción</h4>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {npc.description}
            </p>
          </div>
        )}

        {npc.location && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Ubicación</h4>
            <p style={{ color: 'var(--text-secondary)' }}>
              📍 {npc.location}
            </p>
          </div>
        )}

        {npc.attitude && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Actitud</h4>
            <span style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              background: npc.attitude === 'Amistoso' 
                ? 'rgba(16, 185, 129, 0.2)' 
                : npc.attitude === 'Hostil' 
                  ? 'rgba(239, 68, 68, 0.2)' 
                  : 'rgba(139, 92, 246, 0.2)',
              color: npc.attitude === 'Amistoso' 
                ? '#10b981' 
                : npc.attitude === 'Hostil' 
                  ? '#ef4444' 
                  : '#8b5cf6',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
            {npc.attitude === 'Amistoso' && '😊 '} 
            {npc.attitude === 'Hostil' && '😠 '} 
            {npc.attitude === 'Neutral' && '😐 '} 
            {npc.attitude}
          </span>
          </div>
        )}
      </div>

      {/* Notas del DM */}
      {npc.notes && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Notas del DM</h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {npc.notes}
          </p>
        </div>
      )}

      {/* 🔗 SISTEMA DE CONEXIONES CON NAVEGACIÓN */}
      {connections && (
        <div style={{ marginBottom: '2rem' }}>
          <ConnectionsDisplay
            item={npc}
            itemType="npcs"
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

// Formulario para crear/editar NPCs
function NPCForm({ npc, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: npc?.name || '',
    role: npc?.role || '',
    description: npc?.description || '',
    location: npc?.location || '',
    attitude: npc?.attitude || 'Neutral',
    notes: npc?.notes || '',
    icon: npc?.icon || '👤'
  })

  const [errors, setErrors] = useState({})

  // Opciones para el select de actitud
  const attitudeOptions = ['Amistoso', 'Neutral', 'Hostil', 'Desconfiado', 'Servicial']

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
    if (!formData.role.trim()) newErrors.role = 'El rol es obligatorio'
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
            Nombre *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ej: Maestro Elrond"
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

        {/* Rol */}
        <div>
          <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
            Rol o Profesión *
          </label>
          <input
            type="text"
            name="role"
            value={formData.role}
            onChange={handleChange}
            placeholder="Ej: Posadero, Comerciante, Guardia..."
            className="input-field"
            style={{
              borderColor: errors.role ? '#ef4444' : undefined
            }}
          />
          {errors.role && (
            <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>
              {errors.role}
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
            placeholder="Apariencia física, personalidad, trasfondo..."
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

        {/* Ubicación */}
        <div>
          <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
            Ubicación habitual
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="¿Dónde se le puede encontrar normalmente?"
            className="input-field"
          />
        </div>

        {/* Actitud */}
        <div>
          <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
            Actitud hacia los jugadores
          </label>
          <select
            name="attitude"
            value={formData.attitude}
            onChange={handleChange}
            className="input-field"
          >
            {attitudeOptions.map(attitude => (
              <option key={attitude} value={attitude}>
                {attitude}
              </option>
            ))}
          </select>
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
            placeholder="Secretos, motivaciones, conexiones con otros personajes..."
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
          {npc ? '💾 Guardar Cambios' : '➕ Crear NPC'}
        </button>
      </div>
    </form>
  )
}

export default NPCsManager