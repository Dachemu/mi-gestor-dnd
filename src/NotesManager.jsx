import React, { useState } from 'react'

// Datos de ejemplo para notas
const exampleNotes = [
  {
    id: 1,
    title: "Reglas de la Casa",
    content: "• Los jugadores pueden usar una poción como acción bonus\n• Críticos automáticos en 20 natural\n• Muerte por daño masivo solo si el daño excede HP máximo x2\n• Descansos largos solo en lugares seguros\n• Inspiración se puede acumular hasta 2 usos",
    category: "Reglas",
    icon: "📋",
    createdAt: "2024-01-15"
  },
  {
    id: 2,
    title: "Ideas para la Próxima Sesión",
    content: "Los jugadores deben investigar los misteriosos asesinatos en la ciudad. Pistas importantes:\n\n1. Las víctimas tenían marca de colmillos\n2. Solo atacan de noche\n3. El alcalde oculta algo\n4. Los guardias patrullan menos por el barrio norte\n\nRevelar que el alcalde es en realidad un vampiro que controla a la guardia.",
    category: "Ideas",
    icon: "💡",
    createdAt: "2024-01-16"
  },
  {
    id: 3,
    title: "Calendario de Eventos",
    content: "**Mes 1:**\n- Festival de la Cosecha (días 15-17)\n- Eclipse lunar (día 23) - evento mágico\n\n**Mes 2:**\n- Llegada de mercaderes del norte (día 5)\n- Torneo de gladiadores (días 10-12)\n- Reunión del consejo (día 20)\n\n**Mes 3:**\n- Invasión orca desde las montañas\n- Los dragones despiertan",
    category: "Calendario",
    icon: "📅",
    createdAt: "2024-01-17"
  },
  {
    id: 4,
    title: "Secretos y Conspiraciones",
    content: "**El Culto de la Llama Negra:**\nUn culto secreto opera en la ciudad. Miembros conocidos:\n- Madame Zelda (adivina del mercado) - líder\n- Guardia Marcus - informante\n- El herrero Gorin - proveedor de armas\n\n**Su plan:** Invocar un demonio menor durante el próximo eclipse para tomar control de la ciudad.\n\n**Pistas para los jugadores:** Símbolos extraños, reuniones nocturnas, ciudadanos desaparecidos.",
    category: "Secretos",
    icon: "🕵️",
    createdAt: "2024-01-18"
  }
]

function NotesManager({ campaign }) {
  const [notes, setNotes] = useState(exampleNotes)
  const [showForm, setShowForm] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [selectedNote, setSelectedNote] = useState(null)
  const [filterCategory, setFilterCategory] = useState('Todas')

  // Crear nueva nota
  const handleCreateNote = (noteData) => {
    const newNote = {
      ...noteData,
      id: Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    }
    setNotes(prev => [...prev, newNote])
    setShowForm(false)
    alert(`¡Nota "${newNote.title}" creada exitosamente! 🎉`)
  }

  // Editar nota existente
  const handleEditNote = (noteData) => {
    setNotes(prev => prev.map(note => 
      note.id === editingNote.id 
        ? { ...noteData, id: editingNote.id, createdAt: editingNote.createdAt }
        : note
    ))
    setEditingNote(null)
    setShowForm(false)
    alert(`¡Nota "${noteData.title}" actualizada! ✨`)
  }

  // Eliminar nota
  const handleDeleteNote = (noteId, noteTitle) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${noteTitle}"?`)) {
      setNotes(prev => prev.filter(note => note.id !== noteId))
      if (selectedNote?.id === noteId) {
        setSelectedNote(null)
      }
      alert(`Nota "${noteTitle}" eliminada`)
    }
  }

  // Abrir formulario para editar
  const openEditForm = (note) => {
    setEditingNote(note)
    setShowForm(true)
  }

  // Abrir formulario para crear
  const openCreateForm = () => {
    setEditingNote(null)
    setShowForm(true)
  }

  // Filtrar notas por categoría
  const filteredNotes = filterCategory === 'Todas' 
    ? notes 
    : notes.filter(note => note.category === filterCategory)

  // Obtener categorías únicas
  const categories = ['Todas', ...new Set(notes.map(note => note.category))]

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
            Ideas, reglas y recordatorios para {campaign.name}
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="btn-primary"
        >
          ➕ Añadir Nota
        </button>
      </div>

      {/* Filtros por categoría */}
      {notes.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  border: 'none',
                  background: filterCategory === category 
                    ? 'rgba(139, 92, 246, 0.3)' 
                    : 'rgba(31, 41, 55, 0.5)',
                  color: filterCategory === category 
                    ? 'white' 
                    : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                {category}
                {category !== 'Todas' && (
                  <span style={{
                    marginLeft: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '10px',
                    padding: '0.125rem 0.375rem',
                    fontSize: '0.75rem'
                  }}>
                    {notes.filter(note => note.category === category).length}
                  </span>
                )}
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
          {filteredNotes.length === 0 ? (
            filterCategory === 'Todas' ? (
              <EmptyState onAddFirst={openCreateForm} />
            ) : (
              <EmptyCategory category={filterCategory} onClearFilter={() => setFilterCategory('Todas')} />
            )
          ) : (
            <NotesList 
              notes={filteredNotes}
              onEdit={openEditForm}
              onDelete={handleDeleteNote}
              onSelect={setSelectedNote}
              selectedId={selectedNote?.id}
            />
          )}
        </div>

        {/* Panel de detalles */}
        {selectedNote && (
          <NoteDetails 
            note={selectedNote}
            onClose={() => setSelectedNote(null)}
            onEdit={() => openEditForm(selectedNote)}
            onDelete={() => handleDeleteNote(selectedNote.id, selectedNote.title)}
          />
        )}
      </div>

      {/* Formulario modal */}
      {showForm && (
        <NoteForm
          note={editingNote}
          onSave={editingNote ? handleEditNote : handleCreateNote}
          onClose={() => {
            setShowForm(false)
            setEditingNote(null)
          }}
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
        Las notas te ayudan a recordar ideas, reglas especiales y detalles importantes.
      </p>
      <button onClick={onAddFirst} className="btn-primary">
        📝 Crear la primera nota
      </button>
    </div>
  )
}

// Componente de categoría vacía
function EmptyCategory({ category, onClearFilter }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
      <h3 style={{ color: 'var(--text-muted)', fontSize: '1.5rem', marginBottom: '1rem' }}>
        No hay notas en "{category}"
      </h3>
      <p style={{ color: 'var(--text-disabled)', marginBottom: '2rem' }}>
        Prueba con otra categoría o ve todas las notas.
      </p>
      <button onClick={onClearFilter} className="btn-primary">
        📝 Ver todas las notas
      </button>
    </div>
  )
}

// Lista de notas
function NotesList({ notes, onEdit, onDelete, onSelect, selectedId }) {
  return (
    <div style={{
      display: 'grid',
      gap: '1rem'
    }}>
      {notes.map(note => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelect={onSelect}
          isSelected={selectedId === note.id}
        />
      ))}
    </div>
  )
}

// Tarjeta individual de nota
function NoteCard({ note, onEdit, onDelete, onSelect, isSelected }) {
  const categoryColors = {
    'Reglas': '#3b82f6',
    'Ideas': '#f59e0b',
    'Calendario': '#10b981',
    'Secretos': '#8b5cf6',
    'Personajes': '#ef4444',
    'Lugares': '#06b6d4',
    'General': '#6b7280'
  }

  const categoryColor = categoryColors[note.category] || categoryColors['General']

  // Obtener preview del contenido (primeras líneas sin formato)
  const getContentPreview = (content) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remover negritas
      .replace(/\n/g, ' ') // Remover saltos de línea
      .substring(0, 150) + (content.length > 150 ? '...' : '')
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
            onEdit(note)
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

      {/* Contenido principal */}
      <div style={{ paddingRight: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '2.5rem' }}>{note.icon}</span>
          <div>
            <h3 style={{ 
              color: 'white', 
              fontSize: '1.25rem', 
              fontWeight: 'bold',
              margin: 0
            }}>
              {note.title}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
              <span style={{
                background: `${categoryColor}20`,
                color: categoryColor,
                padding: '0.125rem 0.5rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                {note.category}
              </span>
              <span style={{ 
                color: 'var(--text-disabled)', 
                fontSize: '0.8rem' 
              }}>
                {new Date(note.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <p style={{ 
          color: 'var(--text-secondary)', 
          lineHeight: '1.5',
          marginBottom: '0',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {getContentPreview(note.content)}
        </p>
      </div>
    </div>
  )
}

// Panel de detalles de la nota seleccionada
function NoteDetails({ note, onClose, onEdit, onDelete }) {
  const categoryColors = {
    'Reglas': '#3b82f6',
    'Ideas': '#f59e0b',
    'Calendario': '#10b981',
    'Secretos': '#8b5cf6',
    'Personajes': '#ef4444',
    'Lugares': '#06b6d4',
    'General': '#6b7280'
  }

  const categoryColor = categoryColors[note.category] || categoryColors['General']

  // Formatear contenido con negritas y saltos de línea
  const formatContent = (content) => {
    return content
      .split('\n')
      .map((line, index) => {
        // Procesar negritas
        const parts = line.split(/(\*\*.*?\*\*)/g)
        return (
          <div key={index} style={{ marginBottom: index < content.split('\n').length - 1 ? '0.5rem' : 0 }}>
            {parts.map((part, partIndex) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={partIndex} style={{ color: 'white' }}>
                    {part.slice(2, -2)}
                  </strong>
                )
              }
              return part
            })}
          </div>
        )
      })
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
              <span style={{
                background: `${categoryColor}20`,
                color: categoryColor,
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                {note.category}
              </span>
              <span style={{ color: 'var(--text-disabled)', fontSize: '0.8rem' }}>
                {new Date(note.createdAt).toLocaleDateString()}
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
        <h4 style={{ color: 'white', marginBottom: '1rem' }}>Contenido</h4>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          padding: '1.5rem',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          <div style={{ 
            color: 'var(--text-secondary)', 
            lineHeight: '1.6',
            fontSize: '0.95rem'
          }}>
            {formatContent(note.content)}
          </div>
        </div>
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

// Formulario para crear/editar notas
function NoteForm({ note, onSave, onClose }) {
  const [formData, setFormData] = useState({
    title: note?.title || '',
    content: note?.content || '',
    category: note?.category || 'General',
    icon: note?.icon || '📝'
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

  // Listas de opciones
  const noteIcons = ['📝', '📋', '💡', '📅', '🕵️', '⚖️', '🎯', '📊', '🔍', '💭', '📌', '🗂️', '📖', '💰', '⚡', '🎲', '🗡️', '🛡️', '🔮', '🎭']
  const noteCategories = ['General', 'Reglas', 'Ideas', 'Calendario', 'Secretos', 'Personajes', 'Lugares', 'Combate', 'Tesoros', 'Historia']

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
            {note ? '✏️ Editar Nota' : '📝 Nueva Nota'}
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
              {noteIcons.map(icon => (
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

          {/* Título y Categoría */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
                Título de la nota *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ej: Reglas de la Casa"
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

            <div>
              <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
                Categoría
              </label>
              <select
                name="category"
                value={formData.category}
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
                {noteCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Contenido */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
              Contenido de la nota *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Escribe el contenido de tu nota aquí...&#10;&#10;Puedes usar **texto en negrita** para resaltar partes importantes."
              rows={12}
              style={{
                width: '100%',
                background: 'rgba(31, 41, 55, 0.5)',
                border: `1px solid ${errors.content ? '#ef4444' : 'rgba(139, 92, 246, 0.2)'}`,
                borderRadius: '10px',
                padding: '0.75rem',
                color: 'white',
                fontSize: '1rem',
                resize: 'vertical',
                fontFamily: 'inherit',
                lineHeight: '1.6'
              }}
            />
            {errors.content && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>{errors.content}</p>}
            <p style={{ color: 'var(--text-disabled)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
              Tip: Usa **texto** para ponerlo en negrita
            </p>
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
              {note ? '💾 Actualizar' : '📝 Crear Nota'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NotesManager