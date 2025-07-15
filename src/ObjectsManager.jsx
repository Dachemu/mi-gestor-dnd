import React, { useState, useEffect } from 'react'
import { useCRUD } from './hooks/useCRUD.jsx'
import ConnectionsDisplay from './components/ConnectionsDisplay'
import Modal from './components/Modal'
import CompactList from './components/CompactList'

function ObjectsManager({ campaign, connections, selectedItemForNavigation, updateCampaign }) {
  // ✨ Hook CRUD usando datos de la campaña
  const {
    items: objects,
    showForm,
    editingItem,
    selectedItem: selectedObject,
    isEmpty,
    handleSave: handleSaveInternal,
    handleDelete: handleDeleteInternal,
    selectItem: selectObject,
    openCreateForm,
    openEditForm,
    closeForm,
    closeDetails,
    NotificationComponent
  } = useCRUD(campaign.objects || [], 'Objeto')

  // ✅ Función mejorada para guardar que actualiza la campaña
  const handleSave = (itemData) => {
    const savedItem = handleSaveInternal(itemData)
    if (savedItem && updateCampaign) {
      updateCampaign({
        objects: editingItem 
          ? campaign.objects.map(object => object.id === savedItem.id ? savedItem : object)
          : [...(campaign.objects || []), savedItem]
      })
    }
  }

  // ✅ Función mejorada para eliminar que actualiza la campaña
  const handleDelete = (id, name) => {
    handleDeleteInternal(id, name)
    if (updateCampaign) {
      updateCampaign({
        objects: (campaign.objects || []).filter(object => object.id !== id)
      })
    }
  }

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

      {/* Lista compacta de objetos */}
      <CompactList
        items={objects}
        itemType="objects"
        onSelectItem={selectObject}
        getConnectionCount={connections?.getConnectionCount}
        emptyMessage="No hay objetos aún. ¡Añade el primer tesoro de tu campaña!"
        emptyIcon="📦"
      />

      {/* Modal de formulario */}
      <Modal
        isOpen={showForm}
        onClose={closeForm}
        title={editingItem ? '✏️ Editar Objeto' : '📦 Nuevo Objeto'}
        size="large"
      >
        <ObjectForm
          object={editingItem}
          onSave={handleSave}
          onClose={closeForm}
        />
      </Modal>

      {/* Modal de detalles */}
      <Modal
        isOpen={!!selectedObject}
        onClose={closeDetails}
        title={selectedObject ? `📦 ${selectedObject.name}` : ''}
        size="large"
      >
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
      </Modal>
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
    <div>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{ fontSize: '3rem' }}>
          {object.icon || '📦'}
        </div>
        <div>
          {object.type && (
            <p style={{ color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>
              {object.type}
            </p>
          )}
          {object.rarity && (
            <span style={{
              display: 'inline-block',
              marginBottom: '0.5rem',
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
  )
}

export default ObjectsManager