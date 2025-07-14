import React, { useState } from 'react'
import { useCRUD } from './hooks/useCRUD'
import ConnectionsDisplay from './components/ConnectionsDisplay'

// Datos de ejemplo para NPCs
const EXAMPLE_NPCS = [
  {
    id: 1,
    name: "Eldara la Sabia",
    role: "Bibliotecaria",
    location: "Gran Biblioteca de la Ciudad",
    description: "Una elfa anciana con cabello plateado y ojos que brillan con sabiduría acumulada durante siglos.",
    attitude: "Amistoso",
    icon: "📚",
    notes: "Conoce secretos antiguos y está dispuesta a ayudar a cambio de conocimiento raro.",
    linkedItems: {
      locations: [],
      players: [],
      quests: [],
      objects: [],
      notes: []
    },
    createdAt: "2024-01-15"
  },
  {
    id: 2,
    name: "Capitán Thorgrim",
    role: "Guardia de la Ciudad",
    location: "Cuartel de la Guardia",
    description: "Un enano robusto con armadura brillante y una barba trenzada con medallas de honor.",
    attitude: "Neutral",
    icon: "⚔️",
    notes: "Estricto pero justo. Respeta a quienes demuestran honor y valor.",
    linkedItems: {
      locations: [],
      players: [],
      quests: [],
      objects: [],
      notes: []
    },
    createdAt: "2024-01-16"
  },
  {
    id: 3,
    name: "Sombra Roja",
    role: "Asesino",
    location: "Barrios bajos",
    description: "Una figura encapuchada que aparece y desaparece entre las sombras. Sus ojos rojos son lo único visible.",
    attitude: "Hostil",
    icon: "🗡️",
    notes: "Trabaja para el gremio de ladrones. Mortal pero puede ser sobornado con oro suficiente.",
    linkedItems: {
      locations: [],
      players: [],
      quests: [],
      objects: [],
      notes: []
    },
    createdAt: "2024-01-17"
  }
]

function NPCsManager({ campaign, connections }) {
  // ✨ Hook CRUD para manejar todos los estados
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
        Los NPCs dan personalidad a tu mundo. Crea mercaderes, villanos, aliados y más.
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
    'Neutral': '#f59e0b', 
    'Hostil': '#ef4444',
    'Desconocido': '#6b7280'
  }

  return (
    <div
      onClick={() => onSelect(npc)}
      style={{
        background: isSelected 
          ? 'rgba(139, 92, 246, 0.15)' 
          : 'var(--glass-bg)',
        border: `1px solid ${isSelected 
          ? 'rgba(139, 92, 246, 0.4)' 
          : 'var(--glass-border)'}`,
        borderRadius: '16px',
        padding: '1.5rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: isSelected ? 'translateY(-2px)' : 'none',
        boxShadow: isSelected 
          ? '0 8px 25px rgba(139, 92, 246, 0.2)' 
          : '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Header de la tarjeta */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '2rem' }}>{npc.icon}</span>
          <div>
            <h3 style={{ 
              color: 'white', 
              fontSize: '1.25rem', 
              fontWeight: 'bold',
              margin: 0
            }}>
              {npc.name}
            </h3>
            <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
              {npc.role}
            </p>
          </div>
        </div>
        
        {/* Badges */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{
            background: `${attitudeColors[npc.attitude]}20`,
            color: attitudeColors[npc.attitude],
            padding: '0.25rem 0.5rem',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}>
            {npc.attitude}
          </span>
          {connectionCount > 0 && (
            <span style={{
              background: 'rgba(139, 92, 246, 0.2)',
              color: '#a78bfa',
              padding: '0.25rem 0.5rem',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              🔗 {connectionCount}
            </span>
          )}
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

      {/* Localización */}
      {npc.location && (
        <p style={{ 
          color: 'var(--text-muted)', 
          fontSize: '0.9rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          📍 {npc.location}
        </p>
      )}

      {/* Acciones */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem',
        justifyContent: 'flex-end'
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
      height: 'fit-content',
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
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '3rem' }}>{npc.icon}</span>
          <div>
            <h3 style={{ 
              color: 'white', 
              fontSize: '1.5rem', 
              fontWeight: 'bold',
              margin: 0
            }}>
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
            background: 'rgba(107, 114, 128, 0.2)',
            border: '1px solid rgba(107, 114, 128, 0.3)',
            borderRadius: '6px',
            color: '#9ca3af',
            padding: '0.25rem 0.5rem',
            cursor: 'pointer',
            fontSize: '0.8rem'
          }}
        >
          ✕
        </button>
      </div>

      {/* Contenido */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Descripción</h4>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          {npc.description}
        </p>
      </div>

      {npc.location && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Ubicación</h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {npc.location}
          </p>
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Actitud</h4>
        <span style={{
          background: 'rgba(139, 92, 246, 0.2)',
          color: '#a78bfa',
          padding: '0.25rem 0.75rem',
          borderRadius: '12px',
          fontSize: '0.9rem',
          fontWeight: '600'
        }}>
          {npc.attitude}
        </span>
      </div>

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
    icon: npc?.icon || '🧙'
  })

  const [errors, setErrors] = useState({})

  // Opciones para selects
  const roleOptions = [
    'Comerciante', 'Posadero', 'Guardia', 'Noble', 'Mago', 'Clérigo',
    'Ladrón', 'Asesino', 'Bandido', 'Rey', 'Reina', 'Princesa', 'Príncipe',
    'Herrero', 'Alquimista', 'Bibliotecario', 'Bardo', 'Espía', 'Cultista',
    'Druida', 'Explorador', 'Mentor', 'Villano', 'Aliado', 'Otro'
  ]

  const attitudeOptions = ['Amistoso', 'Neutral', 'Hostil', 'Desconocido']

  const iconOptions = [
    '🧙', '🧙‍♀️', '🧙‍♂️', '🤴', '👸', '🧝', '🧝‍♀️', '🧝‍♂️', '🧛', '🧛‍♀️', '🧛‍♂️',
    '🧚', '🧚‍♀️', '🧚‍♂️', '🧞', '🧞‍♀️', '🧞‍♂️', '🧟', '🧟‍♀️', '🧟‍♂️', '⚔️', '🗡️',
    '🛡️', '🏹', '🪓', '🔮', '📚', '💎', '👑', '🦹', '🦸', '🥷', '🕵️', '👮', '👷',
    '👨‍⚕️', '👩‍⚕️', '👨‍🌾', '👩‍🌾', '👨‍🍳', '👩‍🍳', '🎭', '🎪', '🎨'
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Limpiar error cuando el usuario empiece a escribir
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
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '20px',
        padding: '2rem',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h3 style={{ 
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: 'white',
            margin: 0
          }}>
            {npc ? '✏️ Editar NPC' : '➕ Nuevo NPC'}
          </h3>
          <button onClick={onClose} style={{
            background: 'rgba(107, 114, 128, 0.2)',
            border: '1px solid rgba(107, 114, 128, 0.3)',
            borderRadius: '6px',
            color: '#9ca3af',
            padding: '0.5rem',
            cursor: 'pointer',
            fontSize: '1rem'
          }}>
            ✕
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            
            {/* Nombre e Icono */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem' }}>
              <div>
                <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                  Nombre del NPC
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej: Eldara la Sabia"
                  className="input-field"
                  style={{ border: errors.name ? '1px solid #ef4444' : undefined }}
                />
                {errors.name && (
                  <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>
                    {errors.name}
                  </p>
                )}
              </div>
              
              <div>
                <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                  Icono
                </label>
                <select
                  name="icon"
                  value={formData.icon}
                  onChange={handleChange}
                  className="input-field"
                  style={{ fontSize: '1.5rem', textAlign: 'center', width: '60px' }}
                >
                  {iconOptions.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Rol y Actitud */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                  Rol/Profesión
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Selecciona un rol</option>
                  {roleOptions.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                  Actitud
                </label>
                <select
                  name="attitude"
                  value={formData.attitude}
                  onChange={handleChange}
                  className="input-field"
                >
                  {attitudeOptions.map(att => (
                    <option key={att} value={att}>{att}</option>
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
                placeholder="¿Dónde se encuentra normalmente?"
                className="input-field"
              />
            </div>

            {/* Descripción */}
            <div>
              <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe la apariencia y personalidad de este NPC..."
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

            {/* Notas */}
            <div>
              <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                Notas adicionales
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Información importante, secretos, motivaciones..."
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