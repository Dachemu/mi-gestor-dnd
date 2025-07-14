import React, { useState } from 'react'

// Datos de ejemplo para misiones
const exampleQuests = [
  {
    id: 1,
    title: "El Rescate del Príncipe Perdido",
    description: "El príncipe Aldric ha desaparecido durante una expedición al Bosque Sombrío. Los héroes deben encontrarlo antes de que sea demasiado tarde.",
    status: "En progreso",
    priority: "Alta",
    location: "Bosque Sombrío",
    reward: "1000 monedas de oro + Espada del Valor",
    notes: "El príncipe fue visto por última vez cerca del antiguo templo. Cuidado con los lobos sombríos.",
    icon: "🤴",
    createdAt: "2024-01-15"
  },
  {
    id: 2,
    title: "Los Bandidos del Camino Real",
    description: "Una banda de bandidos está atacando a los comerciantes en el Camino Real. La guardia necesita que alguien los detenga.",
    status: "Pendiente",
    priority: "Media",
    location: "Camino Real",
    reward: "500 monedas de oro + Reconocimiento oficial",
    notes: "Los bandidos atacan principalmente por las noches. Su líder lleva una cicatriz en el ojo izquierdo.",
    icon: "⚔️",
    createdAt: "2024-01-16"
  },
  {
    id: 3,
    title: "El Misterio de la Torre Arcana",
    description: "Extraños fenómenos mágicos ocurren alrededor de la Torre Arcana abandonada. Los aldeanos piden investigar.",
    status: "Completada",
    priority: "Baja",
    location: "Torre Arcana",
    reward: "Pergamino de Hechizo Raro + 300 monedas",
    notes: "Misión completada exitosamente. El fantasma del mago ha sido puesto en paz.",
    icon: "🗼",
    createdAt: "2024-01-10"
  }
]

function QuestsManager({ campaign }) {
  const [quests, setQuests] = useState(exampleQuests)
  const [showForm, setShowForm] = useState(false)
  const [editingQuest, setEditingQuest] = useState(null)
  const [selectedQuest, setSelectedQuest] = useState(null)

  // Crear nueva misión
  const handleCreateQuest = (questData) => {
    const newQuest = {
      ...questData,
      id: Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    }
    setQuests(prev => [...prev, newQuest])
    setShowForm(false)
    alert(`¡Misión "${newQuest.title}" creada exitosamente! 🎉`)
  }

  // Editar misión existente
  const handleEditQuest = (questData) => {
    setQuests(prev => prev.map(quest => 
      quest.id === editingQuest.id 
        ? { ...questData, id: editingQuest.id, createdAt: editingQuest.createdAt }
        : quest
    ))
    setEditingQuest(null)
    setShowForm(false)
    alert(`¡Misión "${questData.title}" actualizada! ✨`)
  }

  // Eliminar misión
  const handleDeleteQuest = (questId, questTitle) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${questTitle}"?`)) {
      setQuests(prev => prev.filter(quest => quest.id !== questId))
      if (selectedQuest?.id === questId) {
        setSelectedQuest(null)
      }
      alert(`Misión "${questTitle}" eliminada`)
    }
  }

  // Cambiar estado de misión rápidamente
  const handleStatusChange = (questId, newStatus) => {
    setQuests(prev => prev.map(quest => 
      quest.id === questId 
        ? { ...quest, status: newStatus }
        : quest
    ))
    if (selectedQuest?.id === questId) {
      setSelectedQuest(prev => ({ ...prev, status: newStatus }))
    }
  }

  // Abrir formulario para editar
  const openEditForm = (quest) => {
    setEditingQuest(quest)
    setShowForm(true)
  }

  // Abrir formulario para crear
  const openCreateForm = () => {
    setEditingQuest(null)
    setShowForm(true)
  }

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
            📜 Misiones
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>
            Las aventuras esperan ser escritas en {campaign.name}
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="btn-primary"
        >
          ➕ Añadir Misión
        </button>
      </div>

      {/* Filtros por estado */}
      <div style={{ marginBottom: '2rem' }}>
        <QuestFilters 
          quests={quests}
          onStatusChange={handleStatusChange}
        />
      </div>

      {/* Vista principal */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: selectedQuest ? '1fr 400px' : '1fr',
        gap: '2rem',
        transition: 'all 0.3s ease'
      }}>
        
        {/* Lista de misiones */}
        <div>
          {quests.length === 0 ? (
            <EmptyState onAddFirst={openCreateForm} />
          ) : (
            <QuestsList 
              quests={quests}
              onEdit={openEditForm}
              onDelete={handleDeleteQuest}
              onSelect={setSelectedQuest}
              onStatusChange={handleStatusChange}
              selectedId={selectedQuest?.id}
            />
          )}
        </div>

        {/* Panel de detalles */}
        {selectedQuest && (
          <QuestDetails 
            quest={selectedQuest}
            onClose={() => setSelectedQuest(null)}
            onEdit={() => openEditForm(selectedQuest)}
            onDelete={() => handleDeleteQuest(selectedQuest.id, selectedQuest.title)}
            onStatusChange={(newStatus) => handleStatusChange(selectedQuest.id, newStatus)}
          />
        )}
      </div>

      {/* Formulario modal */}
      {showForm && (
        <QuestForm
          quest={editingQuest}
          onSave={editingQuest ? handleEditQuest : handleCreateQuest}
          onClose={() => {
            setShowForm(false)
            setEditingQuest(null)
          }}
        />
      )}
    </div>
  )
}

// Componente de filtros por estado
function QuestFilters({ quests, onStatusChange }) {
  const statusCounts = {
    'Pendiente': quests.filter(q => q.status === 'Pendiente').length,
    'En progreso': quests.filter(q => q.status === 'En progreso').length,
    'Completada': quests.filter(q => q.status === 'Completada').length
  }

  return (
    <div style={{
      background: 'var(--glass-bg)',
      border: '1px solid var(--glass-border)',
      borderRadius: '16px',
      padding: '1.5rem'
    }}>
      <h3 style={{ color: 'white', marginBottom: '1rem' }}>Estado de Misiones</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', color: '#f59e0b' }}>⏳</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {statusCounts['Pendiente']}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Pendientes
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', color: '#3b82f6' }}>⚡</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
            {statusCounts['En progreso']}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            En progreso
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', color: '#10b981' }}>✅</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
            {statusCounts['Completada']}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Completadas
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente de estado vacío
function EmptyState({ onAddFirst }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>📜</div>
      <h3 style={{ color: 'var(--text-muted)', fontSize: '1.5rem', marginBottom: '1rem' }}>
        No hay misiones creadas
      </h3>
      <p style={{ color: 'var(--text-disabled)', marginBottom: '2rem' }}>
        Las aventuras esperan ser escritas. Crea misiones épicas para tus jugadores.
      </p>
      <button onClick={onAddFirst} className="btn-primary">
        📜 Crear la primera misión
      </button>
    </div>
  )
}

// Lista de misiones
function QuestsList({ quests, onEdit, onDelete, onSelect, onStatusChange, selectedId }) {
  return (
    <div style={{
      display: 'grid',
      gap: '1rem'
    }}>
      {quests.map(quest => (
        <QuestCard
          key={quest.id}
          quest={quest}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelect={onSelect}
          onStatusChange={onStatusChange}
          isSelected={selectedId === quest.id}
        />
      ))}
    </div>
  )
}

// Tarjeta individual de misión
function QuestCard({ quest, onEdit, onDelete, onSelect, onStatusChange, isSelected }) {
  const statusColors = {
    'Pendiente': '#f59e0b',
    'En progreso': '#3b82f6', 
    'Completada': '#10b981'
  }

  const priorityColors = {
    'Baja': '#6b7280',
    'Media': '#f59e0b', 
    'Alta': '#ef4444',
    'Crítica': '#8b5cf6'
  }

  return (
    <div
      onClick={() => onSelect(quest)}
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
            onEdit(quest)
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
            onDelete(quest.id, quest.title)
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
          <span style={{ fontSize: '2.5rem' }}>{quest.icon}</span>
          <div style={{ flex: 1 }}>
            <h3 style={{ 
              color: 'white', 
              fontSize: '1.25rem', 
              fontWeight: 'bold',
              margin: 0,
              marginBottom: '0.25rem'
            }}>
              {quest.title}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{
                background: `${statusColors[quest.status]}20`,
                color: statusColors[quest.status],
                padding: '0.125rem 0.5rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                {quest.status}
              </span>
              <span style={{
                background: `${priorityColors[quest.priority]}20`,
                color: priorityColors[quest.priority],
                padding: '0.125rem 0.5rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                {quest.priority}
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
          {quest.description}
        </p>

        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '0.5rem',
          marginBottom: '1rem',
          fontSize: '0.9rem'
        }}>
          {quest.location && (
            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📍 {quest.location}
            </div>
          )}
          {quest.reward && (
            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              💰 {quest.reward.length > 20 ? quest.reward.substring(0, 20) + '...' : quest.reward}
            </div>
          )}
        </div>

        {/* Cambio rápido de estado */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          paddingTop: '1rem',
          borderTop: '1px solid var(--glass-border)'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-disabled)' }}>
            Creado: {new Date(quest.createdAt).toLocaleDateString()}
          </div>
          
          <select
            value={quest.status}
            onChange={(e) => {
              e.stopPropagation()
              onStatusChange(quest.id, e.target.value)
            }}
            style={{
              background: 'rgba(31, 41, 55, 0.8)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '6px',
              color: 'white',
              padding: '0.25rem 0.5rem',
              fontSize: '0.8rem'
            }}
          >
            <option value="Pendiente">Pendiente</option>
            <option value="En progreso">En progreso</option>
            <option value="Completada">Completada</option>
          </select>
        </div>
      </div>
    </div>
  )
}

// Panel de detalles de la misión seleccionada
function QuestDetails({ quest, onClose, onEdit, onDelete, onStatusChange }) {
  const statusColors = {
    'Pendiente': '#f59e0b',
    'En progreso': '#3b82f6', 
    'Completada': '#10b981'
  }

  const priorityColors = {
    'Baja': '#6b7280',
    'Media': '#f59e0b', 
    'Alta': '#ef4444',
    'Crítica': '#8b5cf6'
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
          <span style={{ fontSize: '3rem' }}>{quest.icon}</span>
          <div>
            <h3 style={{ 
              color: 'white', 
              fontSize: '1.5rem', 
              fontWeight: 'bold',
              margin: 0
            }}>
              {quest.title}
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{
                background: `${statusColors[quest.status]}20`,
                color: statusColors[quest.status],
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                {quest.status}
              </span>
              <span style={{
                background: `${priorityColors[quest.priority]}20`,
                color: priorityColors[quest.priority],
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                {quest.priority}
              </span>
            </div>
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
          {quest.description}
        </p>
      </div>

      {quest.location && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Ubicación</h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            📍 {quest.location}
          </p>
        </div>
      )}

      {quest.reward && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Recompensa</h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            💰 {quest.reward}
          </p>
        </div>
      )}

      {quest.notes && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Notas</h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {quest.notes}
          </p>
        </div>
      )}

      {/* Cambio de estado */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Cambiar Estado</h4>
        <select
          value={quest.status}
          onChange={(e) => onStatusChange(e.target.value)}
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
          <option value="Pendiente">📋 Pendiente</option>
          <option value="En progreso">⚡ En progreso</option>
          <option value="Completada">✅ Completada</option>
        </select>
      </div>

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
    title: quest?.title || '',
    description: quest?.description || '',
    status: quest?.status || 'Pendiente',
    priority: quest?.priority || 'Media',
    location: quest?.location || '',
    reward: quest?.reward || '',
    notes: quest?.notes || '',
    icon: quest?.icon || '📜'
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
    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio'
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

  // Lista de emojis para misiones
  const questIcons = ['📜', '⚔️', '🏰', '🗡️', '🛡️', '💎', '👑', '🧙', '🐲', '🗝️', '💰', '🏹', '⚡', '🔥', '❄️', '🌟', '💀', '👹', '🦄', '🐺', '🦅', '🌙', '☀️', '⭐', '💫', '🎯', '🏆', '👤', '🤴', '👸', '🧝', '🧛']

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
            {quest ? '✏️ Editar Misión' : '📜 Nueva Misión'}
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
              {questIcons.map(icon => (
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

          {/* Título */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
              Título de la misión *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ej: El Rescate del Príncipe Perdido"
              style={{
                width: '100%',
                background: 'rgba(31, 41, 55, 0.5)',
                border: `1px solid ${errors.title ? '#ef4444' : 'rgba(139, 92, 246, 0.2)'}`,
                borderRadius: '10px',
                padding: '0.75rem',
                color: 'white',
                fontSize: '1rem'
              }}
              autoFocus
            />
            {errors.title && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>{errors.title}</p>}
          </div>

          {/* Descripción */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
              Descripción de la misión *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe los objetivos y contexto de la misión..."
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

          {/* Estado y Prioridad */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
                Estado
              </label>
              <select
                name="status"
                value={formData.status}
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
                <option value="Pendiente">📋 Pendiente</option>
                <option value="En progreso">⚡ En progreso</option>
                <option value="Completada">✅ Completada</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
                Prioridad
              </label>
              <select
                name="priority"
                value={formData.priority}
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
                <option value="Baja">Prioridad Baja</option>
                <option value="Media">Prioridad Media</option>
                <option value="Alta">Prioridad Alta</option>
                <option value="Crítica">Prioridad Crítica</option>
              </select>
            </div>
          </div>

          {/* Ubicación y Recompensa */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
                Ubicación
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ej: Bosque Sombrío"
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
                Recompensa
              </label>
              <input
                type="text"
                name="reward"
                value={formData.reward}
                onChange={handleChange}
                placeholder="Ej: 500 oro + espada mágica"
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
          </div>

          {/* Notas */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
              Notas adicionales
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Pistas, información adicional, progreso actual..."
              rows={3}
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
              {quest ? '💾 Actualizar' : '📜 Crear Misión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default QuestsManager