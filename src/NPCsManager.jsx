import React, { useState } from 'react'
import { useCRUD } from './hooks/useCRUD'

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
    createdAt: "2024-01-17"
  }
]

function NPCsManager({ campaign }) {
  // ✨ Todo el estado y lógica CRUD en una línea
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
  } = useCRUD(EXAMPLE_NPCS, 'NPC')

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
              onDelete={(id, name) => handleDelete(id, name)}
              onSelect={selectNPC}
              selectedId={selectedNPC?.id}
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
        Los NPCs dan vida a tu mundo. Crea comerciantes, guardias, sabios y más.
      </p>
      <button onClick={onAddFirst} className="btn-primary">
        🧙 Crear el primer NPC
      </button>
    </div>
  )
}

// Lista de NPCs
function NPCsList({ npcs, onEdit, onDelete, onSelect, selectedId }) {
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
        />
      ))}
    </div>
  )
}

// Tarjeta individual de NPC
function NPCCard({ npc, onEdit, onDelete, onSelect, isSelected }) {
  const attitudeColors = {
    'Amistoso': '#10b981',
    'Neutral': '#f59e0b',
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
          ? 'rgba(139, 92, 246, 0.4)' 
          : 'var(--glass-border)'}`,
        borderRadius: '16px',
        padding: '1.5rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative'
      }}
      className="campaign-card"
    >
      {/* Botones de acción */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        display: 'flex',
        gap: '0.5rem'
      }}>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit(npc)
          }}
          style={{
            background: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '6px',
            color: '#3b82f6',
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

      {/* Contenido principal */}
      <div style={{ paddingRight: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '2.5rem' }}>{npc.icon}</span>
          <div>
            <h3 style={{ 
              color: 'white', 
              fontSize: '1.25rem', 
              fontWeight: 'bold',
              margin: 0
            }}>
              {npc.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
              <span style={{ 
                color: 'var(--text-muted)', 
                fontSize: '0.9rem' 
              }}>
                {npc.role}
              </span>
              <span style={{
                background: `${attitudeColors[npc.attitude]}20`,
                color: attitudeColors[npc.attitude],
                padding: '0.125rem 0.5rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                {npc.attitude}
              </span>
            </div>
          </div>
        </div>

        <p style={{ 
          color: 'var(--text-secondary)', 
          lineHeight: '1.5',
          marginBottom: '1rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {npc.description}
        </p>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem' }}>📍</span>
            <span style={{ color: '#3b82f6', fontSize: '0.85rem' }}>
              {npc.location}
            </span>
          </div>
        </div>

        <div style={{ 
          fontSize: '0.8rem', 
          color: 'var(--text-disabled)'
        }}>
          Creado: {new Date(npc.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}

// Panel de detalles del NPC seleccionado
function NPCDetails({ npc, onClose, onEdit, onDelete }) {
  const attitudeColors = {
    'Amistoso': '#10b981',
    'Neutral': '#f59e0b',
    'Hostil': '#ef4444'
  }

  return (
    <div style={{
      background: 'var(--glass-bg)',
      border: '1px solid var(--glass-border)',
      borderRadius: '16px',
      padding: '2rem',
      height: 'fit-content',
      position: 'sticky',
      top: '2rem'
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
            <span style={{
              background: `${attitudeColors[npc.attitude]}20`,
              color: attitudeColors[npc.attitude],
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: '600',
              display: 'inline-block',
              marginTop: '0.5rem'
            }}>
              {npc.attitude}
            </span>
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

      {/* Ubicación */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Ubicación habitual</h4>
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '10px',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <span style={{ fontSize: '1.5rem' }}>📍</span>
          <span style={{ color: '#3b82f6', fontWeight: '500' }}>
            {npc.location}
          </span>
        </div>
      </div>

      {/* Descripción */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Descripción</h4>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          {npc.description}
        </p>
      </div>

      {/* Notas */}
      {npc.notes && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Notas de interpretación</h4>
          <div style={{
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: '10px',
            padding: '1rem'
          }}>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {npc.notes}
            </p>
          </div>
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
    icon: npc?.icon || '👤',
    notes: npc?.notes || ''
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio'
    }
    if (!formData.role.trim()) {
      newErrors.role = 'El rol es obligatorio'
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

  // Lista de emojis para NPCs
  const npcIcons = ['👤', '🧙', '🧙‍♀️', '🧙‍♂️', '🤴', '👸', '🧝', '🧝‍♀️', '🧝‍♂️', '🧛', '🧛‍♀️', '🧛‍♂️', '🧚', '🧚‍♀️', '🧚‍♂️', '👷', '👷‍♀️', '👷‍♂️', '💂', '💂‍♀️', '💂‍♂️', '🕵️', '🕵️‍♀️', '🕵️‍♂️', '👨‍⚕️', '👩‍⚕️', '👨‍🌾', '👩‍🌾', '👨‍🍳', '👩‍🍳', '👨‍🏫', '👩‍🏫', '👨‍⚖️', '👩‍⚖️', '🧔', '👲', '👳', '👳‍♀️', '👳‍♂️', '🧕', '👮', '👮‍♀️', '👮‍♂️', '👴', '👵', '🧓']

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
        maxWidth: '700px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
            {npc ? '✏️ Editar NPC' : '🧙 Nuevo NPC'}
          </h3>
          <button onClick={onClose} style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#ef4444',
            padding: '0.5rem',
            cursor: 'pointer'
          }}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Icono */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
              Icono
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', maxHeight: '120px', overflowY: 'auto' }}>
              {npcIcons.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  style={{
                    background: formData.icon === icon ? 'rgba(139, 92, 246, 0.3)' : 'rgba(31, 41, 55, 0.5)',
                    border: `1px solid ${formData.icon === icon ? 'rgba(139, 92, 246, 0.5)' : 'rgba(139, 92, 246, 0.2)'}`,
                    borderRadius: '8px',
                    padding: '0.5rem',
                    fontSize: '1.5rem',
                    cursor: 'pointer'
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Nombre y Rol */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
                Nombre del NPC *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej: Eldara la Sabia"
                style={{
                  width: '100%',
                  background: 'rgba(31, 41, 55, 0.5)',
                  border: `1px solid ${errors.name ? '#ef4444' : 'rgba(139, 92, 246, 0.2)'}`,
                  borderRadius: '10px',
                  padding: '0.75rem',
                  color: 'white',
                  fontSize: '1rem'
                }}
                autoFocus
              />
              {errors.name && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>{errors.name}</p>}
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
                Rol o profesión *
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="Ej: Comerciante, Guardia, Noble"
                style={{
                  width: '100%',
                  background: 'rgba(31, 41, 55, 0.5)',
                  border: `1px solid ${errors.role ? '#ef4444' : 'rgba(139, 92, 246, 0.2)'}`,
                  borderRadius: '10px',
                  padding: '0.75rem',
                  color: 'white',
                  fontSize: '1rem'
                }}
              />
              {errors.role && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>{errors.role}</p>}
            </div>
          </div>

          {/* Ubicación y Actitud */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
                Ubicación habitual
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ej: Mercado central"
                style={{
                  width: '100%',
                  background: 'rgba(31, 41, 55, 0.5)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  borderRadius: '10px',
                  padding: '0.75rem',
                  color: 'white',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
                Actitud hacia jugadores
              </label>
              <select
                name="attitude"
                value={formData.attitude}
                onChange={handleChange}
                style={{
                  width: '100%',
                  background: 'rgba(31, 41, 55, 0.5)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  borderRadius: '10px',
                  padding: '0.75rem',
                  color: 'white',
                  fontSize: '1rem'
                }}
              >
                <option value="Amistoso">Amistoso</option>
                <option value="Neutral">Neutral</option>
                <option value="Hostil">Hostil</option>
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
              Descripción *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Apariencia física y primeras impresiones..."
              rows={3}
              style={{
                width: '100%',
                background: 'rgba(31, 41, 55, 0.5)',
                border: `1px solid ${errors.description ? '#ef4444' : 'rgba(139, 92, 246, 0.2)'}`,
                borderRadius: '10px',
                padding: '0.75rem',
                color: 'white',
                fontSize: '1rem',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
            {errors.description && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>{errors.description}</p>}
          </div>

          {/* Notas */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
              Notas de interpretación
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Personalidad, motivaciones, secretos, cómo interpretar a este NPC..."
              rows={4}
              style={{
                width: '100%',
                background: 'rgba(31, 41, 55, 0.5)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '10px',
                padding: '0.75rem',
                color: 'white',
                fontSize: '1rem',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                color: 'var(--text-secondary)',
                padding: '0.75rem 1.5rem',
                borderRadius: '10px',
                fontWeight: '500',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {npc ? '💾 Actualizar' : '🧙 Crear NPC'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NPCsManager