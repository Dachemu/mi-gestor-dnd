import React, { useState } from 'react'

// Datos de ejemplo para objetos
const exampleObjects = [
  {
    id: 1,
    name: "Espada de la Luna Creciente",
    type: "Arma",
    rarity: "Épico",
    icon: "⚔️",
    owner: "Thorin Escudoférro",
    location: "",
    description: "Una espada élfica forjada bajo la luz de la luna llena, brilla con luz plateada durante la noche.",
    properties: "+2 al ataque, daño radiante contra no-muertos",
    notes: "Forjada por los elfos de Rivendel hace 300 años. Se dice que solo los de corazón puro pueden empuñarla.",
    createdAt: "2024-01-15"
  },
  {
    id: 2,
    name: "Poción de Curación Superior",
    type: "Poción",
    rarity: "Poco común",
    icon: "🧪",
    owner: "",
    location: "Tienda de Aldemar el Alquimista",
    description: "Líquido rojo brillante en una botella de cristal que restaura vitalidad instantáneamente.",
    properties: "Restaura 4d4+4 puntos de vida",
    notes: "Se puede beber como acción bonus. El efecto es instantáneo y dura hasta el siguiente descanso.",
    createdAt: "2024-01-16"
  },
  {
    id: 3,
    name: "Armadura del Dragón Dorado",
    type: "Armadura",
    rarity: "Legendario",
    icon: "🛡️",
    owner: "",
    location: "Tesoro del Dragón Ancestral",
    description: "Armadura de escamas doradas que brilla como el sol y otorga la bendición dracónica.",
    properties: "CA 18, resistencia al fuego, vuelo 60 pies 1 vez al día",
    notes: "Hecha con escamas del primer dragón dorado. Quien la porta puede entender el idioma dracónico.",
    createdAt: "2024-01-17"
  }
]

function ObjectsManager({ campaign }) {
  const [objects, setObjects] = useState(exampleObjects)
  const [showForm, setShowForm] = useState(false)
  const [editingObject, setEditingObject] = useState(null)
  const [selectedObject, setSelectedObject] = useState(null)

  // Crear nuevo objeto
  const handleCreateObject = (objectData) => {
    const newObject = {
      ...objectData,
      id: Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    }
    setObjects(prev => [...prev, newObject])
    setShowForm(false)
    alert(`¡Objeto "${newObject.name}" creado exitosamente! 🎉`)
  }

  // Editar objeto existente
  const handleEditObject = (objectData) => {
    setObjects(prev => prev.map(obj => 
      obj.id === editingObject.id 
        ? { ...objectData, id: editingObject.id, createdAt: editingObject.createdAt }
        : obj
    ))
    setEditingObject(null)
    setShowForm(false)
    alert(`¡Objeto "${objectData.name}" actualizado! ✨`)
  }

  // Eliminar objeto
  const handleDeleteObject = (objectId, objectName) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${objectName}"?`)) {
      setObjects(prev => prev.filter(obj => obj.id !== objectId))
      if (selectedObject?.id === objectId) {
        setSelectedObject(null)
      }
      alert(`Objeto "${objectName}" eliminado`)
    }
  }

  // Abrir formulario para editar
  const openEditForm = (object) => {
    setEditingObject(object)
    setShowForm(true)
  }

  // Abrir formulario para crear
  const openCreateForm = () => {
    setEditingObject(null)
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
            📦 Objetos
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>
            Los objetos mágicos dan poder a las aventuras de {campaign.name}
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="btn-primary"
        >
          ➕ Añadir Objeto
        </button>
      </div>

      {/* Vista principal */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: selectedObject ? '1fr 400px' : '1fr',
        gap: '2rem',
        transition: 'all 0.3s ease'
      }}>
        
        {/* Lista de objetos */}
        <div>
          {objects.length === 0 ? (
            <EmptyState onAddFirst={openCreateForm} />
          ) : (
            <ObjectsList 
              objects={objects}
              onEdit={openEditForm}
              onDelete={handleDeleteObject}
              onSelect={setSelectedObject}
              selectedId={selectedObject?.id}
            />
          )}
        </div>

        {/* Panel de detalles */}
        {selectedObject && (
          <ObjectDetails 
            object={selectedObject}
            onClose={() => setSelectedObject(null)}
            onEdit={() => openEditForm(selectedObject)}
            onDelete={() => handleDeleteObject(selectedObject.id, selectedObject.name)}
          />
        )}
      </div>

      {/* Formulario modal */}
      {showForm && (
        <ObjectForm
          object={editingObject}
          onSave={editingObject ? handleEditObject : handleCreateObject}
          onClose={() => {
            setShowForm(false)
            setEditingObject(null)
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
      <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>📦</div>
      <h3 style={{ color: 'var(--text-muted)', fontSize: '1.5rem', marginBottom: '1rem' }}>
        No hay objetos creados
      </h3>
      <p style={{ color: 'var(--text-disabled)', marginBottom: '2rem' }}>
        Los objetos mágicos dan poder a las aventuras. Crea armas, armaduras, pociones y más.
      </p>
      <button onClick={onAddFirst} className="btn-primary">
        📦 Crear el primer objeto
      </button>
    </div>
  )
}

// Lista de objetos
function ObjectsList({ objects, onEdit, onDelete, onSelect, selectedId }) {
  return (
    <div style={{
      display: 'grid',
      gap: '1rem'
    }}>
      {objects.map(object => (
        <ObjectCard
          key={object.id}
          object={object}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelect={onSelect}
          isSelected={selectedId === object.id}
        />
      ))}
    </div>
  )
}

// Tarjeta individual de objeto
function ObjectCard({ object, onEdit, onDelete, onSelect, isSelected }) {
  const rarityColors = {
    'Común': '#6b7280',
    'Poco común': '#10b981',
    'Raro': '#3b82f6', 
    'Épico': '#8b5cf6',
    'Legendario': '#f59e0b'
  }

  return (
    <div
      onClick={() => onSelect(object)}
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
            onEdit(object)
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
            onDelete(object.id, object.name)
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
          <span style={{ fontSize: '2.5rem' }}>{object.icon}</span>
          <div>
            <h3 style={{ 
              color: 'white', 
              fontSize: '1.25rem', 
              fontWeight: 'bold',
              margin: 0
            }}>
              {object.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
              <span style={{ 
                color: 'var(--text-muted)', 
                fontSize: '0.9rem' 
              }}>
                {object.type}
              </span>
              <span style={{
                background: `${rarityColors[object.rarity]}20`,
                color: rarityColors[object.rarity],
                padding: '0.125rem 0.5rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                {object.rarity}
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
          {object.description}
        </p>

        {/* Información adicional */}
        <div style={{ marginBottom: '1rem' }}>
          {object.owner && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.8rem' }}>👤</span>
              <span style={{ color: '#10b981', fontSize: '0.85rem' }}>
                Propietario: {object.owner}
              </span>
            </div>
          )}
          {object.location && !object.owner && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.8rem' }}>📍</span>
              <span style={{ color: '#3b82f6', fontSize: '0.85rem' }}>
                Ubicación: {object.location}
              </span>
            </div>
          )}
          {object.properties && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem' }}>⚡</span>
              <span style={{ 
                color: '#8b5cf6', 
                fontSize: '0.85rem',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {object.properties}
              </span>
            </div>
          )}
        </div>

        <div style={{ 
          fontSize: '0.8rem', 
          color: 'var(--text-disabled)'
        }}>
          Creado: {new Date(object.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}

// Panel de detalles del objeto seleccionado
function ObjectDetails({ object, onClose, onEdit, onDelete }) {
  const rarityColors = {
    'Común': '#6b7280',
    'Poco común': '#10b981',
    'Raro': '#3b82f6', 
    'Épico': '#8b5cf6',
    'Legendario': '#f59e0b'
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
          <span style={{ fontSize: '3rem' }}>{object.icon}</span>
          <div>
            <h3 style={{ 
              color: 'white', 
              fontSize: '1.5rem', 
              fontWeight: 'bold',
              margin: 0
            }}>
              {object.name}
            </h3>
            <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
              {object.type}
            </p>
            <span style={{
              background: `${rarityColors[object.rarity]}20`,
              color: rarityColors[object.rarity],
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: '600',
              display: 'inline-block',
              marginTop: '0.5rem'
            }}>
              {object.rarity}
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

      {/* Contenido */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Descripción</h4>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          {object.description}
        </p>
      </div>

      {object.properties && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Propiedades Mágicas</h4>
          <div style={{
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: '10px',
            padding: '1rem'
          }}>
            <p style={{ color: '#a78bfa', lineHeight: '1.6' }}>
              {object.properties}
            </p>
          </div>
        </div>
      )}

      {(object.owner || object.location) && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>
            {object.owner ? 'Propietario' : 'Ubicación'}
          </h4>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <span style={{ fontSize: '1.5rem' }}>
              {object.owner ? '👤' : '📍'}
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              {object.owner || object.location}
            </span>
          </div>
        </div>
      )}

      {object.notes && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Historia y Notas</h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {object.notes}
          </p>
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

// Formulario para crear/editar objetos
function ObjectForm({ object, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: object?.name || '',
    type: object?.type || 'Arma',
    rarity: object?.rarity || 'Común',
    icon: object?.icon || '💎',
    owner: object?.owner || '',
    location: object?.location || '',
    description: object?.description || '',
    properties: object?.properties || '',
    notes: object?.notes || ''
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

  // Listas de opciones
  const objectIcons = ['⚔️', '🗡️', '🛡️', '🏹', '🪓', '🔨', '💎', '👑', '💍', '🧪', '📜', '🔮', '🎭', '🎺', '🏺', '🗝️', '🔑', '💰', '⚱️', '🧿']
  const objectTypes = ['Arma', 'Armadura', 'Poción', 'Artefacto', 'Joya', 'Herramienta', 'Libro', 'Instrumento', 'Reliquia']
  const rarityLevels = ['Común', 'Poco común', 'Raro', 'Épico', 'Legendario']

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
            {object ? '✏️ Editar Objeto' : '📦 Nuevo Objeto'}
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
              {objectIcons.map(icon => (
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

          {/* Nombre y Tipo */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
                Nombre del objeto *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej: Espada Flamígera"
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
                Tipo
              </label>
              <select
                name="type"
                value={formData.type}
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
                {objectTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Rareza */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
              Rareza
            </label>
            <select
              name="rarity"
              value={formData.rarity}
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
              {rarityLevels.map(rarity => (
                <option key={rarity} value={rarity}>{rarity}</option>
              ))}
            </select>
          </div>

          {/* Propietario y Ubicación */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
                Propietario actual
              </label>
              <input
                type="text"
                name="owner"
                value={formData.owner}
                onChange={handleChange}
                placeholder="Ej: Thorin Escudoférro"
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
                Ubicación (si no tiene propietario)
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ej: Tesoro del Dragón"
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

          {/* Descripción */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
              Descripción *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe este objeto..."
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

          {/* Propiedades mágicas */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
              Propiedades mágicas
            </label>
            <textarea
              name="properties"
              value={formData.properties}
              onChange={handleChange}
              placeholder="Ej: +2 al ataque, resistencia al fuego..."
              rows={2}
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

          {/* Notas */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
              Historia y notas
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Historia del objeto, origen, leyendas..."
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
              {object ? '💾 Actualizar' : '📦 Crear Objeto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ObjectsManager