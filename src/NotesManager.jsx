import React, { useState, useEffect } from 'react'
import { useCRUD } from './hooks/useCRUD'
import ConnectionsDisplay from './components/ConnectionsDisplay'

function NotesManager({ campaign, connections, selectedItemForNavigation }) {
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
    closeDetails,
    NotificationComponent
  } = useCRUD(campaign.notes || [], 'Nota')

  // Estado para filtro por categoría
  const [filterCategory, setFilterCategory] = useState('Todas')

  // ✨ Efecto para seleccionar automáticamente una nota cuando se navega desde conexiones
  useEffect(() => {
    if (selectedItemForNavigation && selectedItemForNavigation.type === 'notes') {
      const noteToSelect = notes.find(note => note.id === selectedItemForNavigation.item.id)
      if (noteToSelect) {
        selectNote(noteToSelect)
      }
    }
  }, [selectedItemForNavigation, notes, selectNote])

  // Obtener categorías únicas
  const categories = ['Todas', ...new Set(notes.map(note => note.category).filter(Boolean))]

  // Filtrar notas por categoría
  const filteredNotes = filterCategory === 'Todas' 
    ? notes 
    : notes.filter(note => note.category === filterCategory)

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
            <EmptyCategory 
              category={filterCategory} 
              onResetFilter={() => setFilterCategory('Todas')} 
            />
          ) : (
            <div style={{
              display: 'grid',
              gap: '1rem'
            }}>
              {filteredNotes.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  isSelected={selectedNote?.id === note.id}
                  onClick={() => selectNote(note)}
                  onEdit={() => openEditForm(note)}
                  onDelete={() => handleDelete(note.id, note.title)}
                />
              ))}
            </div>
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

      {/* Modal de formulario */}
      {showForm && (
        <NoteForm
          note={editingItem}
          onSave={handleSave}
          onClose={closeForm}
          existingCategories={categories.filter(c => c !== 'Todas')}
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
        📝
      </div>
      <h3 style={{ color: 'white', marginBottom: '1rem' }}>
        No hay notas creadas aún
      </h3>
      <p style={{ marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
        Las notas te ayudan a recordar detalles importantes, planificar sesiones 
        y llevar un registro de eventos de tu campaña.
      </p>
      <button onClick={onAddFirst} className="btn-primary">
        📝 Crear Primera Nota
      </button>
    </div>
  )
}

// Estado de categoría vacía
function EmptyCategory({ category, onResetFilter }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '3rem 2rem',
      color: 'var(--text-muted)'
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>
        🔍
      </div>
      <h3 style={{ color: 'white', marginBottom: '1rem' }}>
        No hay notas en "{category}"
      </h3>
      <p style={{ marginBottom: '2rem' }}>
        No se encontraron notas en esta categoría.
      </p>
      <button onClick={onResetFilter} className="btn-secondary">
        Ver todas las notas
      </button>
    </div>
  )
}

// Tarjeta de nota
function NoteCard({ note, isSelected, onClick, onEdit, onDelete }) {
  const getCategoryColor = (category) => {
    const colors = {
      'General': '#6b7280',
      'Sesión': '#3b82f6',
      'Trama': '#8b5cf6',
      'Personajes': '#10b981',
      'Mundo': '#f59e0b',
      'Reglas': '#ef4444'
    }
    return colors[category] || '#6b7280'
  }

  // Función para extraer texto plano del contenido (por si tiene HTML)
  const getPlainTextContent = (content) => {
    if (!content) return ''
    
    // Remover tags HTML básicos y obtener solo texto
    const plainText = content
      .replace(/<[^>]*>/g, '') // Remover tags HTML
      .replace(/&nbsp;/g, ' ') // Reemplazar espacios no rompibles
      .replace(/&amp;/g, '&') // Reemplazar entidades HTML
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim()
    
    return plainText
  }

  const plainContent = getPlainTextContent(note.content)

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
        alignItems: 'flex-start',
        gap: '1rem'
      }}
    >
      {/* Icono */}
      <div style={{
        fontSize: '1.5rem',
        flexShrink: 0,
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(236, 72, 153, 0.2)',
        borderRadius: '8px'
      }}>
        {note.icon || '📝'}
      </div>

      {/* Información principal */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.5rem' }}>
          <h4 style={{ 
            color: 'white', 
            margin: 0,
            fontSize: '1.1rem',
            fontWeight: '600',
            flex: 1
          }}>
            {note.title}
          </h4>
          
          {/* Categoría */}
          {note.category && (
            <span style={{
              padding: '0.25rem 0.5rem',
              background: `${getCategoryColor(note.category)}20`,
              color: getCategoryColor(note.category),
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '600',
              flexShrink: 0
            }}>
              {note.category}
            </span>
          )}
        </div>

        {/* Contenido preview */}
        {plainContent && (
          <p style={{ 
            color: 'var(--text-muted)', 
            margin: '0 0 0.5rem 0',
            fontSize: '0.85rem',
            lineHeight: '1.4',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {plainContent}
          </p>
        )}

        {/* Fecha */}
        <div style={{ 
          fontSize: '0.8rem', 
          color: '#6b7280',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>
            📅 {new Date(note.createdAt).toLocaleDateString()}
          </span>
          
          {/* Acciones */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
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
      </div>
    </div>
  )
}

// Panel de detalles de la nota seleccionada
function NoteDetails({ note, onClose, onEdit, onDelete, connections, campaign }) {
  // Obtener elementos conectados
  const linkedItems = connections?.getLinkedItems(note) || {}

  const getCategoryColor = (category) => {
    const colors = {
      'General': '#6b7280',
      'Sesión': '#3b82f6',
      'Trama': '#8b5cf6',
      'Personajes': '#10b981',
      'Mundo': '#f59e0b',
      'Reglas': '#ef4444'
    }
    return colors[category] || '#6b7280'
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
          <div style={{ fontSize: '2.5rem' }}>
            {note.icon || '📝'}
          </div>
          <div>
            <h3 style={{ color: 'white', margin: 0, fontSize: '1.5rem' }}>
              {note.title}
            </h3>
            {note.category && (
              <span style={{
                display: 'inline-block',
                marginTop: '0.5rem',
                padding: '0.5rem 1rem',
                background: `${getCategoryColor(note.category)}20`,
                color: getCategoryColor(note.category),
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                {note.category}
              </span>
            )}
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

      {/* Contenido */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ color: 'white', marginBottom: '1rem' }}>Contenido</h4>
        <div 
          style={{ 
            color: 'var(--text-secondary)', 
            lineHeight: '1.6',
            background: 'rgba(31, 41, 55, 0.3)',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid rgba(139, 92, 246, 0.1)'
          }}
          dangerouslySetInnerHTML={{ __html: note.content || '' }}
        />
      </div>

      {/* Fecha de creación */}
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          📅 Creada el {new Date(note.createdAt).toLocaleDateString()} a las {new Date(note.createdAt).toLocaleTimeString()}
        </p>
        {note.modifiedAt && note.modifiedAt !== note.createdAt && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            ✏️ Última modificación: {new Date(note.modifiedAt).toLocaleDateString()} a las {new Date(note.modifiedAt).toLocaleTimeString()}
          </p>
        )}
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

// Formulario para crear/editar notas
function NoteForm({ note, onSave, onClose, existingCategories }) {
  const [formData, setFormData] = useState({
    title: note?.title || '',
    content: note?.content || '',
    category: note?.category || 'General',
    icon: note?.icon || '📝'
  })

  const [errors, setErrors] = useState({})

  // Categorías predefinidas
  const predefinedCategories = ['General', 'Sesión', 'Trama', 'Personajes', 'Mundo', 'Reglas']
  const allCategories = [...new Set([...predefinedCategories, ...existingCategories])]

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
    if (!formData.title.trim()) newErrors.title = 'El título es obligatorio'
    if (!formData.content.trim()) newErrors.content = 'El contenido es obligatorio'
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0) {
      const noteData = {
        ...formData,
        modifiedAt: note ? new Date().toISOString() : undefined
      }
      onSave(noteData)
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
        maxWidth: '700px',
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
          {note ? '✏️ Editar Nota' : '📝 Nueva Nota'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'grid',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {/* Título y categoría */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                  Título *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ej: Notas de la Sesión 5"
                  className="input-field"
                  style={{
                    borderColor: errors.title ? '#ef4444' : undefined
                  }}
                />
                {errors.title && (
                  <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>
                    {errors.title}
                  </p>
                )}
              </div>

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
                  {allCategories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contenido */}
            <div>
              <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                Contenido *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Escribe el contenido de tu nota aquí..."
                className="input-field"
                style={{ 
                  minHeight: '300px', 
                  resize: 'vertical',
                  borderColor: errors.content ? '#ef4444' : undefined,
                  fontFamily: 'inherit'
                }}
              />
              {errors.content && (
                <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>
                  {errors.content}
                </p>
              )}
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                💡 Puedes usar HTML básico para formatear tu texto (negrita, cursiva, listas, etc.)
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