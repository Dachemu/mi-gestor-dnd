import React, { useState, useEffect } from 'react'
import { useCRUD } from './hooks/useCRUD'
import ConnectionsDisplay from './components/ConnectionsDisplay'

function ObjectsManager({ campaign, connections, selectedItemForNavigation }) {
  // ✨ Hook CRUD usando datos de la campaña
  const {
    items: objects,
    showForm,
    editingItem,
    selectedItem: selectedObject,
    isEmpty,
    handleSave,
    handleDelete,
    selectItem: selectObject,
    openCreateForm,
    openEditForm,
    closeForm,
    closeDetails,
    NotificationComponent
  } = useCRUD(campaign.objects || [], 'Objeto')

  // ✨ Efecto para seleccionar automáticamente un objeto cuando se navega desde conexiones
  useEffect(() => {
    if (selectedItemForNavigation && selectedItemForNavigation.type === 'objects') {
      const objectToSelect = objects.find(object => object.id === selectedItemForNavigation.item.id)
      if (objectToSelect) {
        selectObject(objectToSelect)
      }
    }
  }, [selectedItemForNavigation, objects, selectObject])

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
            📦 Objetos
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>
            Los tesoros y artefactos de {campaign.name}
          </p>
        </div>
        <button onClick={openCreateForm} className="btn-primary">
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
          {isEmpty ? (
            <EmptyState onAddFirst={openCreateForm} />
          ) : (
            <div style={{
              display: 'grid',
              gap: '1rem'
            }}>
              {objects.map(object => (
                <ObjectCard
                  key={object.id}
                  object={object}
                  isSelected={selectedObject?.id === object.id}
                  onClick={() => selectObject(object)}
                  onEdit={() => openEditForm(object)}
                  onDelete={() => handleDelete(object.id, object.name)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Panel de detalles */}
        {selectedObject && (
          <ObjectDetails
            object={selectedObject}
            onClose={closeDetails}
            onEdit={() => openEditForm(selectedObject)}
            onDelete={() => handleDelete(selectedObject.id, selectedObject.name)}
            connections={connections}
            campaign={campaign}
          />
        )}
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <ObjectForm
          object={editingItem}
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
        📦
      </div>
      <h3 style={{ color: 'white', marginBottom: '1rem' }}>
        No hay objetos creados aún
      </h3>
      <p style={{ marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
        Los objetos son elementos importantes de tu campaña: armas mágicas, 
        tesoros, artefactos ancestrales, pociones y más.
      </p>
      <button onClick={onAddFirst} className="btn-primary">
        📦 Crear Primer Objeto
      </button>
    </div>
  )
}

// Tarjeta de objeto
function ObjectCard({ object, isSelected, onClick, onEdit, onDelete }) {
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Legendario': return '#ff6b35'
      case 'Épico': return '#8b5cf6'
      case 'Raro': return '#3b82f6'
      case 'Poco común': return '#10b981'
      case 'Común': return '#6b7280'
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
        background: 'rgba(6, 182, 212, 0.2)',
        borderRadius: '10px'
      }}>
        {object.icon || '📦'}
      </div>

      {/* Información principal */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ 
          color: 'white', 
          margin: '0 0 0.25rem 0',
          fontSize: '1.1rem',
          fontWeight: '600'
        }}>
          {object.name}
        </h4>
        
        {/* Tipo y Rareza */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
          {object.type && (
            <p style={{ 
              color: 'var(--text-muted)', 
              margin: 0,
              fontSize: '0.9rem'
            }}>
              📝 {object.type}
            </p>
          )}
          
          {object.rarity && (
            <span style={{
              padding: '0.25rem 0.5rem',
              background: `${getRarityColor(object.rarity)}20`,
              color: getRarityColor(object.rarity),
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              {object.rarity === 'Legendario' && '⭐'} 
              {object.rarity === 'Épico' && '💜'} 
              {object.rarity === 'Raro' && '💙'} 
              {object.rarity === 'Poco común' && '💚'} 
              {object.rarity === 'Común' && '⚪'} 
              {object.rarity}
            </span>
          )}
        </div>

        {/* Propietario y ubicación */}
        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
          {object.owner && (
            <p style={{ margin: '0 0 0.25rem 0' }}>
              👤 Propietario: {object.owner}
            </p>
          )}
          {object.location && (
            <p style={{ margin: 0 }}>
              📍 Ubicación: {object.location}
            </p>
          )}
        </div>

        {/* Descripción corta */}
        {object.description && (
          <p style={{ 
            color: 'var(--text-muted)', 
            margin: '0.5rem 0 0 0',
            fontSize: '0.85rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {object.description}
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

// Panel de detalles del objeto seleccionado
function ObjectDetails({ object, onClose, onEdit, onDelete, connections, campaign }) {
  // Obtener elementos conectados
  const linkedItems = connections?.getLinkedItems(object) || {}

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Legendario': return '#ff6b35'
      case 'Épico': return '#8b5cf6'
      case 'Raro': return '#3b82f6'
      case 'Poco común': return '#10b981'
      case 'Común': return '#6b7280'
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
            {object.icon || '📦'}
          </div>
          <div>
            <h3 style={{ color: 'white', margin: 0, fontSize: '1.5rem' }}>
              {object.name}
            </h3>
            {object.type && (
              <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                {object.type}
              </p>
            )}
            {object.rarity && (
              <span style={{
                display: 'inline-block',
                marginTop: '0.5rem',
                padding: '0.5rem 1rem',
                background: `${getRarityColor(object.rarity)}20`,
                color: getRarityColor(object.rarity),
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                {object.rarity === 'Legendario' && '⭐ '} 
                {object.rarity === 'Épico' && '💜 '} 
                {object.rarity === 'Raro' && '💙 '} 
                {object.rarity === 'Poco común' && '💚 '} 
                {object.rarity === 'Común' && '⚪ '} 
                {object.rarity}
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

      {/* Información básica */}
      <div style={{ marginBottom: '2rem' }}>
        {object.description && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Descripción</h4>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {object.description}
            </p>
          </div>
        )}

        {object.properties && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Propiedades</h4>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {object.properties}
            </p>
          </div>
        )}

        {(object.owner || object.location) && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Ubicación</h4>
            {object.owner && (
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                👤 Propietario: {object.owner}
              </p>
            )}
            {object.location && (
              <p style={{ color: 'var(--text-secondary)' }}>
                📍 Ubicación: {object.location}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Notas */}
      {object.notes && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Notas</h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {object.notes}
          </p>
        </div>
      )}

      {/* 🔗 SISTEMA DE CONEXIONES */}
      {connections && (
        <div style={{ marginBottom: '2rem' }}>
          <ConnectionsDisplay
            item={object}
            itemType="objects"
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

// Formulario para crear/editar objetos
function ObjectForm({ object, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: object?.name || '',
    type: object?.type || '',
    rarity: object?.rarity || 'Común',
    description: object?.description || '',
    properties: object?.properties || '',
    owner: object?.owner || '',
    location: object?.location || '',
    notes: object?.notes || '',
    icon: object?.icon || '📦'
  })

  const [errors, setErrors] = useState({})

  // Opciones para selects
  const typeOptions = [
    'Arma', 'Armadura', 'Escudo', 'Poción', 'Pergamino', 'Anillo', 'Amuleto',
    'Joya', 'Gema', 'Herramienta', 'Instrumento', 'Libro', 'Mapa', 'Llave',
    'Reliquia', 'Artefacto', 'Componente', 'Material', 'Tesoro', 'Otro'
  ]

  const rarityOptions = ['Común', 'Poco común', 'Raro', 'Épico', 'Legendario']

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
          {object ? '✏️ Editar Objeto' : '📦 Nuevo Objeto'}
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
                Nombre *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej: Espada Llameante de Ignis"
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

            {/* Tipo y Rareza */}
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
                  <option value="">Seleccionar tipo</option>
                  {typeOptions.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                  Rareza
                </label>
                <select
                  name="rarity"
                  value={formData.rarity}
                  onChange={handleChange}
                  className="input-field"
                >
                  {rarityOptions.map(rarity => (
                    <option key={rarity} value={rarity}>
                      {rarity}
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
                placeholder="Apariencia, historia, características especiales..."
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

            {/* Propiedades */}
            <div>
              <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                Propiedades mágicas
              </label>
              <textarea
                name="properties"
                value={formData.properties}
                onChange={handleChange}
                placeholder="Efectos mágicos, bonificaciones, habilidades especiales..."
                className="input-field"
                style={{ minHeight: '80px', resize: 'vertical' }}
              />
            </div>

            {/* Propietario y Ubicación */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                  Propietario
                </label>
                <input
                  type="text"
                  name="owner"
                  value={formData.owner}
                  onChange={handleChange}
                  placeholder="¿Quién lo posee?"
                  className="input-field"
                />
              </div>
              
              <div>
                <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                  Ubicación
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="¿Dónde se encuentra?"
                  className="input-field"
                />
              </div>
            </div>

            {/* Notas */}
            <div>
              <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                Notas adicionales
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Historia, leyendas, información adicional..."
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
              {object ? '💾 Guardar Cambios' : '➕ Crear Objeto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ObjectsManager