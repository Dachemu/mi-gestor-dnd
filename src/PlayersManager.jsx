import React, { useState } from 'react'
import { useCRUD } from './hooks/useCRUD'
import ConnectionsDisplay from './components/ConnectionsDisplay'

function PlayersManager({ campaign, connections }) {
  // ✨ Hook CRUD usando datos de la campaña
  const {
    items: players,
    showForm,
    editingItem,
    selectedItem: selectedPlayer,
    isEmpty,
    handleSave,
    handleDelete,
    selectItem: selectPlayer,
    openCreateForm,
    openEditForm,
    closeForm,
    closeDetails
  } = useCRUD(campaign.players || [], 'Jugador')

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
            <PlayersList 
              players={players}
              onEdit={openEditForm}
              onDelete={handleDelete}
              onSelect={selectPlayer}
              selectedId={selectedPlayer?.id}
              connections={connections}
            />
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

      {/* Formulario modal */}
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

// Componente de estado vacío
function EmptyState({ onAddFirst }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>👥</div>
      <h3 style={{ color: 'var(--text-muted)', fontSize: '1.5rem', marginBottom: '1rem' }}>
        No hay jugadores creados
      </h3>
      <p style={{ color: 'var(--text-disabled)', marginBottom: '2rem' }}>
        Los jugadores son los protagonistas de tu historia. Añade sus personajes aquí.
      </p>
      <button onClick={onAddFirst} className="btn-primary">
        👥 Crear el primer jugador
      </button>
    </div>
  )
}

// Lista de jugadores
function PlayersList({ players, onEdit, onDelete, onSelect, selectedId, connections }) {
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {players.map(player => (
        <PlayerCard
          key={player.id}
          player={player}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelect={onSelect}
          isSelected={selectedId === player.id}
          connectionCount={connections?.getConnectionCount(player) || 0}
        />
      ))}
    </div>
  )
}

// Tarjeta individual de jugador
function PlayerCard({ player, onEdit, onDelete, onSelect, isSelected, connectionCount }) {
  const levelColor = player.level >= 10 ? '#8b5cf6' : player.level >= 5 ? '#10b981' : '#f59e0b'

  return (
    <div
      onClick={() => onSelect(player)}
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
          <span style={{ fontSize: '2rem' }}>{player.avatar}</span>
          <div>
            <h3 style={{ 
              color: 'white', 
              fontSize: '1.25rem', 
              fontWeight: 'bold',
              margin: 0
            }}>
              {player.name}
            </h3>
            <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
              {player.class} • Jugador: {player.player}
            </p>
          </div>
        </div>
        
        {/* Badges */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{
            background: `${levelColor}20`,
            color: levelColor,
            padding: '0.25rem 0.5rem',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}>
            Nivel {player.level}
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
        {player.description}
      </p>

      {/* Acciones */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem',
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit(player)
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
            onDelete(player.id, player.name)
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
          <span style={{ fontSize: '3rem' }}>{player.avatar}</span>
          <div>
            <h3 style={{ 
              color: 'white', 
              fontSize: '1.5rem', 
              fontWeight: 'bold',
              margin: 0
            }}>
              {player.name}
            </h3>
            <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
              {player.class} Nivel {player.level}
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

      {/* Información del jugador */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Jugador</h4>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          {player.player}
        </p>
      </div>

      {/* Descripción */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Descripción</h4>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          {player.description}
        </p>
      </div>

      {/* Trasfondo */}
      {player.backstory && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Trasfondo</h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {player.backstory}
          </p>
        </div>
      )}

      {/* Inventario */}
      {player.inventory && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Inventario</h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {player.inventory}
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
    player: player?.player || '',
    class: player?.class || '',
    level: player?.level || 1,
    description: player?.description || '',
    backstory: player?.backstory || '',
    inventory: player?.inventory || '',
    avatar: player?.avatar || '⚔️'
  })

  const [errors, setErrors] = useState({})

  // Opciones para selects
  const classOptions = [
    'Bárbaro', 'Bardo', 'Clérigo', 'Druida', 'Explorador', 'Guerrero',
    'Hechicero', 'Mago', 'Monje', 'Paladín', 'Pícaro', 'Brujo'
  ]

  const avatarOptions = [
    '⚔️', '🗡️', '🛡️', '🏹', '🪓', '🔮', '📚', '🎭', '🎵', '✨', '🔥', '⚡',
    '🌟', '💫', '🌙', '☀️', '🌊', '🌲', '🗻', '💎', '👑', '🦸', '🦹', '🥷',
    '🧙', '🧙‍♀️', '🧙‍♂️', '🧝', '🧝‍♀️', '🧝‍♂️', '🧚', '🧚‍♀️', '🧚‍♂️'
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'level' ? parseInt(value) || 1 : value 
    }))
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del personaje es obligatorio'
    }
    
    if (!formData.player.trim()) {
      newErrors.player = 'El nombre del jugador es obligatorio'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria'
    }
    
    if (formData.level < 1 || formData.level > 20) {
      newErrors.level = 'El nivel debe estar entre 1 y 20'
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
            {player ? '✏️ Editar Jugador' : '➕ Nuevo Jugador'}
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
            
            {/* Nombre del personaje y Avatar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem' }}>
              <div>
                <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                  Nombre del Personaje
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej: Thorin Escudoférro"
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
                  Avatar
                </label>
                <select
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleChange}
                  className="input-field"
                  style={{ fontSize: '1.5rem', textAlign: 'center', width: '60px' }}
                >
                  {avatarOptions.map(avatar => (
                    <option key={avatar} value={avatar}>{avatar}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Jugador */}
            <div>
              <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                Nombre del Jugador
              </label>
              <input
                type="text"
                name="player"
                value={formData.player}
                onChange={handleChange}
                placeholder="Ej: Carlos García"
                className="input-field"
                style={{ border: errors.player ? '1px solid #ef4444' : undefined }}
              />
              {errors.player && (
                <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>
                  {errors.player}
                </p>
              )}
            </div>

            {/* Clase y Nivel */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem' }}>
              <div>
                <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                  Clase
                </label>
                <select
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Selecciona una clase</option>
                  {classOptions.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
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
                  style={{ 
                    width: '80px', 
                    textAlign: 'center',
                    border: errors.level ? '1px solid #ef4444' : undefined
                  }}
                />
                {errors.level && (
                  <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>
                    {errors.level}
                  </p>
                )}
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
                placeholder="Describe la apariencia y personalidad del personaje..."
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

            {/* Trasfondo */}
            <div>
              <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                Trasfondo
              </label>
              <textarea
                name="backstory"
                value={formData.backstory}
                onChange={handleChange}
                placeholder="Historia personal del personaje, motivaciones, familia..."
                className="input-field"
                style={{ minHeight: '80px', resize: 'vertical' }}
              />
            </div>

            {/* Inventario */}
            <div>
              <label style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                Inventario
              </label>
              <textarea
                name="inventory"
                value={formData.inventory}
                onChange={handleChange}
                placeholder="Equipamiento, armas, objetos importantes..."
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