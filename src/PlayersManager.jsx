import React, { useState, useEffect } from 'react'
import { useCRUD } from './hooks/useCRUD'
import ConnectionsDisplay from './components/ConnectionsDisplay'

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
        npcs: editingItem 
          ? campaign.npcs.map(npc => npc.id === savedItem.id ? savedItem : npc)
          : [...campaign.npcs, savedItem]
      })
    }
  }

  // ✅ Función mejorada para eliminar que actualiza la campaña
  const handleDelete = (id, name) => {
    handleDeleteInternal(id, name)
    if (updateCampaign) {
      updateCampaign({
        npcs: campaign.npcs.filter(npc => npc.id !== id)
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

      {/* Vista principal */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: selectedPlayer ? '1fr 400px' : '1fr',
        gap: '2rem',
        transition: 'all 0.3s ease'
      }}>
        
        {/* Lista de jugadores */}
        <div>
          {isEmpty ? (
            <EmptyState onAddFirst={openCreateForm} />
          ) : (
            <div style={{
              display: 'grid',
              gap: '1rem'
            }}>
              {players.map(player => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  isSelected={selectedPlayer?.id === player.id}
                  onClick={() => selectPlayer(player)}
                  onEdit={() => openEditForm(player)}
                  onDelete={() => handleDelete(player.id, player.name)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Panel de detalles */}
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
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <PlayerForm
          player={editingItem}
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
        👥
      </div>
      <h3 style={{ color: 'white', marginBottom: '1rem' }}>
        No hay jugadores registrados aún
      </h3>
      <p style={{ marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
        Los jugadores son los protagonistas de tu historia. Añade información 
        sobre sus personajes, clases, trasfondos y evolución en la campaña.
      </p>
      <button onClick={onAddFirst} className="btn-primary">
        👥 Añadir Primer Jugador
      </button>
    </div>
  )
}

// Tarjeta de jugador
function PlayerCard({ player, isSelected, onClick, onEdit, onDelete }) {
  const getLevelColor = (level) => {
    if (!level) return '#6b7280'
    const levelNum = parseInt(level)
    if (levelNum >= 15) return '#ff6b35' // Legendario
    if (levelNum >= 10) return '#8b5cf6' // Épico
    if (levelNum >= 5) return '#3b82f6'  // Veterano
    return '#10b981' // Novato
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
      {/* Avatar */}
      <div style={{
        fontSize: '2rem',
        flexShrink: 0,
        width: '50px',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(16, 185, 129, 0.2)',
        borderRadius: '10px'
      }}>
        {player.avatar || '⚔️'}
      </div>

      {/* Información principal */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ 
          color: 'white', 
          margin: '0 0 0.25rem 0',
          fontSize: '1.1rem',
          fontWeight: '600'
        }}>
          {player.name}
        </h4>
        
        {/* Clase y raza */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
          {player.class && (
            <p style={{ 
              color: 'var(--text-muted)', 
              margin: 0,
              fontSize: '0.9rem'
            }}>
              🎭 {player.class}
            </p>
          )}
          
          {player.race && (
            <p style={{ 
              color: '#6b7280', 
              margin: 0,
              fontSize: '0.9rem'
            }}>
              🧬 {player.race}
            </p>
          )}
        </div>

        {/* Nivel */}
        {player.level && (
          <span style={{
            display: 'inline-block',
            marginBottom: '0.5rem',
            padding: '0.25rem 0.5rem',
            background: `${getLevelColor(player.level)}20`,
            color: getLevelColor(player.level),
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}>
            ⭐ Nivel {player.level}
          </span>
        )}

        {/* Player real */}
        {player.playerName && (
          <p style={{ 
            color: '#6b7280', 
            margin: '0.25rem 0 0 0',
            fontSize: '0.8rem'
          }}>
            🎮 Jugado por: {player.playerName}
          </p>
        )}

        {/* Trasfondo */}
        {player.background && (
          <p style={{ 
            color: 'var(--text-muted)', 
            margin: '0.25rem 0 0 0',
            fontSize: '0.85rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            📜 {player.background}
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
        maxWidth: '700px',
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
          {player ? '✏️ Editar Jugador' : '👥 Nuevo Jugador'}
        </h2>

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
      </div>
    </div>
  )
}

export default PlayersManager