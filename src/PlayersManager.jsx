import React, { useState, useEffect } from 'react'
import { useCRUD } from './hooks/useCRUD.jsx'
import ConnectionsDisplay from './components/ConnectionsDisplay'
import Modal from './components/Modal'
import CompactList from './components/CompactList'

function PlayersManager({ campaign, connections, selectedItemForNavigation, updateCampaign }) {
  // ✨ Hook CRUD usando datos de la campaña
  const {
    items: players,
    showForm,
    editingItem,
    selectedItem: selectedPlayer,
    isEmpty,
    handleSave: handleSaveInternal,
    handleDelete: handleDeleteInternal,
    selectItem: selectPlayer,
    openCreateForm,
    openEditForm,
    closeForm,
    closeDetails,
    NotificationComponent
  } = useCRUD(campaign.players || [], 'Jugador')

  // ✅ Función mejorada para guardar que actualiza la campaña
  const handleSave = (itemData) => {
    const savedItem = handleSaveInternal(itemData)
    if (savedItem && updateCampaign) {
      updateCampaign({
        players: editingItem 
          ? campaign.players.map(player => player.id === savedItem.id ? savedItem : player)
          : [...(campaign.players || []), savedItem]
      })
    }
  }

  // ✅ Función mejorada para eliminar que actualiza la campaña
  const handleDelete = (id, name) => {
    handleDeleteInternal(id, name)
    if (updateCampaign) {
      updateCampaign({
        players: (campaign.players || []).filter(player => player.id !== id)
      })
    }
  }

  // ✨ Efecto para seleccionar automáticamente un jugador cuando se navega desde conexiones
  useEffect(() => {
    if (selectedItemForNavigation && selectedItemForNavigation.type === 'players') {
      const playerToSelect = players.find(player => player.id === selectedItemForNavigation.item.id)
      if (playerToSelect) {
        selectPlayer(playerToSelect)
      }
    }
  }, [selectedItemForNavigation, players, selectPlayer])

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
            👥 Jugadores
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>
            Los héroes de tu campaña {campaign.name}
          </p>
        </div>
        <button onClick={openCreateForm} className="btn-primary">
          ➕ Añadir Jugador
        </button>
      </div>

      {/* Lista compacta de jugadores */}
      <CompactList
        items={players}
        itemType="players"
        onSelectItem={selectPlayer}
        getConnectionCount={connections?.getConnectionCount}
        emptyMessage="No hay jugadores aún. ¡Añade el primer héroe de tu campaña!"
        emptyIcon="👥"
      />

      {/* Modal de formulario */}
      <Modal
        isOpen={showForm}
        onClose={closeForm}
        title={editingItem ? 'Editar Jugador' : 'Nuevo Jugador'}
        size="large"
      >
        <PlayerForm
          player={editingItem}
          onSave={handleSave}
          onClose={closeForm}
        />
      </Modal>

      {/* Modal de detalles */}
      <Modal
        isOpen={!!selectedPlayer}
        onClose={closeDetails}
        title={selectedPlayer?.name}
        size="large"
      >
        {selectedPlayer && (
          <PlayerDetails
            player={selectedPlayer}
            onClose={closeDetails}
            onEdit={() => openEditForm(selectedPlayer)}
            onDelete={() => handleDelete(selectedPlayer.id, selectedPlayer.name)}
            connections={connections}
            campaign={campaign}
          />
        )}
      </Modal>
    </div>
  )
}

// Panel de detalles del jugador seleccionado
function PlayerDetails({ player, onClose, onEdit, onDelete, connections, campaign }) {
  // Obtener elementos conectados
  const linkedItems = connections?.getLinkedItems(player) || {}

  const getLevelColor = (level) => {
    if (!level) return '#6b7280'
    const levelNum = parseInt(level)
    if (levelNum >= 15) return '#ff6b35'
    if (levelNum >= 10) return '#8b5cf6'
    if (levelNum >= 5) return '#3b82f6'
    return '#10b981'
  }

  return (
    <div>
      {/* Información básica */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '3rem' }}>
            {player.avatar || '⚔️'}
          </div>
          <div>
            <h3 style={{ color: 'white', margin: 0, fontSize: '1.5rem' }}>
              {player.name}
            </h3>
            {player.class && player.race && (
              <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                {player.class} {player.race}
              </p>
            )}
            {player.level && (
              <span style={{
                display: 'inline-block',
                marginTop: '0.5rem',
                padding: '0.5rem 1rem',
                background: `${getLevelColor(player.level)}20`,
                color: getLevelColor(player.level),
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                ⭐ Nivel {player.level}
              </span>
            )}
          </div>
        </div>

        {player.playerName && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Jugador real</h4>
            <p style={{ color: 'var(--text-secondary)' }}>
              🎮 {player.playerName}
            </p>
          </div>
        )}

        {player.background && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Trasfondo</h4>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {player.background}
            </p>
          </div>
        )}

        {player.description && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Descripción</h4>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {player.description}
            </p>
          </div>
        )}

        {(player.hitPoints || player.armorClass || player.speed) && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Estadísticas</h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
              gap: '0.5rem'
            }}>
              {player.hitPoints && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  <div style={{ fontSize: '1.2rem' }}>❤️</div>
                  <div>{player.hitPoints} HP</div>
                </div>
              )}
              {player.armorClass && (
                <div style={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  color: '#3b82f6',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  <div style={{ fontSize: '1.2rem' }}>🛡️</div>
                  <div>{player.armorClass} CA</div>
                </div>
              )}
              {player.speed && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#10b981',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  <div style={{ fontSize: '1.2rem' }}>💨</div>
                  <div>{player.speed} pies</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notas del DM */}
      {player.notes && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Notas del DM</h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {player.notes}
          </p>
        </div>
      )}

      {/* 🔗 SISTEMA DE CONEXIONES */}
      {connections && (
        <div style={{ marginBottom: '2rem' }}>
          <ConnectionsDisplay
            item={player}
            itemType="players"
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

// Formulario para crear/editar jugadores
function PlayerForm({ player, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: player?.name || '',
    playerName: player?.playerName || '',
    class: player?.class || '',
    race: player?.race || '',
    level: player?.level || '1',
    background: player?.background || '',
    description: player?.description || '',
    hitPoints: player?.hitPoints || '',
    armorClass: player?.armorClass || '',
    speed: player?.speed || '',
    notes: player?.notes || '',
    avatar: player?.avatar || '⚔️'
  })

  const [errors, setErrors] = useState({})

  // Opciones comunes para D&D 5e
  const classOptions = [
    'Bárbaro', 'Bardo', 'Brujo', 'Clérigo', 'Druida', 'Explorador',
    'Guerrero', 'Hechicero', 'Mago', 'Monje', 'Paladín', 'Pícaro'
  ]

  const raceOptions = [
    'Humano', 'Elfo', 'Enano', 'Mediano', 'Dracónido', 'Gnomo',
    'Semielfo', 'Semiorco', 'Tiefling', 'Aarakocra', 'Genasi', 'Otro'
  ]

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
    if (!formData.name.trim()) newErrors.name = 'El nombre del personaje es obligatorio'
    if (!formData.class.trim()) newErrors.class = 'La clase es obligatoria'
    if (!formData.race.trim()) newErrors.race = 'La raza es obligatoria'
    
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
        {/* Nombre del personaje y jugador real */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
              Nombre del personaje *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Aragorn"
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

          <div>
            <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
              Jugador real
            </label>
            <input
              type="text"
              name="playerName"
              value={formData.playerName}
              onChange={handleChange}
              placeholder="Nombre del jugador"
              className="input-field"
            />
          </div>
        </div>

        {/* Clase, raza y nivel */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: '1rem' }}>
          <div>
            <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
              Clase *
            </label>
            <select
              name="class"
              value={formData.class}
              onChange={handleChange}
              className="input-field"
              style={{
                borderColor: errors.class ? '#ef4444' : undefined
              }}
            >
              <option value="">Seleccionar</option>
              {classOptions.map(cls => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
            {errors.class && (
              <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>
                {errors.class}
              </p>
            )}
          </div>

          <div>
            <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
              Raza *
            </label>
            <select
              name="race"
              value={formData.race}
              onChange={handleChange}
              className="input-field"
              style={{
                borderColor: errors.race ? '#ef4444' : undefined
              }}
            >
              <option value="">Seleccionar</option>
              {raceOptions.map(race => (
                <option key={race} value={race}>
                  {race}
                </option>
              ))}
            </select>
            {errors.race && (
              <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>
                {errors.race}
              </p>
            )}
          </div>

          <div>
            <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
              Nivel
            </label>
            <input
              type="number"
              name="level"
              value={formData.level}
              onChange={handleChange}
              min="1"
              max="20"
              className="input-field"
            />
          </div>
        </div>

        {/* Trasfondo */}
        <div>
          <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
            Trasfondo
          </label>
          <input
            type="text"
            name="background"
            value={formData.background}
            onChange={handleChange}
            placeholder="Ej: Noble, Forajido, Ermitaño..."
            className="input-field"
          />
        </div>

        {/* Descripción */}
        <div>
          <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
            Descripción del personaje
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Apariencia, personalidad, historia personal..."
            className="input-field"
            style={{ minHeight: '100px', resize: 'vertical' }}
          />
        </div>

        {/* Estadísticas básicas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
              Puntos de vida
            </label>
            <input
              type="number"
              name="hitPoints"
              value={formData.hitPoints}
              onChange={handleChange}
              placeholder="HP"
              className="input-field"
              min="1"
            />
          </div>

          <div>
            <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
              Clase de armadura
            </label>
            <input
              type="number"
              name="armorClass"
              value={formData.armorClass}
              onChange={handleChange}
              placeholder="CA"
              className="input-field"
              min="1"
            />
          </div>

          <div>
            <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
              Velocidad (pies)
            </label>
            <input
              type="number"
              name="speed"
              value={formData.speed}
              onChange={handleChange}
              placeholder="30"
              className="input-field"
              min="0"
            />
          </div>
        </div>

        {/* Notas del DM */}
        <div>
          <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
            Notas del DM
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Secretos del personaje, conexiones con la trama, notas importantes..."
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
          {player ? '💾 Guardar Cambios' : '➕ Crear Jugador'}
        </button>
      </div>
    </form>
  )
}

export default PlayersManager