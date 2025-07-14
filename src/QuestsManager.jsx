import React, { useState } from 'react'
import { useCRUD } from './hooks/useCRUD'
import ConnectionsDisplay from './components/ConnectionsDisplay'

function QuestsManager({ campaign, connections }) {
  // ✨ Hook CRUD usando datos de la campaña
  const {
    items: quests,
    showForm,
    editingItem,
    selectedItem: selectedQuest,
    isEmpty,
    handleSave,
    handleDelete,
    selectItem: selectQuest,
    openCreateForm,
    openEditForm,
    closeForm,
    closeDetails
  } = useCRUD(campaign.quests || [], 'Misión')

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
            Las aventuras y objetivos de {campaign.name}
          </p>
        </div>
        <button onClick={openCreateForm} className="btn-primary">
          ➕ Añadir Misión
        </button>
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
          {isEmpty ? (
            <EmptyState onAddFirst={openCreateForm} />
          ) : (
            <QuestsList 
              quests={quests}
              onEdit={openEditForm}
              onDelete={handleDelete}
              onSelect={selectQuest}
              selectedId={selectedQuest?.id}
              connections={connections}
            />
          )}
        </div>

        {/* Panel de detalles */}
        {selectedQuest && (
          <QuestDetails 
            quest={selectedQuest}
            onClose={closeDetails}
            onEdit={() => openEditForm(selectedQuest)}
            onDelete={() => handleDelete(selectedQuest.id, selectedQuest.title)}
            connections={connections}
            campaign={campaign}
          />
        )}
      </div>

      {/* Formulario modal */}
      {showForm && (
        <QuestForm
          quest={editingItem}
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
      <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>📜</div>
      <h3 style={{ color: 'var(--text-muted)', fontSize: '1.5rem', marginBottom: '1rem' }}>
        No hay misiones creadas
      </h3>
      <p style={{ color: 'var(--text-disabled)', marginBottom: '2rem' }}>
        Las misiones dan propósito a la aventura. Crea objetivos épicos para tus jugadores.
      </p>
      <button onClick={onAddFirst} className="btn-primary">
        📜 Crear la primera misión
      </button>
    </div>
  )
}

// Lista de misiones
function QuestsList({ quests, onEdit, onDelete, onSelect, selectedId, connections }) {
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {quests.map(quest => (
        <QuestCard
          key={quest.id}
          quest={quest}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelect={onSelect}
          isSelected={selectedId === quest.id}
          connectionCount={connections?.getConnectionCount(quest) || 0}
        />
      ))}
    </div>
  )
}

// Tarjeta individual de misión
function QuestCard({ quest, onEdit, onDelete, onSelect, isSelected, connectionCount }) {
  const statusColors = {
    'Pendiente': '#6b7280',
    'En progreso': '#f59e0b', 
    'Completada': '#10b981',
    'Fallida': '#ef4444'
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
          <span style={{ fontSize: '2rem' }}>{quest.icon}</span>
          <div>
            <h3 style={{ 
              color: 'white', 
              fontSize: '1.25rem', 
              fontWeight: 'bold',
              margin: 0
            }}>
              {quest.title}
            </h3>
            <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
              {quest.location && `📍 ${quest.location}`}
            </p>
          </div>
        </div>
        
        {/* Badges */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{
            background: `${statusColors[quest.status]}20`,
            color: statusColors[quest.status],
            padding: '0.25rem 0.5rem',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}>
            {quest.status}
          </span>
          <span style={{
            background: `${priorityColors[quest.priority]}20`,
            color: priorityColors[quest.priority],
            padding: '0.25rem 0.5rem',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}>
            {quest.priority}
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
        {quest.description}
      </p>

      {/* Recompensa */}
      {quest.reward && (
        <p style={{ 
          color: 'var(--text-muted)', 
          fontSize: '0.9rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          💰 {quest.reward}
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
            onEdit(quest)
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
    </div>
  )
}

// Panel de detalles de la misión seleccionada
function QuestDetails({ quest, onClose, onEdit, onDelete, connections, campaign }) {
  // Obtener elementos conectados
  const linkedItems = connections?.getLinkedItems(quest) || {}

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
            <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
              {quest.status} • Prioridad {quest.priority}
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

      {/* Descripción */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Descripción</h4>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          {quest.description}
        </p>
      </div>

      {/* Ubicación */}
      {quest.location && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Ubicación</h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {quest.location}
          </p>
        </div>
      )}

      {/* Recompensa */}
      {quest.reward && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Recompensa</h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {quest.reward}
          </p>
        </div>
      )}

      {/* Notas */}
      {quest.notes && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Notas</h4>
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

  // Opciones para selects
  const statusOptions = ['Pendiente', 'En progreso', 'Completada', 'Fallida']
  const priorityOptions = ['Baja', 'Media', 'Alta', 'Crítica']

  const iconOptions = [
    '📜', '🗡️', '⚔️', '🛡️', '🏹', '👑', '💎', '🔮', '📚', '🗝️', '⚰️', '🏰',
    '🗼', '🌋', '🗻', '🏞️', '🎯', '🎪', '🎭', '⚡', '🔥', '💫', '⭐', '🌟',
    '🤴', '👸', '🧙', '🧝', '🧛', '🧚', '👹', '👺', '💀', '☠️', '🎲'
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
            {quest ? '✏️ Editar Misión' : '➕ Nueva Misión'}
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
            
            {/* Título e Icono */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem' }}>
              <div>
                <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                  Título de la Misión
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ej: El Rescate del Príncipe Perdido"
                  className="input-field"
                  style={{ border: errors.title ? '1px solid #ef4444' : undefined }}
                />
                {errors.title && (
                  <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>
                    {errors.title}
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
                    <option key={status} value={status}>{status}</option>
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
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>
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
                placeholder="Describe los objetivos y contexto de la misión..."
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
      </div>
    </div>
  )
}

export default QuestsManager