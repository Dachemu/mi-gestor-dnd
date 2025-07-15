import React, { useState } from 'react'
import { useCRUD } from './hooks/useCRUD'
import ConnectionsDisplay from './components/ConnectionsDisplay'

// 🎯 SIN DATOS DE EJEMPLO - usa directamente los datos de la campaña

function LocationsManager({ campaign, connections }) {
  // ✨ Hook CRUD para manejar todos los estados - USA DATOS DE LA CAMPAÑA
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
  } = useCRUD(campaign.locations || [], 'Lugar')

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
              onDelete={handleDelete}
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
        Los lugares dan vida a tu mundo. Crea ciudades, mazmorras, bosques y territorios épicos.
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
    'Alta': '#ef4444'
  }

  const typeColors = {
    'Ciudad': '#3b82f6',
    'Mazmorra': '#8b5cf6',
    'Naturaleza': '#10b981',
    'Comercio': '#f59e0b',
    'Fortaleza': '#ef4444',
    'Templo': '#06b6d4',
    'Otro': '#9ca3af'
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
        transition: 'all 0.3s ease',
        position: 'relative'
      }}
    >
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '2rem' }}>{location.icon}</span>
          <div>
            <h3 style={{ 
              color: 'white', 
              fontSize: '1.2rem', 
              fontWeight: 'bold',
              margin: 0
            }}>
              {location.name}
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span style={{
                background: `${typeColors[location.type] || '#9ca3af'}20`,
                color: typeColors[location.type] || '#9ca3af',
                padding: '0.125rem 0.5rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                {location.type}
              </span>
              <span style={{
                background: `${importanceColors[location.importance] || '#6b7280'}20`,
                color: importanceColors[location.importance] || '#6b7280',
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

        {/* Conexiones */}
        {connectionCount > 0 && (
          <div style={{
            background: 'rgba(139, 92, 246, 0.2)',
            color: '#a78bfa',
            padding: '0.25rem 0.5rem',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}>
            🔗 {connectionCount}
          </div>
        )}
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
        {location.description}
      </p>

      {/* Habitantes */}
      {location.inhabitants && (
        <p style={{ 
          color: 'var(--text-muted)', 
          fontSize: '0.9rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          👥 {location.inhabitants}
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
            onEdit(location)
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
      top: '2rem'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '2.5rem' }}>{location.icon}</span>
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
              {location.type} - {location.importance} importancia
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '1.5rem'
          }}
        >
          ✕
        </button>
      </div>

      {/* Descripción */}
      {location.description && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Descripción</h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {location.description}
          </p>
        </div>
      )}

      {/* Habitantes */}
      {location.inhabitants && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Habitantes</h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            👥 {location.inhabitants}
          </p>
        </div>
      )}

      {/* Notas */}
      {location.notes && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Notas</h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {location.notes}
          </p>
        </div>
      )}

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
    type: location?.type || 'Ciudad',
    description: location?.description || '',
    inhabitants: location?.inhabitants || '',
    importance: location?.importance || 'Media',
    notes: location?.notes || '',
    icon: location?.icon || '🏰'
  })

  const [errors, setErrors] = useState({})

  // Opciones para selects
  const typeOptions = [
    'Ciudad', 'Mazmorra', 'Naturaleza', 'Comercio', 
    'Fortaleza', 'Templo', 'Otro'
  ]
  
  const importanceOptions = ['Baja', 'Media', 'Alta']

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Validar formulario
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria'
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'La descripción debe tener al menos 10 caracteres'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // Crear objeto de lugar
    const locationData = {
      id: location?.id || Date.now() + Math.random(),
      ...formData,
      name: formData.name.trim(),
      description: formData.description.trim(),
      inhabitants: formData.inhabitants.trim(),
      notes: formData.notes.trim(),
      linkedItems: location?.linkedItems || {
        npcs: [],
        players: [],
        quests: [],
        objects: [],
        notes: []
      },
      createdAt: location?.createdAt || new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0]
    }

    onSave(locationData)
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
        overflowY: 'auto'
      }}>
        <h3 style={{ 
          color: 'white', 
          fontSize: '1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          📍 {location ? 'Editar Lugar' : 'Nuevo Lugar'}
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Nombre */}
            <div>
              <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                Nombre del lugar *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej: Taberna del Dragón Dorado"
                className="input-field"
                style={{
                  border: errors.name ? '1px solid #ef4444' : undefined
                }}
              />
              {errors.name && (
                <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Tipo e Importancia */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                  Tipo
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="input-field"
                >
                  {typeOptions.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                  Importancia
                </label>
                <select
                  name="importance"
                  value={formData.importance}
                  onChange={handleChange}
                  className="input-field"
                >
                  {importanceOptions.map(importance => (
                    <option key={importance} value={importance}>
                      {importance}
                    </option>
                  ))}
                </select>
              </div>
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
                placeholder="Describe el lugar, su atmósfera, características distintivas..."
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

            {/* Habitantes */}
            <div>
              <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                Habitantes
              </label>
              <input
                type="text"
                name="inhabitants"
                value={formData.inhabitants}
                onChange={handleChange}
                placeholder="¿Quién vive o frecuenta este lugar?"
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
                placeholder="Secretos, hooks para aventuras, detalles importantes..."
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
              {location ? '💾 Guardar Cambios' : '➕ Crear Lugar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LocationsManager