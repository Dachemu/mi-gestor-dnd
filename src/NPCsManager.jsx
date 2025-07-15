import React, { useState } from 'react'
import { useCRUD } from './hooks/useCRUD'
import ConnectionsDisplay from './components/ConnectionsDisplay'

// 🎯 SIN DATOS DE EJEMPLO - usa directamente los datos de la campaña

function NPCsManager({ campaign, connections }) {
  // ✨ Hook CRUD para manejar todos los estados - USA DATOS DE LA CAMPAÑA
  const {
    items: npcs,
    showForm,
    editingItem,
    selectedItem: selectedNPC,
    isEmpty,
    handleSave,
    handleDelete,
    selectItem: selectNPC,
    openCreateForm,
    openEditForm,
    closeForm,
    closeDetails
  } = useCRUD(campaign.npcs || [], 'NPC')

  return (
    <div className="fade-in">
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
            <NPCsList 
              npcs={npcs}
              onEdit={openEditForm}
              onDelete={handleDelete}
              onSelect={selectNPC}
              selectedId={selectedNPC?.id}
              connections={connections}
            />
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

      {/* Formulario modal */}
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

// Componente de estado vacío
function EmptyState({ onAddFirst }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🧙</div>
      <h3 style={{ color: 'var(--text-muted)', fontSize: '1.5rem', marginBottom: '1rem' }}>
        No hay NPCs creados
      </h3>
      <p style={{ color: 'var(--text-disabled)', marginBottom: '2rem' }}>
        Los NPCs dan vida a tu mundo. Crea personajes memorables que interactúen con tus jugadores.
      </p>
      <button onClick={onAddFirst} className="btn-primary">
        🧙 Crear el primer NPC
      </button>
    </div>
  )
}

// Lista de NPCs
function NPCsList({ npcs, onEdit, onDelete, onSelect, selectedId, connections }) {
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {npcs.map(npc => (
        <NPCCard
          key={npc.id}
          npc={npc}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelect={onSelect}
          isSelected={selectedId === npc.id}
          connectionCount={connections?.getConnectionCount(npc) || 0}
        />
      ))}
    </div>
  )
}

// Tarjeta individual de NPC
function NPCCard({ npc, onEdit, onDelete, onSelect, isSelected, connectionCount }) {
  const attitudeColors = {
    'Amistoso': '#10b981',
    'Neutral': '#6b7280', 
    'Hostil': '#ef4444'
  }

  return (
    <div
      onClick={() => onSelect(npc)}
      style={{
        background: isSelected 
          ? 'rgba(139, 92, 246, 0.15)' 
          : 'var(--glass-bg)',
        border: `1px solid ${isSelected 
          ? 'var(--primary)' 
          : 'var(--glass-border)'}`,
        borderRadius: '16px',
        padding: '1.5rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Header con icono y nombre */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '1rem'
      }}>
        <div style={{ fontSize: '2rem', marginRight: '1rem' }}>
          {npc.icon || '👤'}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            color: 'white', 
            margin: 0, 
            fontSize: '1.25rem',
            fontWeight: 'bold'
          }}>
            {npc.name}
          </h3>
          <p style={{ 
            color: 'var(--text-muted)', 
            margin: '0.25rem 0 0 0',
            fontSize: '0.9rem'
          }}>
            {npc.role} {npc.location && `• ${npc.location}`}
          </p>
        </div>
        
        {/* Actitud */}
        <div style={{
          background: `${attitudeColors[npc.attitude] || '#6b7280'}20`,
          color: attitudeColors[npc.attitude] || '#6b7280',
          padding: '0.25rem 0.75rem',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: '600'
        }}>
          {npc.attitude || 'Neutral'}
        </div>
      </div>

      {/* Descripción */}
      <p style={{ 
        color: 'var(--text-secondary)', 
        marginBottom: '1rem',
        lineHeight: '1.5',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {npc.description}
      </p>

      {/* Footer con conexiones y acciones */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Contador de conexiones */}
        {connectionCount > 0 && (
          <span style={{ 
            color: 'var(--text-muted)', 
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            🔗 {connectionCount} conexión{connectionCount !== 1 ? 'es' : ''}
          </span>
        )}

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
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '1.5rem'
          }}
        >
          ✕
        </button>
      </div>

      {/* Ubicación */}
      {npc.location && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Ubicación</h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            📍 {npc.location}
          </p>
        </div>
      )}

      {/* Descripción */}
      {npc.description && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Descripción</h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {npc.description}
          </p>
        </div>
      )}

      {/* Actitud */}
      {npc.attitude && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Actitud</h4>
          <div style={{
            display: 'inline-block',
            background: `${
              npc.attitude === 'Amistoso' ? '#10b981' :
              npc.attitude === 'Hostil' ? '#ef4444' : '#6b7280'
            }20`,
            color: npc.attitude === 'Amistoso' ? '#10b981' :
                   npc.attitude === 'Hostil' ? '#ef4444' : '#6b7280',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontWeight: '600'
          }}>
            {npc.attitude}
          </div>
        </div>
      )}

      {/* Notas */}
      {npc.notes && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Notas</h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {npc.notes}
          </p>
        </div>
      )}

      {/* 🔗 SISTEMA DE CONEXIONES */}
      {connections && (
        <div style={{ marginBottom: '2rem' }}>
          <ConnectionsDisplay
            item={npc}
            itemType="npcs"
            linkedItems={linkedItems}
            onRemoveConnection={connections.removeConnection}
            onOpenConnectionModal={connections.openConnectionModal}
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
    location: npc?.location || '',
    description: npc?.description || '',
    attitude: npc?.attitude || 'Neutral',
    notes: npc?.notes || '',
    icon: npc?.icon || '👤'
  })

  const [errors, setErrors] = useState({})

  // Opciones para actitud
  const attitudeOptions = ['Amistoso', 'Neutral', 'Hostil']

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    onSave(formData)
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: '20px',
        padding: '2rem',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h3 style={{ 
          color: 'white', 
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          🧙 {npc ? 'Editar NPC' : 'Nuevo NPC'}
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
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
                placeholder="Ej: Eldara la Sabia"
                className="input-field"
                style={{ 
                  border: errors.name ? '1px solid #ef4444' : undefined
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
                Rol/Profesión
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="Ej: Bibliotecaria, Comerciante, Guardia"
                className="input-field"
              />
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
                placeholder="¿Dónde se puede encontrar normalmente?"
                className="input-field"
              />
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
                placeholder="Apariencia física, personalidad, primera impresión..."
                className="input-field"
                style={{ 
                  minHeight: '100px', 
                  resize: 'vertical',
                  border: errors.description ? '1px solid #ef4444' : undefined
                }}
              />
              {errors.description && (
                <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>
                  {errors.description}
                </p>
              )}
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