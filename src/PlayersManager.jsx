import React, { useState } from 'react'

// Datos de ejemplo para jugadores
const examplePlayers = [
  {
    id: 1,
    name: "Thorin Escudoférro",
    player: "Carlos García",
    class: "Guerrero",
    level: 5,
    avatar: "⚔️",
    description: "Un enano noble con una barba trenzada y armadura brillante. Valiente hasta la médula.",
    backstory: "Thorin es el último de una noble casa enana. Su familia fue destruida por dragones hace décadas, y ahora busca venganza y redención. Lleva el escudo ancestral de su clan.",
    inventory: "Martillo de guerra +1, Armadura de placas, Escudo del clan, Pociones de curación (3), Cuerda de seda (50 pies)",
    createdAt: "2024-01-15"
  },
  {
    id: 2,
    name: "Luna Susurraviento",
    player: "Ana Martínez",
    class: "Hechicera",
    level: 4,
    avatar: "🔮",
    description: "Una elfa alta con cabello plateado y ojos que brillan con magia arcana.",
    backstory: "Luna descubrió sus poderes mágicos cuando era niña tras tocar un cristal mágico en el bosque. Ahora busca controlar sus poderes y entender su origen dracónico.",
    inventory: "Bastón arcano, Túnica de mago, Componentes de hechizos, Libro de conjuros, Gema dracónica (focus)",
    createdAt: "2024-01-16"
  },
  {
    id: 3,
    name: "Sombra Silenciosa",
    player: "Miguel López",
    class: "Pícaro",
    level: 6,
    avatar: "🗡️",
    description: "Un halfling ágil vestido de negro, experto en moverse sin ser detectado.",
    backstory: "Criado en las calles de la gran ciudad, Sombra aprendió a sobrevivir robando y escondiéndose. Ahora usa sus habilidades para ayudar a los necesitados.",
    inventory: "Dagas gemelas, Armadura de cuero tachonado, Herramientas de ladrón, Cuerda con garfio, Veneno (2 dosis)",
    createdAt: "2024-01-17"
  }
]

function PlayersManager({ campaign }) {
  const [players, setPlayers] = useState(examplePlayers)
  const [showForm, setShowForm] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  // Crear nuevo jugador
  const handleCreatePlayer = (playerData) => {
    const newPlayer = {
      ...playerData,
      id: Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    }
    setPlayers(prev => [...prev, newPlayer])
    setShowForm(false)
    alert(`¡Jugador "${newPlayer.name}" creado exitosamente! 🎉`)
  }

  // Editar jugador existente
  const handleEditPlayer = (playerData) => {
    setPlayers(prev => prev.map(player => 
      player.id === editingPlayer.id 
        ? { ...playerData, id: editingPlayer.id, createdAt: editingPlayer.createdAt }
        : player
    ))
    setEditingPlayer(null)
    setShowForm(false)
    alert(`¡Jugador "${playerData.name}" actualizado! ✨`)
  }

  // Eliminar jugador
  const handleDeletePlayer = (playerId, playerName) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${playerName}"?`)) {
      setPlayers(prev => prev.filter(player => player.id !== playerId))
      if (selectedPlayer?.id === playerId) {
        setSelectedPlayer(null)
      }
      alert(`Jugador "${playerName}" eliminado`)
    }
  }

  // Abrir formulario para editar
  const openEditForm = (player) => {
    setEditingPlayer(player)
    setShowForm(true)
  }

  // Abrir formulario para crear
  const openCreateForm = () => {
    setEditingPlayer(null)
    setShowForm(true)
  }

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
            Los héroes de la aventura en {campaign.name}
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="btn-primary"
        >
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
          {players.length === 0 ? (
            <EmptyState onAddFirst={openCreateForm} />
          ) : (
            <PlayersList 
              players={players}
              onEdit={openEditForm}
              onDelete={handleDeletePlayer}
              onSelect={setSelectedPlayer}
              selectedId={selectedPlayer?.id}
            />
          )}
        </div>

        {/* Panel de detalles */}
        {selectedPlayer && (
          <PlayerDetails 
            player={selectedPlayer}
            onClose={() => setSelectedPlayer(null)}
            onEdit={() => openEditForm(selectedPlayer)}
            onDelete={() => handleDeletePlayer(selectedPlayer.id, selectedPlayer.name)}
          />
        )}
      </div>

      {/* Formulario modal */}
      {showForm && (
        <PlayerForm
          player={editingPlayer}
          onSave={editingPlayer ? handleEditPlayer : handleCreatePlayer}
          onClose={() => {
            setShowForm(false)
            setEditingPlayer(null)
          }}
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
        Los jugadores son los héroes de tu historia. Añade sus personajes aquí.
      </p>
      <button onClick={onAddFirst} className="btn-primary">
        👥 Crear el primer jugador
      </button>
    </div>
  )
}

// Lista de jugadores
function PlayersList({ players, onEdit, onDelete, onSelect, selectedId }) {
  return (
    <div style={{
      display: 'grid',
      gap: '1rem'
    }}>
      {players.map(player => (
        <PlayerCard
          key={player.id}
          player={player}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelect={onSelect}
          isSelected={selectedId === player.id}
        />
      ))}
    </div>
  )
}

// Tarjeta individual de jugador
function PlayerCard({ player, onEdit, onDelete, onSelect, isSelected }) {
  const levelColor = player.level >= 10 ? '#f59e0b' : player.level >= 5 ? '#8b5cf6' : '#10b981'

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
        position: 'relative'
      }}
      className="campaign-card"
    >
      {/* Botones de acción */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        display: 'flex',
        gap: '0.5rem'
      }}>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit(player)
          }}
          style={{
            background: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '6px',
            color: '#3b82f6',
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

      {/* Contenido principal */}
      <div style={{ paddingRight: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '2.5rem' }}>{player.avatar}</span>
          <div>
            <h3 style={{ 
              color: 'white', 
              fontSize: '1.25rem', 
              fontWeight: 'bold',
              margin: 0
            }}>
              {player.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
              <span style={{ 
                color: 'var(--text-muted)', 
                fontSize: '0.9rem' 
              }}>
                {player.class}
              </span>
              <span style={{
                background: `${levelColor}20`,
                color: levelColor,
                padding: '0.125rem 0.5rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                Nivel {player.level}
              </span>
            </div>
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
          {player.description}
        </p>

        {/* Información del jugador real */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem' }}>🎮</span>
            <span style={{ color: '#10b981', fontSize: '0.85rem' }}>
              Jugado por: {player.player}
            </span>
          </div>
        </div>

        <div style={{ 
          fontSize: '0.8rem', 
          color: 'var(--text-disabled)'
        }}>
          Creado: {new Date(player.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}

// Panel de detalles del jugador seleccionado
function PlayerDetails({ player, onClose, onEdit, onDelete }) {
  const levelColor = player.level >= 10 ? '#f59e0b' : player.level >= 5 ? '#8b5cf6' : '#10b981'

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
              {player.class}
            </p>
            <span style={{
              background: `${levelColor}20`,
              color: levelColor,
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: '600',
              display: 'inline-block',
              marginTop: '0.5rem'
            }}>
              Nivel {player.level}
            </span>
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

      {/* Jugador real */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Jugador</h4>
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '10px',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <span style={{ fontSize: '1.5rem' }}>🎮</span>
          <span style={{ color: '#10b981', fontWeight: '500' }}>
            {player.player}
          </span>
        </div>
      </div>

      {/* Descripción */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Descripción</h4>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          {player.description}
        </p>
      </div>

      {/* Historia */}
      {player.backstory && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Historia del Personaje</h4>
          <div style={{
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: '10px',
            padding: '1rem'
          }}>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {player.backstory}
            </p>
          </div>
        </div>
      )}

      {/* Inventario */}
      {player.inventory && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Inventario</h4>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            padding: '1rem'
          }}>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {player.inventory}
            </p>
          </div>
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
    class: player?.class || 'Guerrero',
    level: player?.level || 1,
    avatar: player?.avatar || '⚔️',
    description: player?.description || '',
    backstory: player?.backstory || '',
    inventory: player?.inventory || ''
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'level' ? parseInt(value) || 1 : value 
    }))
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
    if (!formData.class.trim()) {
      newErrors.class = 'La clase es obligatoria'
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

  // Listas de opciones
  const playerAvatars = ['⚔️', '🛡️', '🏹', '🔮', '📚', '🗡️', '🪄', '⚡', '🔥', '❄️', '🌟', '🎭', '🎯', '🗝️', '💎', '👑', '🦉', '🐺', '🦅', '🐉']
  const playerClasses = ['Guerrero', 'Mago', 'Pícaro', 'Clérigo', 'Explorador', 'Bárbaro', 'Bardo', 'Druida', 'Hechicero', 'Brujo', 'Monje', 'Paladín']

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
        maxWidth: '700px',
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
            {player ? '✏️ Editar Jugador' : '👥 Nuevo Jugador'}
          </h3>
          <button onClick={onClose} style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#ef4444',
            padding: '0.5rem',
            cursor: 'pointer'
          }}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Avatar */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
              Avatar
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', maxHeight: '120px', overflowY: 'auto' }}>
              {playerAvatars.map(avatar => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, avatar }))}
                  style={{
                    background: formData.avatar === avatar ? 'rgba(139, 92, 246, 0.3)' : 'rgba(31, 41, 55, 0.5)',
                    border: `1px solid ${formData.avatar === avatar ? 'rgba(139, 92, 246, 0.5)' : 'rgba(139, 92, 246, 0.2)'}`,
                    borderRadius: '8px',
                    padding: '0.5rem',
                    fontSize: '1.5rem',
                    cursor: 'pointer'
                  }}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          {/* Nombre del personaje y Jugador */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
                Nombre del personaje *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej: Thorin Escudoférro"
                style={{
                  width: '100%',
                  background: 'rgba(31, 41, 55, 0.5)',
                  border: `1px solid ${errors.name ? '#ef4444' : 'rgba(139, 92, 246, 0.2)'}`,
                  borderRadius: '10px',
                  padding: '0.75rem',
                  color: 'white',
                  fontSize: '1rem'
                }}
                autoFocus
              />
              {errors.name && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>{errors.name}</p>}
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
                Nombre del jugador *
              </label>
              <input
                type="text"
                name="player"
                value={formData.player}
                onChange={handleChange}
                placeholder="Ej: Carlos García"
                style={{
                  width: '100%',
                  background: 'rgba(31, 41, 55, 0.5)',
                  border: `1px solid ${errors.player ? '#ef4444' : 'rgba(139, 92, 246, 0.2)'}`,
                  borderRadius: '10px',
                  padding: '0.75rem',
                  color: 'white',
                  fontSize: '1rem'
                }}
              />
              {errors.player && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>{errors.player}</p>}
            </div>
          </div>

          {/* Clase y Nivel */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
                Clase *
              </label>
              <select
                name="class"
                value={formData.class}
                onChange={handleChange}
                style={{
                  width: '100%',
                  background: 'rgba(31, 41, 55, 0.5)',
                  border: `1px solid ${errors.class ? '#ef4444' : 'rgba(139, 92, 246, 0.2)'}`,
                  borderRadius: '10px',
                  padding: '0.75rem',
                  color: 'white',
                  fontSize: '1rem'
                }}
              >
                {playerClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              {errors.class && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>{errors.class}</p>}
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
                Nivel
              </label>
              <input
                type="number"
                name="level"
                value={formData.level}
                onChange={handleChange}
                min="1"
                max="20"
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
          </div>

          {/* Descripción */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
              Descripción del personaje *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Apariencia física, personalidad, peculiaridades..."
              rows={3}
              style={{
                width: '100%',
                background: 'rgba(31, 41, 55, 0.5)',
                border: `1px solid ${errors.description ? '#ef4444' : 'rgba(139, 92, 246, 0.2)'}`,
                borderRadius: '10px',
                padding: '0.75rem',
                color: 'white',
                fontSize: '1rem',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
            {errors.description && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>{errors.description}</p>}
          </div>

          {/* Historia del personaje */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
              Historia del personaje
            </label>
            <textarea
              name="backstory"
              value={formData.backstory}
              onChange={handleChange}
              placeholder="Origen, motivación, familia, trasfondo..."
              rows={4}
              style={{
                width: '100%',
                background: 'rgba(31, 41, 55, 0.5)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '10px',
                padding: '0.75rem',
                color: 'white',
                fontSize: '1rem',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Inventario */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.5rem' }}>
              Inventario
            </label>
            <textarea
              name="inventory"
              value={formData.inventory}
              onChange={handleChange}
              placeholder="Lista de objetos, armas, armadura, pociones..."
              rows={3}
              style={{
                width: '100%',
                background: 'rgba(31, 41, 55, 0.5)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '10px',
                padding: '0.75rem',
                color: 'white',
                fontSize: '1rem',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
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
              {player ? '💾 Actualizar' : '👥 Crear Jugador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PlayersManager