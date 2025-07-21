import React, { useState, useEffect } from 'react'
import { useCRUD } from '../../hooks/useCRUD.jsx'
import { getEntityConfig } from '../../config/entityTypes.js'
import ConnectionsDisplay from './ConnectionsDisplay'
import { BaseModal } from '../ui/base'
import CompactList from './CompactList'
import DynamicForm from './DynamicForm'
import UniversalDetails from './UniversalDetails'

/**
 * Manager universal que reemplaza todos los *Manager específicos
 * Utiliza configuración centralizada para manejar cualquier tipo de entidad
 * Elimina ~80% del código duplicado del proyecto
 */
function UniversalManager({ 
  entityType,                    // 'players', 'quests', 'objects', etc.
  campaign, 
  connections, 
  selectedItemForNavigation, 
  updateCampaign 
}) {
  // Obtener configuración del tipo de entidad
  const config = getEntityConfig(entityType)
  
  if (!config) {
    console.error(`Configuración no encontrada para tipo de entidad: ${entityType}`)
    return <div>Error: Tipo de entidad no válido</div>
  }

  // Hook CRUD usando datos de la campaña
  const {
    items,
    showForm,
    editingItem,
    selectedItem,
    isEmpty,
    handleSave: handleSaveInternal,
    handleDelete: handleDeleteInternal,
    selectItem,
    openCreateForm,
    openEditForm,
    closeForm,
    closeDetails,
    NotificationComponent
  } = useCRUD(campaign[entityType] || [], config.name, config)

  // Estado para filtros (solo si la entidad los soporta)
  const [filters, setFilters] = useState({})

  // Función mejorada para guardar que actualiza la campaña
  const handleSave = (itemData) => {
    const savedItem = handleSaveInternal(itemData)
    if (savedItem && updateCampaign) {
      const updatedItems = editingItem 
        ? campaign[entityType].map(item => item.id === savedItem.id ? savedItem : item)
        : [...(campaign[entityType] || []), savedItem]
      
      updateCampaign({
        [entityType]: updatedItems
      })
    }
    return savedItem
  }

  // Función mejorada para eliminar que actualiza la campaña
  const handleDelete = (id, name) => {
    handleDeleteInternal(id, name)
    if (updateCampaign) {
      updateCampaign({
        [entityType]: (campaign[entityType] || []).filter(item => item.id !== id)
      })
    }
  }

  // Efecto para seleccionar automáticamente un elemento cuando se navega desde conexiones
  useEffect(() => {
    if (selectedItemForNavigation && selectedItemForNavigation.type === entityType) {
      const itemToSelect = items.find(item => item.id === selectedItemForNavigation.item.id)
      if (itemToSelect) {
        selectItem(itemToSelect)
      }
    }
  }, [selectedItemForNavigation, items, selectItem, entityType])

  // Función para aplicar filtros
  const getFilteredItems = () => {
    if (!config.filters || Object.keys(filters).length === 0) {
      return items
    }

    return items.filter(item => {
      return Object.entries(filters).every(([filterKey, filterValue]) => {
        if (!filterValue || filterValue === 'Todas') return true
        return item[filterKey] === filterValue
      })
    })
  }

  // Renderizar filtros si la entidad los soporta
  const renderFilters = () => {
    if (!config.filters) return null

    return (
      <div style={{ marginBottom: '2rem' }}>
        {config.filters.map(filterKey => {
          const fieldConfig = config.schema[filterKey]
          if (!fieldConfig || fieldConfig.type !== 'select') return null

          const uniqueValues = ['Todas', ...new Set(items.map(item => item[filterKey]).filter(Boolean))]
          if (uniqueValues.length <= 1) return null

          return (
            <div key={filterKey} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {uniqueValues.map(value => (
                  <button
                    key={value}
                    onClick={() => setFilters(prev => ({ ...prev, [filterKey]: value }))}
                    style={{
                      padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
                      borderRadius: '12px',
                      border: filters[filterKey] === value || (!filters[filterKey] && value === 'Todas')
                        ? '1px solid rgba(139, 92, 246, 0.5)'
                        : '1px solid rgba(139, 92, 246, 0.2)',
                      background: filters[filterKey] === value || (!filters[filterKey] && value === 'Todas')
                        ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(139, 92, 246, 0.1))' 
                        : 'rgba(31, 41, 55, 0.5)',
                      color: filters[filterKey] === value || (!filters[filterKey] && value === 'Todas')
                        ? '#ffffff' 
                        : 'var(--text-muted)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                      fontWeight: '600',
                      boxShadow: filters[filterKey] === value || (!filters[filterKey] && value === 'Todas')
                        ? '0 4px 12px rgba(139, 92, 246, 0.3)'
                        : 'none',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    {value} {value !== 'Todas' && `(${items.filter(i => i[filterKey] === value).length})`}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const filteredItems = getFilteredItems()

  return (
    <div className="fade-in">
      {/* Componente de notificación */}
      <NotificationComponent />

      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <p style={{ 
            color: 'var(--text-muted)', 
            margin: '1rem 0 0 0',
            fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
            fontWeight: '500',
            opacity: 0.9
          }}>
            {config.description}
          </p>
        </div>
        <button onClick={openCreateForm} className="btn-primary">
          ➕ Añadir {config.name}
        </button>
      </div>

      {/* Filtros */}
      {renderFilters()}

      {/* Lista compacta o estado vacío */}
      {isEmpty ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem 2rem',
          color: 'var(--text-muted)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
            {config.emptyIcon}
          </div>
          <p style={{ fontSize: '1.1rem', margin: 0, marginBottom: '1rem' }}>
            {config.emptyMessage}
          </p>
          <button onClick={openCreateForm} className="btn-primary">
            {config.icon} Crear Primer {config.name}
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem 2rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>
            🔍
          </div>
          <h3 style={{ color: 'white', marginBottom: '1rem' }}>
            No se encontraron elementos con los filtros aplicados
          </h3>
          <p style={{ marginBottom: '2rem' }}>
            Intenta ajustar los filtros o añadir nuevos elementos.
          </p>
          <button 
            onClick={() => setFilters({})} 
            className="btn-secondary"
            style={{ marginRight: '1rem' }}
          >
            Limpiar filtros
          </button>
          <button onClick={openCreateForm} className="btn-primary">
            ➕ Añadir {config.name}
          </button>
        </div>
      ) : (
        <CompactList
          items={filteredItems}
          itemType={entityType}
          onSelectItem={selectItem}
          getConnectionCount={connections?.getConnectionCount}
          emptyMessage={config.emptyMessage}
          emptyIcon={config.emptyIcon}
        />
      )}

      {/* Modal de formulario */}
      {showForm && (
        <BaseModal
          isOpen={showForm}
          onClose={closeForm}
          title={editingItem ? `✏️ Editar ${config.name}` : `➕ Nuevo ${config.name}`}
          size="lg"
        >
        <DynamicForm
          entityType={entityType}
          config={config}
          item={editingItem}
          onSave={handleSave}
          onClose={closeForm}
        />
        </BaseModal>
      )}

      {/* Modal de detalles */}
      <BaseModal
        isOpen={!!selectedItem}
        onClose={closeDetails}
        title={selectedItem ? `${config.icon} ${selectedItem.name || selectedItem.title}` : ''}
        size="lg"
      >
        {selectedItem && (
          <UniversalDetails
            item={selectedItem}
            entityType={entityType}
            config={config}
            onClose={closeDetails}
            onEdit={(updatedItem) => {
              if (updatedItem && updatedItem.id) {
                // Si se recibió un item actualizado, guardar directamente
                handleSave(updatedItem)
              } else {
                // Si no hay datos, abrir el formulario de edición modal (fallback)
                openEditForm(selectedItem)
              }
            }}
            onDelete={() => handleDelete(selectedItem.id, selectedItem.name || selectedItem.title)}
            connections={connections}
            campaign={campaign}
          />
        )}
      </BaseModal>
    </div>
  )
}

export default React.memo(UniversalManager)