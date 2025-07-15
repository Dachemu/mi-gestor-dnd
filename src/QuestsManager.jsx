import React, { useState, useEffect } from 'react'
import { useCRUD } from './hooks/useCRUD'
import ConnectionsDisplay from './components/ConnectionsDisplay'

function QuestsManager({ campaign, connections, selectedItemForNavigation }) {
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
    closeDetails,
    NotificationComponent
  } = useCRUD(campaign.quests || [], 'Misión')

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
            <div style={{
              display: 'grid',
              gap: '1rem'
            }}>
              {quests.map(quest => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  isSelected={selectedQuest?.id === quest.id}
                  onClick={() => selectQuest(quest)}
                  onEdit={() => openEditForm(quest)}
                  onDelete={() => handleDelete(quest.id, quest.name)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Panel de detalles */}
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
      </div>

      {/* Modal de formulario */}
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

// Estado vacío
function EmptyState({ onAddFirst }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '4rem 2rem',
      color: 'var(--text-muted)'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>
        📜
      </div>
      <h3 style={{ color: 'white', marginBottom: '1rem' }}>
        No hay misiones creadas aún
      </h3>
      <p style={{ marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
        Las misiones son el corazón de tu campaña. Crea aventuras épicas, 
        misiones secundarias y objetivos que motiven a tus jugadores.
      </p>
      <button onClick={onAddFirst} className="btn-primary">
        📜 Crear Primera Misión
      </button>
    </div>
  )
}

// Tarjeta de misión
function QuestCard({ quest, isSelected, onClick, onEdit, onDelete }) {
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
      {/* Icono */}
      <div style={{
        fontSize: '2rem',
        flexShrink: 0,
        width: '50px',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(245, 158, 11, 0.2)',
        borderRadius: '10px'
      }}>
        {quest.icon || '📜'}
      </div>

      {/* Información principal */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ 
          color: 'white', 
          margin: '0 0 0.25rem 0',
          fontSize: '1.1rem',
          fontWeight: '600'
        }}>
          {quest.name}
        </h4>
        
        {/* Estado y prioridad */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
          {quest.status && (
            <span style={{
              padding: '0.25rem 0.5rem',
              background: `${getStatusColor(quest.status)}20`,
              color: getStatusColor(quest.status),
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              {quest.status === 'Completada' && '✅'} 
              {quest.status === 'En progreso' && '⏳'} 
              {quest.status === 'Pendiente' && '⏸️'} 
              {quest.status === 'Fallida' && '❌'} 
              {quest.status}
            </span>
          )}
          
          {quest.priority && (
            <span style={{
              padding: '0.25rem 0.5rem',
              background: `${getPriorityColor(quest.priority)}20`,
              color: getPriorityColor(quest.priority),
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              {quest.priority === 'Alta' && '🔥'} 
              {quest.priority === 'Media' && '⭐'} 
              {quest.priority === 'Baja' && '💫'} 
              {quest.priority}
            </span>
          )}
        </div>

        {/* Ubicación y recompensa */}
        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
          {quest.location && (
            <p style={{ margin: '0 0 0.25rem 0' }}>
              📍 {quest.location}
            </p>
          )}
          {quest.reward && (
            <p style={{ margin: 0 }}>
              💰 {quest.reward}
            </p>
          )}
        </div>

        {/* Descripción corta */}
        {quest.description && (
          <p style={{ 
            color: 'var(--text-muted)', 
            margin: '0.5rem 0 0 0',
            fontSize: '0.85rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {quest.description}
          </p>
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
            onEdit()
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
            onDelete()
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
          {quest ? '✏️ Editar Misión' : '📜 Nueva Misión'}
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
      </div>
    </div>
  )
}

export default QuestsManager