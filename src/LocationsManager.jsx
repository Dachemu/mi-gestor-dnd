import React, { useState } from 'react'

// Datos de ejemplo para lugares
const exampleLocations = [
  {
    id: 1,
    name: "Taberna del Dragón Dorado",
    type: "Comercio",
    description: "Una acogedora taberna en el centro de la ciudad donde aventureros se reúnen para compartir historias.",
    inhabitants: "Innkeeper Gareth y varios clientes habituales",
    importance: "Media",
    icon: "🍺",
    createdAt: "2024-01-15"
  },
  {
    id: 2,
    name: "Torre del Mago Oscuro",
    type: "Mazmorra",
    description: "Una torre misteriosa envuelta en niebla perpetua. Se dice que guarda secretos arcanos.",
    inhabitants: "El Mago Malachar y sus servidores",
    importance: "Alta",
    icon: "🗼",
    createdAt: "2024-01-16"
  }
]

function LocationsManager({ campaign }) {
  const [locations, setLocations] = useState(exampleLocations)
  const [showForm, setShowForm] = useState(false)
  const [editingLocation, setEditingLocation] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)

  // Crear nuevo lugar
  const handleCreateLocation = (locationData) => {
    const newLocation = {
      ...locationData,
      id: Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    }
    setLocations(prev => [...prev, newLocation])
    setShowForm(false)
    alert(`¡Lugar "${newLocation.name}" creado exitosamente! 🎉`)
  }

  // Editar lugar existente
  const handleEditLocation = (locationData) => {
    setLocations(prev => prev.map(loc => 
      loc.id === editingLocation.id 
        ? { ...locationData, id: editingLocation.id, createdAt: editingLocation.createdAt }
        : loc
    ))
    setEditingLocation(null)
    setShowForm(false)
    alert(`¡Lugar "${locationData.name}" actualizado! ✨`)
  }

  // Eliminar lugar
  const handleDeleteLocation = (locationId, locationName) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${locationName}"?`)) {
      setLocations(prev => prev.filter(loc => loc.id !== locationId))
      if (selectedLocation?.id === locationId) {
        setSelectedLocation(null)
      }
      alert(`Lugar "${locationName}" eliminado`)
    }
  }

  // Abrir formulario para editar
  const openEditForm = (location) => {
    setEditingLocation(location)
    setShowForm(true)
  }

  // Abrir formulario para crear
  const openCreateForm = () => {
    setEditingLocation(null)
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
            📍 Lugares
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>
            Los lugares dan vida a tu mundo de {campaign.name}
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="btn-primary"
        >
          ➕ Añadir Lugar
        </button>
      </div>

      {/* Vista principal */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: selectedLocation ? '1fr 400px' : '1fr',
        gap: '2rem',
        transition: 'all 0.3s ease'
      }}>
        
        {/* Lista de lugares */}
        <div>
          {locations.length === 0 ? (
            <EmptyState onAddFirst={openCreateForm} />
          ) : (
            <LocationsList 
              locations={locations}
              onEdit={openEditForm}
              onDelete={handleDeleteLocation}
              onSelect={setSelectedLocation}
              selectedId={selectedLocation?.id}
            />
          )}
        </div>

        {/* Panel de detalles */}
        {selectedLocation && (
          <LocationDetails 
            location={selectedLocation}
            onClose={() => setSelectedLocation(null)}
            onEdit={() => openEditForm(selectedLocation)}
            onDelete={() => handleDeleteLocation(selectedLocation.id, selectedLocation.name)}
          />
        )}
      </div>

      {/* Formulario modal */}
      {showForm && (
        <LocationForm
          location={editingLocation}
          onSave={editingLocation ? handleEditLocation : handleCreateLocation}
          onClose={() => {
            setShowForm(false)
            setEditingLocation(null)
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
      <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>📍</div>
      <h3 style={{ color: 'var(--text-muted)', fontSize: '1.5rem', marginBottom: '1rem' }}>
        No hay lugares creados
      </h3>
      <p style={{ color: 'var(--text-disabled)', marginBottom: '2rem' }}>
        Los lugares dan vida a tu mundo. Crea tavernas, mazmorras, ciudades y más.
      </p>
      <button onClick={onAddFirst} className="btn-primary">
        📍 Crear el primer lugar
      </button>
    </div>
  )
}

// Lista de lugares
function LocationsList({ locations, onEdit, onDelete, onSelect, selectedId }) {
  return (
    <div style={{
      display: 'grid',
      gap: '1rem'
    }}>
      {locations.map(location => (
        <LocationCard
          key={location.id}
          location={location}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelect={onSelect}
          isSelected={selectedId === location.id}
        />
      ))}
    </div>
  )
}

// Tarjeta individual de lugar
function LocationCard({ location, onEdit, onDelete, onSelect, isSelected }) {
  const importanceColors = {
    'Baja': '#6b7280',
    'Media': '#f59e0b', 
    'Alta': '#ef4444',
    'Crítica': '#8b5cf6'
  }

  return (
    <div
      onClick={() => onSelect(location)}
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
            onEdit(location)
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
            onDelete(location.id, location.name)
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
          <span style={{ fontSize: '2.5rem' }}>{location.icon}</span>
          <div>
            <h3 style={{ 
              color: 'white', 
              fontSize: '1.25rem', 
              fontWeight: 'bold',
              margin: 0
            }}>
              {location.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
              <span style={{ 
                color: 'var(--text-muted)', 
                fontSize: '0.9rem' 
              }}>
                {location.type}
              </span>
              <span style={{
                background: `${importanceColors[location.importance]}20`,
                color: importanceColors[location.importance],
                padding: '0.125rem 0.5rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                {location.importance}
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
          {location.description}
        </p>

        <div style={{ 
          fontSize: '0.8rem', 
          color: 'var(--text-disabled)'
        }}>
          Creado: {new Date(location.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}

// Panel de detalles del lugar seleccionado
function LocationDetails({ location, onClose, onEdit, onDelete }) {
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
          <span style={{ fontSize: '3rem' }}>{location.icon}</span>
          <div>
            <h3 style={{ 
              color: 'white', 
              fontSize: '1.5rem', 
              fontWeight: 'bold',
              margin: 0
            }}>
              {location.name}
            </h3>
            <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
              {location.type}
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
          {location.description}
        </p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Habitantes</h4>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          {location.inhabitants}
        </p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Importancia</h4>
        <span style={{
          background: 'rgba(139, 92, 246, 0.2)',
          color: '#a78bfa',
          padding: '0.25rem 0.75rem',
          borderRadius: '12px',
          fontSize: '0.9rem',
          fontWeight: '600'
        }}>
          {location.importance}
        </span>
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

// Formulario para crear/editar lugares
function LocationForm({ location, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: location?.name || '',
    type: location?.type || '',
    description: location?.description || '',
    inhabitants: location?.inhabitants || '',
    importance: location?.importance || 'Media',
    icon: location?.icon || '🏛️'
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
    if (!formData.type.trim()) {
      newErrors.type = 'El tipo es obligatorio'
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

  // Lista de emojis para lugares
  const locationIcons = ['🏛️', '🏰', '🏯', '🗼', '⛪', '🏚️', '🏠', '🏪', '🏨', '🏦', '🏭', '⛺', '🏕️', '🍺', '⚔️', '🗡️', '💎', '📚', '🔥', '❄️']

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
        overflow: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
            {location ? '✏️ Editar Lugar' : '📍 Nuevo Lugar'}
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
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {locationIcons.map(icon => (
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

          {/* Nombre */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
              Nombre del lugar *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Taberna del Dragón Dorado"
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

          {/* Tipo */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
              Tipo de lugar *
            </label>
            <input
              type="text"
              name="type"
              value={formData.type}
              onChange={handleChange}
              placeholder="Ej: Taberna, Ciudad, Mazmorra, Bosque"
              style={{
                width: '100%',
                background: 'rgba(31, 41, 55, 0.5)',
                border: `1px solid ${errors.type ? '#ef4444' : 'rgba(139, 92, 246, 0.2)'}`,
                borderRadius: '10px',
                padding: '0.75rem',
                color: 'white',
                fontSize: '1rem'
              }}
            />
            {errors.type && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>{errors.type}</p>}
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
              placeholder="Describe este lugar..."
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

          {/* Habitantes */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
              Habitantes
            </label>
            <input
              type="text"
              name="inhabitants"
              value={formData.inhabitants}
              onChange={handleChange}
              placeholder="Ej: Posadero Gareth y clientes habituales"
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

          {/* Importancia */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
              Importancia
            </label>
            <select
              name="importance"
              value={formData.importance}
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
              <option value="Baja">Importancia Baja</option>
              <option value="Media">Importancia Media</option>
              <option value="Alta">Importancia Alta</option>
              <option value="Crítica">Importancia Crítica</option>
            </select>
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
              {location ? '💾 Actualizar' : '📍 Crear Lugar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LocationsManager