import React, { useState } from 'react'
import { useCRUD } from './hooks/useCRUD'
import ConnectionsDisplay from './components/ConnectionsDisplay'

function ObjectsManager({ campaign, connections }) {
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
    closeDetails
  } = useCRUD(campaign.objects || [], 'Objeto')

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
            <ObjectsList 
              objects={objects}
              onEdit={openEditForm}
              onDelete={handleDelete}
              onSelect={selectObject}
              selectedId={selectedObject?.id}
              connections={connections}
            />
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

      {/* Formulario modal */}
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

// Componente de estado vacío
function EmptyState({ onAddFirst }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>📦</div>
      <h3 style={{ color: 'var(--text-muted)', fontSize: '1.5rem', marginBottom: '1rem' }}>
        No hay objetos creados
      </h3>
      <p style={{ color: 'var(--text-disabled)', marginBottom: '2rem' }}>
        Los objetos enriquecen tu mundo. Crea armas, pociones, artefactos y tesoros.
      </p>
      <button onClick={onAddFirst} className="btn-primary">
        📦 Crear el primer objeto
      </button>
    </div>
  )
}

// Lista de objetos
function ObjectsList({ objects, onEdit, onDelete, onSelect, selectedId, connections }) {
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {objects.map(object => (
        <ObjectCard
          key={object.id}
          object={object}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelect={onSelect}
          isSelected={selectedId === object.id}
          connectionCount={connections?.getConnectionCount(object) || 0}
        />
      ))}
    </div>
  )
}

// Tarjeta individual de objeto
function ObjectCard({ object, onEdit, onDelete, onSelect, isSelected, connectionCount }) {
  const rarityColors = {
    'Común': '#6b7280',
    'Poco común': '#10b981',
    'Raro': '#3b82f6',
    'Épico': '#8b5cf6', 
    'Legendario': '#f59e0b'
  }

  const typeColors = {
    'Arma': '#ef4444',
    'Armadura': '#3b82f6',
    'Poción': '#10b981',
    'Pergamino': '#8b5cf6',
    'Joya': '#f59e0b',
    'Herramienta': '#6b7280',
    'Reliquia': '#f59e0b',
    'Otro': '#9ca3af'
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
          <span style={{ fontSize: '2rem' }}>{object.icon}</span>
          <div>
            <h3 style={{ 
              color: 'white', 
              fontSize: '1.25rem', 
              fontWeight: 'bold',
              margin: 0
            }}>
              {object.name}
            </h3>
            <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
              {object.type}
            </p>
          </div>
        </div>
        
        {/* Badges */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{
            background: `${rarityColors[object.rarity]}20`,
            color: rarityColors[object.rarity],
            padding: '0.25rem 0.5rem',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}>
            {object.rarity}
          </span>
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
        {object.description}
      </p>

      {/* Propietario o Ubicación */}
      {(object.owner || object.location) && (
        <p style={{ 
          color: 'var(--text-muted)', 
          fontSize: '0.9rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {object.owner ? `👤 ${object.owner}` : `📍 ${object.location}`}
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
            onEdit(object)
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
    </div>
  )
}

// Panel de detalles del objeto seleccionado
function ObjectDetails({ object, onClose, onEdit, onDelete, connections, campaign }) {
  // Obtener elementos conectados
  const linkedItems = connections?.getLinkedItems(object) || {}

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
              {object.type} • {object.rarity}
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

      {/* Descripción */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Descripción</h4>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          {object.description}
        </p>
      </div>

      {/* Propiedades */}
      {object.properties && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Propiedades</h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {object.properties}
          </p>
        </div>
      )}

      {/* Propietario */}
      {object.owner && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Propietario</h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {object.owner}
          </p>
        </div>
      )}

      {/* Ubicación */}
      {object.location && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Ubicación</h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {object.location}
          </p>
        </div>
      )}

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

  const iconOptions = [
    '📦', '⚔️', '🗡️', '🛡️', '🏹', '🪓', '🔨', '🧪', '💎', '💍', '🔮', '📜',
    '📚', '🗝️', '🪙', '💰', '🏺', '⚱️', '🎭', '🎵', '🎨', '🧿', '📿', '⚗️',
    '🔥', '⚡', '❄️', '🌟', '✨', '💫', '🌙', '☀️', '🍯', '🧬', '🔬', '⭐'
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
            {object ? '✏️ Editar Objeto' : '➕ Nuevo Objeto'}
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
            
            {/* Nombre e Icono */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem' }}>
              <div>
                <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                  Nombre del Objeto
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej: Espada de la Luna Creciente"
                  className="input-field"
                  style={{ border: errors.name ? '1px solid #ef4444' : undefined }}
                />
                {errors.name && (
                  <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>
                    {errors.name}
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
                  <option value="">Selecciona un tipo</option>
                  {typeOptions.map(type => (
                    <option key={type} value={type}>{type}</option>
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
                    <option key={rarity} value={rarity}>{rarity}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe la apariencia y características del objeto..."
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

            {/* Propiedades */}
            <div>
              <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                Propiedades Mágicas
              </label>
              <textarea
                name="properties"
                value={formData.properties}
                onChange={handleChange}
                placeholder="Ej: +2 al ataque, daño radiante contra no-muertos"
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