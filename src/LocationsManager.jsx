import React, { useState, useEffect } from 'react'
import { useCRUD } from './hooks/useCRUD.jsx'
import ConnectionsDisplay from './components/ConnectionsDisplay'
import Modal from './components/Modal'
import CompactList from './components/CompactList'

function LocationsManager({ campaign, connections, selectedItemForNavigation, updateCampaign }) {
  // ✨ Hook CRUD para manejar todos los estados
  const {
    items: locations,
    showForm,
    editingItem,
    selectedItem: selectedLocation,
    isEmpty,
    handleSave: handleSaveInternal,
    handleDelete: handleDeleteInternal,
    selectItem: selectLocation,
    openCreateForm,
    openEditForm,
    closeForm,
    closeDetails,
    NotificationComponent
  } = useCRUD(campaign.locations || [], 'Lugar')

  // ✅ Función mejorada para guardar que actualiza la campaña
  const handleSave = (itemData) => {
    const savedItem = handleSaveInternal(itemData)
    if (savedItem && updateCampaign) {
      updateCampaign({
        locations: editingItem 
          ? campaign.locations.map(location => location.id === savedItem.id ? savedItem : location)
          : [...(campaign.locations || []), savedItem]
      })
    }
  }

  // ✅ Función mejorada para eliminar que actualiza la campaña
  const handleDelete = (id, name) => {
    handleDeleteInternal(id, name)
    if (updateCampaign) {
      updateCampaign({
        locations: (campaign.locations || []).filter(location => location.id !== id)
      })
    }
  }

  // ✨ Efecto para seleccionar automáticamente un lugar cuando se navega desde conexiones
  useEffect(() => {
    if (selectedItemForNavigation && selectedItemForNavigation.type === 'locations') {
      const locationToSelect = locations.find(location => location.id === selectedItemForNavigation.item.id)
      if (locationToSelect) {
        selectLocation(locationToSelect)
      }
    }
  }, [selectedItemForNavigation, locations, selectLocation])

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
            📍 Lugares
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>
            Los escenarios donde transcurren las aventuras de {campaign.name}
          </p>
        </div>
        <button onClick={openCreateForm} className="btn-primary">
          ➕ Añadir Lugar
        </button>
      </div>

      {/* Lista compacta de lugares */}
      <CompactList
        items={locations}
        itemType="locations"
        onSelectItem={selectLocation}
        getConnectionCount={connections?.getConnectionCount}
        emptyMessage="No hay lugares aún. ¡Añade el primer escenario de tu campaña!"
        emptyIcon="📍"
      />

      {/* Modal de formulario */}
      <Modal
        isOpen={showForm}
        onClose={closeForm}
        title={editingItem ? 'Editar Lugar' : 'Nuevo Lugar'}
        size="large"
      >
        <LocationForm
          location={editingItem}
          onSave={handleSave}
          onClose={closeForm}
        />
      </Modal>

      {/* Modal de detalles */}
      <Modal
        isOpen={!!selectedLocation}
        onClose={closeDetails}
        title={selectedLocation?.name}
        size="large"
      >
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
      </Modal>
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
        📍
      </div>
      <h3 style={{ color: 'white', marginBottom: '1rem' }}>
        No hay lugares creados aún
      </h3>
      <p style={{ marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
        Los lugares son los escenarios donde transcurren tus aventuras. 
        Crea ciudades, mazmorras, bosques y cualquier ubicación importante.
      </p>
      <button onClick={onAddFirst} className="btn-primary">
        📍 Crear Primer Lugar
      </button>
    </div>
  )
}

// Tarjeta de lugar
function LocationCard({ location, isSelected, onClick, onEdit, onDelete }) {
  const getImportanceColor = (importance) => {
    switch (importance) {
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
      className="location-card"
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
        background: 'rgba(59, 130, 246, 0.2)',
        borderRadius: '10px'
      }}>
        {location.icon || '🏛️'}
      </div>

      {/* Información principal */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ 
          color: 'white', 
          margin: '0 0 0.25rem 0',
          fontSize: '1.1rem',
          fontWeight: '600'
        }}>
          {location.name}
        </h4>
        <p style={{ 
          color: 'var(--text-muted)', 
          margin: '0 0 0.25rem 0',
          fontSize: '0.9rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {location.description}
        </p>
        
        {/* Importancia */}
        {location.importance && (
          <span style={{
            display: 'inline-block',
            marginTop: '0.5rem',
            padding: '0.25rem 0.5rem',
            background: `${getImportanceColor(location.importance)}20`,
            color: getImportanceColor(location.importance),
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}>
            {location.importance === 'Alta' && '🔥'} 
            {location.importance === 'Media' && '⭐'} 
            {location.importance === 'Baja' && '💫'} 
            {location.importance} importancia
          </span>
        )}

        {/* Habitantes */}
        {location.inhabitants && (
          <p style={{ 
            color: '#6b7280', 
            margin: '0.25rem 0 0 0',
            fontSize: '0.8rem'
          }}>
            👥 {location.inhabitants}
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
            {location.icon || '🏛️'}
          </div>
          <div>
            <h3 style={{ color: 'white', margin: 0, fontSize: '1.5rem' }}>
              {location.name}
            </h3>
            {location.importance && (
              <p style={{ 
                color: location.importance === 'Alta' ? '#ef4444' : 
                       location.importance === 'Media' ? '#f59e0b' : '#10b981',
                margin: '0.25rem 0 0 0',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                {location.importance === 'Alta' && '🔥'} 
                {location.importance === 'Media' && '⭐'} 
                {location.importance === 'Baja' && '💫'} 
                {location.importance} importancia
              </p>
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

      {/* Información básica */}
      <div style={{ marginBottom: '2rem' }}>
        {location.description && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Descripción</h4>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {location.description}
            </p>
          </div>
        )}

        {location.inhabitants && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Habitantes</h4>
            <p style={{ color: 'var(--text-secondary)' }}>
              👥 {location.inhabitants}
            </p>
          </div>
        )}
      </div>

      {/* Notas del DM */}
      {location.notes && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Notas del DM</h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {location.notes}
          </p>
        </div>
      )}

      {/* 🔗 SISTEMA DE CONEXIONES CON NAVEGACIÓN */}
      {connections && (
        <div style={{ marginBottom: '2rem' }}>
          <ConnectionsDisplay
            item={location}
            itemType="locations"
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

// Formulario para crear/editar lugares
function LocationForm({ location, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: location?.name || '',
    description: location?.description || '',
    importance: location?.importance || 'Media',
    inhabitants: location?.inhabitants || '',
    notes: location?.notes || '',
    icon: location?.icon || '🏛️'
  })

  const [errors, setErrors] = useState({})

  // Opciones para el select de importancia
  const importanceOptions = ['Alta', 'Media', 'Baja']

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
          {location ? '✏️ Editar Lugar' : '📍 Nuevo Lugar'}
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
                placeholder="Describe el lugar: su apariencia, atmósfera, características especiales..."
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

            {/* Importancia */}
            <div>
              <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                Importancia en la campaña
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