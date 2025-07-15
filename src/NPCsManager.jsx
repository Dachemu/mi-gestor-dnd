import React, { useState, useEffect } from 'react'
import { useCRUD } from './hooks/useCRUD'
import ConnectionsDisplay from './components/ConnectionsDisplay'
import Notification from './components/Notification' // ✅ Componente separado

function NPCsManager({ campaign, connections, selectedItemForNavigation, updateCampaign }) {
  // ✨ Hook CRUD para manejar todos los estados - USA DATOS DE LA CAMPAÑA
  const {
    items: npcs,
    showForm,
    editingItem,
    selectedItem: selectedNPC,
    isEmpty,
    notification, // ✅ Estado de notificación del hook
    handleSave: handleSaveInternal,
    handleDelete: handleDeleteInternal,
    selectItem: selectNPC,
    openCreateForm,
    openEditForm,
    closeForm,
    closeDetails
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
      {/* ✨ Componente de notificación separado */}
      <Notification notification={notification} />

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

      {/* Vista principal */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: selectedNPC ? '1fr 400px' : '1fr',
        gap: '2rem',
        transition: 'all 0.3s ease'
      }}>
        
        {/* Lista de NPCs */}
        <div>
          {isEmpty ? (
            <EmptyState onAddFirst={openCreateForm} />
          ) : (
            <div style={{
              display: 'grid',
              gap: '1rem'
            }}>
              {npcs.map(npc => (
                <NPCCard
                  key={npc.id}
                  npc={npc}
                  isSelected={selectedNPC?.id === npc.id}
                  onClick={() => selectNPC(npc)}
                  onEdit={() => openEditForm(npc)}
                  onDelete={() => handleDelete(npc.id, npc.name)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Panel de detalles */}
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
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <NPCForm
          npc={editingItem}
          onSave={handleSave}
          onClose={closeForm}
        />
      )}
    </div>
  )
}

// Estado vacío
function EmptyState({ onAddFirst }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '4rem 2rem',
      color: 'var(--text-muted)'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>
        🧙
      </div>
      <h3 style={{ color: 'white', marginBottom: '1rem' }}>
        No hay NPCs aún
      </h3>
      <p style={{ marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
        Los NPCs (Personajes No Jugadores) son la clave para dar vida a tu mundo. 
        Crea comerciantes, nobles, villanos y aliados memorables.
      </p>
      <button onClick={onAddFirst} className="btn-primary">
        🧙 Crear Primer NPC
      </button>
    </div>
  )
}

// Tarjeta de NPC
function NPCCard({ npc, isSelected, onClick, onEdit, onDelete }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: isSelected 
          ? 'rgba(139, 92, 246, 0.2)' 
          : 'rgba(31, 41, 55, 0.5)',
        border: isSelected 
          ? '1px solid rgba(139, 92, 246, 0.5)' 
          : '1px solid rgba(139, 92, 246, 0.1)',
        borderRadius: '12px',
        padding: '1.5rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}
    >
      {/* Avatar/Icono */}
      <div style={{
        fontSize: '2rem',
        flexShrink: 0,
        width: '50px',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(139, 92, 246, 0.2)',
        borderRadius: '10px'
      }}>
        {npc.icon || '👤'}
      </div>

      {/* Información principal */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ 
          color: 'white', 
          margin: '0 0 0.25rem 0',
          fontSize: '1.1rem',
          fontWeight: '600'
        }}>
          {npc.name}
        </h4>
        <p style={{ 
          color: 'var(--text-muted)', 
          margin: '0 0 0.25rem 0',
          fontSize: '0.9rem'
        }}>
          {npc.role}
        </p>
        {npc.location && (
          <p style={{ 
            color: '#6b7280', 
            margin: 0,
            fontSize: '0.8rem'
          }}>
            📍 {npc.location}
          </p>
        )}
        {npc.attitude && (
          <span style={{
            display: 'inline-block',
            marginTop: '0.5rem',
            padding: '0.25rem 0.5rem',
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
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}>
          {npc.attitude === 'Amistoso' && '😊'} 
          {npc.attitude === 'Hostil' && '😠'} 
          {npc.attitude === 'Neutral' && '😐'} 
          {npc.attitude || 'Neutral'}
        </span>
        )}

        {/* Tags */}
        {npc.tags && npc.tags.length > 0 && (
          <div style={{ 
            display: 'flex', 
            gap: '0.25rem', 
            marginTop: '0.5rem',
            flexWrap: 'wrap'
          }}>
            {npc.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                style={{
                  background: 'rgba(139, 92, 246, 0.2)',
                  color: '#a78bfa',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '4px',
                  fontSize: '0.7rem'
                }}
              >
                {tag}
              </span>
            ))}
            {npc.tags.length > 3 && (
              <span style={{
                color: 'var(--text-muted)',
                fontSize: '0.7rem',
                padding: '0.125rem 0.375rem'
              }}>
                +{npc.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Acciones */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem',
        marginLeft: 'auto'
      }}>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit(npc)
          }}
          style={{
            background: 'rgba(139, 92, 246, 0.2)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '6px',
            color: '#a78bfa',
            padding: '0.25rem 0.5rem',
            cursor: 'pointer',
            fontSize: '0.8rem'
          }}
        >
          ✏️
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(npc.id, npc.name)
          }}
          style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '6px',
            color: '#ef4444',
            padding: '0.25rem 0.5rem',
            cursor: 'pointer',
            fontSize: '0.8rem'
          }}
        >
          🗑️
        </button>
      </div>
    </div>
  )
}

// Panel de detalles del NPC seleccionado
function NPCDetails({ npc, onClose, onEdit, onDelete, connections, campaign }) {
  // Obtener elementos conectados
  const linkedItems = connections?.getLinkedItems(npc) || {}

  return (
    <div style={{
      background: 'var(--glass-bg)',
      border: '1px solid var(--glass-border)',
      borderRadius: '16px',
      padding: '2rem',
      position: 'sticky',
      top: '2rem',
      maxHeight: 'calc(100vh - 4rem)',
      overflowY: 'auto'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
        <button
          onClick={onClose}
          style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#ef4444',
            padding: '0.5rem',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
      </div>

      {/* Información básica */}
      <div style={{ marginBottom: '2rem' }}>
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
            onNavigateToItem={connections.navigateToItem} // ✨ Función de navegación
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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: '20px',
        padding: '2rem',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ 
          color: 'white', 
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {npc ? '✏️ Editar NPC' : '🧙 Nuevo NPC'}
        </h2>

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
      </div>
    </div>
  )
}

export default NPCsManager