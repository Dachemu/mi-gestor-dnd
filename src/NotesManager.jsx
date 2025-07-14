import React, { useState } from 'react'
import { useCRUD } from './hooks/useCRUD'
import ConnectionsDisplay from './components/ConnectionsDisplay'

function NotesManager({ campaign, connections }) {
  // ✨ Hook CRUD usando datos de la campaña
  const {
    items: notes,
    showForm,
    editingItem,
    selectedItem: selectedNote,
    isEmpty,
    handleSave,
    handleDelete,
    selectItem: selectNote,
    openCreateForm,
    openEditForm,
    closeForm,
    closeDetails
  } = useCRUD(campaign.notes || [], 'Nota')

  // Estado para filtro por categoría
  const [filterCategory, setFilterCategory] = useState('Todas')

  // Obtener categorías únicas
  const categories = ['Todas', ...new Set(notes.map(note => note.category).filter(Boolean))]

  // Filtrar notas por categoría
  const filteredNotes = filterCategory === 'Todas' 
    ? notes 
    : notes.filter(note => note.category === filterCategory)

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
            📝 Notas
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>
            Tus apuntes y recordatorios de {campaign.name}
          </p>
        </div>
        <button onClick={openCreateForm} className="btn-primary">
          ➕ Añadir Nota
        </button>
      </div>

      {/* Filtro por categoría */}
      {categories.length > 1 && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: filterCategory === category 
                    ? 'rgba(139, 92, 246, 0.3)' 
                    : 'rgba(31, 41, 55, 0.5)',
                  color: filterCategory === category 
                    ? '#a78bfa' 
                    : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                {category} {category !== 'Todas' && `(${notes.filter(n => n.category === category).length})`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Vista principal */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: selectedNote ? '1fr 400px' : '1fr',
        gap: '2rem',
        transition: 'all 0.3s ease'
      }}>
        
        {/* Lista de notas */}
        <div>
          {isEmpty ? (
            <EmptyState onAddFirst={openCreateForm} />
          ) : filteredNotes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <h3 style={{ color: 'var(--text-muted)', fontSize: '1.5rem', marginBottom: '1rem' }}>
                No hay notas en "{filterCategory}"
              </h3>
              <p style={{ color: 'var(--text-disabled)', marginBottom: '2rem' }}>
                Prueba seleccionando otra categoría o crea una nueva nota.
              </p>
            </div>
          ) : (
            <NotesList 
              notes={filteredNotes}
              onEdit={openEditForm}
              onDelete={handleDelete}
              onSelect={selectNote}
              selectedId={selectedNote?.id}
              connections={connections}
            />
          )}
        </div>

        {/* Panel de detalles */}
        {selectedNote && (
          <NoteDetails 
            note={selectedNote}
            onClose={closeDetails}
            onEdit={() => openEditForm(selectedNote)}
            onDelete={() => handleDelete(selectedNote.id, selectedNote.title)}
            connections={connections}
            campaign={campaign}
          />
        )}
      </div>

      {/* Formulario modal */}
      {showForm && (
        <NoteForm
          note={editingItem}
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
      <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>📝</div>
      <h3 style={{ color: 'var(--text-muted)', fontSize: '1.5rem', marginBottom: '1rem' }}>
        No hay notas creadas
      </h3>
      <p style={{ color: 'var(--text-disabled)', marginBottom: '2rem' }}>
        Las notas te ayudan a recordar reglas, ideas y detalles importantes de tu campaña.
      </p>
      <button onClick={onAddFirst} className="btn-primary">
        📝 Crear la primera nota
      </button>
    </div>
  )
}

// Lista de notas
function NotesList({ notes, onEdit, onDelete, onSelect, selectedId, connections }) {
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {notes.map(note => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelect={onSelect}
          isSelected={selectedId === note.id}
          connectionCount={connections?.getConnectionCount(note) || 0}
        />
      ))}
    </div>
  )
}

// Tarjeta individual de nota
function NoteCard({ note, onEdit, onDelete, onSelect, isSelected, connectionCount }) {
  const categoryColors = {
    'Reglas': '#3b82f6',
    'Ideas': '#f59e0b',
    'Calendario': '#10b981',
    'Secretos': '#8b5cf6',
    'Historia': '#ef4444',
    'Personajes': '#06b6d4',
    'Otros': '#6b7280'
  }

  return (
    <div
      onClick={() => onSelect(note)}
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
          <span style={{ fontSize: '2rem' }}>{note.icon}</span>
          <div>
            <h3 style={{ 
              color: 'white', 
              fontSize: '1.25rem', 
              fontWeight: 'bold',
              margin: 0
            }}>
              {note.title}
            </h3>
            <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
              {note.category && `${note.category} • `}
              {new Date(note.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        {/* Badges */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {note.category && (
            <span style={{
              background: `${categoryColors[note.category] || '#6b7280'}20`,
              color: categoryColors[note.category] || '#6b7280',
              padding: '0.25rem 0.5rem',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              {note.category}
            </span>
          )}
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

      {/* Contenido de la nota (preview) */}
      <div style={{ 
        color: 'var(--text-secondary)', 
        marginBottom: '1rem',
        lineHeight: '1.5',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        whiteSpace: 'pre-wrap'
      }}>
        {note.content}
      </div>

      {/* Acciones */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem',
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit(note)
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
            onDelete(note.id, note.title)
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

// Panel de detalles de la nota seleccionada
function NoteDetails({ note, onClose, onEdit, onDelete, connections, campaign }) {
  // Obtener elementos conectados
  const linkedItems = connections?.getLinkedItems(note) || {}

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
          <span style={{ fontSize: '3rem' }}>{note.icon}</span>
          <div>
            <h3 style={{ 
              color: 'white', 
              fontSize: '1.5rem', 
              fontWeight: 'bold',
              margin: 0
            }}>
              {note.title}
            </h3>
            <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
              {note.category && `${note.category} • `}
              {new Date(note.createdAt).toLocaleDateString()}
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

      {/* Contenido completo de la nota */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Contenido</h4>
        <div style={{ 
          color: 'var(--text-secondary)', 
          lineHeight: '1.6',
          whiteSpace: 'pre-wrap',
          background: 'rgba(31, 41, 55, 0.3)',
          border: '1px solid rgba(139, 92, 246, 0.1)',
          borderRadius: '8px',
          padding: '1rem'
        }}>
          {note.content}
        </div>
      </div>

      {/* 🔗 SISTEMA DE CONEXIONES */}
      {connections && (
        <div style={{ marginBottom: '2rem' }}>
          <ConnectionsDisplay
            item={note}
            itemType="notes"
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

// Formulario para crear/editar notas
function NoteForm({ note, onSave, onClose }) {
  const [formData, setFormData] = useState({
    title: note?.title || '',
    content: note?.content || '',
    category: note?.category || 'Ideas',
    icon: note?.icon || '📝'
  })

  const [errors, setErrors] = useState({})

  // Opciones para selects
  const categoryOptions = [
    'Ideas', 'Reglas', 'Calendario', 'Secretos', 'Historia', 
    'Personajes', 'Lugares', 'Objetos', 'Misiones', 'Otros'
  ]

  const iconOptions = [
    '📝', '💡', '📋', '📅', '🕵️', '📚', '📖', '📜', '📄', '📑', '🗒️', '📰',
    '🔍', '💭', '🧠', '⚡', '🎯', '📌', '📍', '🔖', '🏷️', '📊', '📈', '📉',
    '⭐', '🌟', '✨', '💫', '🔥', '❄️', '⚔️', '🛡️', '🗝️', '💎', '👑', '🎭'
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
    
    if (!formData.content.trim()) {
      newErrors.content = 'El contenido es obligatorio'
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
        maxWidth: '700px',
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
            {note ? '✏️ Editar Nota' : '➕ Nueva Nota'}
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
                  Título de la Nota
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ej: Reglas de la Casa"
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

            {/* Categoría */}
            <div>
              <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                Categoría
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field"
              >
                {categoryOptions.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Contenido */}
            <div>
              <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                Contenido
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Escribe aquí tus notas, reglas, ideas, recordatorios..."
                className="input-field"
                style={{ 
                  minHeight: '250px', 
                  resize: 'vertical',
                  border: errors.content ? '1px solid #ef4444' : undefined,
                  fontFamily: 'monospace'
                }}
              />
              {errors.content && (
                <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>
                  {errors.content}
                </p>
              )}
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0.5rem 0 0 0' }}>
                💡 Tip: Puedes usar saltos de línea y listas con viñetas para organizar mejor tu contenido
              </p>
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
              {note ? '💾 Guardar Cambios' : '➕ Crear Nota'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NotesManager