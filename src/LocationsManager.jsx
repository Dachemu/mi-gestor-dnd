import React, { useState } from 'react'
import { useCRUD } from './hooks/useCRUD'
import ConnectionsDisplay from './components/ConnectionsDisplay'

// Datos de ejemplo para lugares (SIN IDs hardcodeados)
const EXAMPLE_LOCATIONS = [
  {
    id: 1,
    name: "Taberna del Dragón Dorado",
    type: "Comercio",
    description: "Una acogedora taberna en el centro de la ciudad donde aventureros se reúnen para compartir historias.",
    inhabitants: "Innkeeper Gareth y varios clientes habituales",
    importance: "Media",
    icon: "🍺",
    linkedItems: {
      npcs: [],
      players: [],
      quests: [],
      objects: [],
      notes: []
    },
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
    linkedItems: {
      npcs: [],
      players: [],
      quests: [],
      objects: [],
      notes: []
    },
    createdAt: "2024-01-16"
  }
]

function LocationsManager({ campaign, connections }) {
  // ✨ Todo el estado y lógica CRUD en una línea
  const {
    items: locations,
    showForm,
    editingItem,
    selectedItem: selectedLocation,
    isEmpty,
    handleSave,
    handleDelete,
    selectItem: selectLocation,
    openCreateForm,
    openEditForm,
    closeForm,
    closeDetails
  } = useCRUD(EXAMPLE_LOCATIONS, 'Lugar')

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
        <button onClick={openCreateForm} className="btn-primary">
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
          {isEmpty ? (
            <EmptyState onAddFirst={openCreateForm} />
          ) : (
            <LocationsList 
              locations={locations}
              onEdit={openEditForm}
              onDelete={(id, name) => handleDelete(id, name)}
              onSelect={selectLocation}
              selectedId={selectedLocation?.id}
              connections={connections}
            />
          )}
        </div>

        {/* Panel de detalles */}
        {selectedLocation && (
          <LocationDetails 
            location={selectedLocation}
            onClose={closeDetails}
            onEdit={() => openEditForm(selectedLocation)}
            onDelete={() => handleDelete(selectedLocation.id, selectedLocation.name)}
            connections={connections}
            campaign={campaign}
          />
        )}
      </div>

      {/* Formulario modal */}
      {showForm && (
        <LocationForm
          location={editingItem}
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
function LocationsList({ locations, onEdit, onDelete, onSelect, selectedId, connections }) {
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {locations.map(location => (
        <LocationCard
          key={location.id}
          location={location}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelect={onSelect}
          isSelected={selectedId === location.id}
          connectionCount={connections?.getConnectionCount(location) || 0}
        />
      ))}
    </div>
  )
}

// Tarjeta individual de lugar
function LocationCard({ location, onEdit, onDelete, onSelect, isSelected, connectionCount }) {
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
          ? 'rgba(139, 92, 246, 0.5)' 
          : 'var(--glass-border)'}`,
        borderRadius: '16px',
        padding: '1.5rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.target.style.background = 'rgba(139, 92, 246, 0.05)'
          e.target.style.transform = 'translateY(-2px)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.target.style.background = 'var(--glass-bg)'
          e.target.style.transform = 'translateY(0)'
        }
      }}
    >
      {/* Header con acciones */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
          <span style={{ fontSize: '2.5rem' }}>{location.icon}</span>
          <div>
            <h3 style={{ 
              color: 'white', 
              fontSize: '1.3rem', 
              fontWeight: 'bold',
              margin: 0
            }}>
              {location.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
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
              {/* Indicador de conexiones */}
              {connectionCount > 0 && (
                <span style={{
                  background: 'rgba(139, 92, 246, 0.2)',
                  color: '#8b5cf6',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  🔗 {connectionCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(location)
            }}
            style={{
              background: 'rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '6px',
              color: '#8b5cf6',
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
  )
}

// Panel de detalles del lugar seleccionado
function LocationDetails({ location, onClose, onEdit, onDelete, connections, campaign }) {
  // Obtener elementos conectados
  const linkedItems = connections?.getLinkedItems(location) || {}

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

      {/* 🔗 SISTEMA DE CONEXIONES */}
      {connections && (
        <div style={{ marginBottom: '2rem' }}>
          <ConnectionsDisplay
            item={location}
            itemType="locations"
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

// Formulario para crear/editar lugares
function LocationForm({ location, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: location?.name || '',
    type: location?.type || '',
    description: location?.description || '',
    inhabitants: location?.inhabitants || '',
    importance: location?.importance || 'Media',
    icon: location?.icon || '🏛️',
    linkedItems: location?.linkedItems || {
      npcs: [],
      players: [],
      quests: [],
      objects: [],
      notes: []
    }
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
          <button
            onClick={onClose}
            style={{
              background: 'rgba(107, 114, 128, 0.2)',
              border: '1px solid rgba(107, 114, 128, 0.3)',
              borderRadius: '6px',
              color: '#9ca3af',
              padding: '0.5rem',
              cursor: 'pointer',
              fontSize: '1.2rem'
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Nombre */}
          <div style={{ marginBottom: '2rem' }}>
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
                border: errors.name ? '1px solid #ef4444' : '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '10px',
                padding: '0.75rem',
                color: 'white',
                fontSize: '1rem'
              }}
            />
            {errors.name && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.name}</span>}
          </div>

          {/* Tipo */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
              Tipo de lugar *
            </label>
            <input
              type="text"
              name="type"
              value={formData.type}
              onChange={handleChange}
              placeholder="Ej: Comercio, Mazmorra, Ciudad, etc."
              style={{
                width: '100%',
                background: 'rgba(31, 41, 55, 0.5)',
                border: errors.type ? '1px solid #ef4444' : '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '10px',
                padding: '0.75rem',
                color: 'white',
                fontSize: '1rem'
              }}
            />
            {errors.type && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.type}</span>}
          </div>

          {/* Descripción */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
              Descripción *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe el lugar, su ambiente, características especiales..."
              rows={3}
              style={{
                width: '100%',
                background: 'rgba(31, 41, 55, 0.5)',
                border: errors.description ? '1px solid #ef4444' : '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '10px',
                padding: '0.75rem',
                color: 'white',
                fontSize: '1rem',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
            {errors.description && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.description}</span>}
          </div>

          {/* Habitantes */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
              Habitantes
            </label>
            <input
              type="text"
              name="inhabitants"
              value={formData.inhabitants}
              onChange={handleChange}
              placeholder="¿Quién vive o frecuenta este lugar?"
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

          {/* Selector de icono */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
              Icono
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              {locationIcons.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  style={{
                    background: formData.icon === icon 
                      ? 'rgba(139, 92, 246, 0.3)' 
                      : 'rgba(31, 41, 55, 0.5)',
                    border: `1px solid ${formData.icon === icon 
                      ? 'rgba(139, 92, 246, 0.5)' 
                      : 'rgba(139, 92, 246, 0.2)'}`,
                    borderRadius: '8px',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    aspectRatio: '1'
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
            <input
              type="text"
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              placeholder="O escribe tu propio emoji"
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