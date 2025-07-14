import React, { useState } from 'react'
import NewCampaignForm from './NewCampaignForm'

// 🎯 DATOS DE EJEMPLO PARA INICIALIZAR CAMPAÑAS
const INITIAL_CAMPAIGN_DATA = {
  locations: [
    {
      id: 1,
      name: "Taberna del Dragón Dorado",
      type: "Comercio",
      description: "Una acogedora taberna en el centro de la ciudad donde aventureros se reúnen para compartir historias.",
      inhabitants: "Innkeeper Gareth y varios clientes habituales",
      importance: "Media",
      icon: "🍺",
      linkedItems: { npcs: [], players: [], quests: [], objects: [], notes: [] },
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      name: "Torre del Mago Oscuro",
      type: "Mazmorra",
      description: "Una torre misteriosa envuelta en niebla perpetua. Se dice que guarda secretos arcanos.",
      inhabitants: "El Mago Malachar y sus servidores",
      importance: "Alta",
      icon: "🗼",
      linkedItems: { npcs: [], players: [], quests: [], objects: [], notes: [] },
      createdAt: "2024-01-16"
    },
    {
      id: 3,
      name: "Bosque Susurrante",
      type: "Naturaleza",
      description: "Un bosque ancestral donde los árboles parecen hablar entre sí con el viento.",
      inhabitants: "Druidas del Círculo Lunar y criaturas del bosque",
      importance: "Media",
      icon: "🌲",
      linkedItems: { npcs: [], players: [], quests: [], objects: [], notes: [] },
      createdAt: "2024-01-17"
    }
  ],
  
  npcs: [
    {
      id: 1,
      name: "Eldara la Sabia",
      role: "Bibliotecaria",
      location: "Gran Biblioteca de la Ciudad",
      description: "Una elfa anciana con cabello plateado y ojos que brillan con sabiduría acumulada durante siglos.",
      attitude: "Amistoso",
      icon: "📚",
      notes: "Conoce secretos antiguos y está dispuesta a ayudar a cambio de conocimiento raro.",
      linkedItems: { locations: [], players: [], quests: [], objects: [], notes: [] },
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      name: "Capitán Thorgrim",
      role: "Guardia de la Ciudad",
      location: "Cuartel de la Guardia",
      description: "Un enano robusto con armadura brillante y una barba trenzada con medallas de honor.",
      attitude: "Neutral",
      icon: "⚔️",
      notes: "Estricto pero justo. Respeta a quienes demuestran honor y valor.",
      linkedItems: { locations: [], players: [], quests: [], objects: [], notes: [] },
      createdAt: "2024-01-16"
    },
    {
      id: 3,
      name: "Sombra Roja",
      role: "Asesino",
      location: "Barrios bajos",
      description: "Una figura encapuchada que aparece y desaparece entre las sombras. Sus ojos rojos son lo único visible.",
      attitude: "Hostil",
      icon: "🗡️",
      notes: "Trabaja para el gremio de ladrones. Mortal pero puede ser sobornado con oro suficiente.",
      linkedItems: { locations: [], players: [], quests: [], objects: [], notes: [] },
      createdAt: "2024-01-17"
    }
  ],

  players: [
    {
      id: 1,
      name: "Thorin Escudoférro",
      player: "Carlos García",
      class: "Guerrero",
      level: 5,
      avatar: "⚔️",
      description: "Un enano noble con una barba trenzada y armadura brillante. Valiente hasta la médula.",
      backstory: "Thorin es el último de una noble casa enana. Su familia fue destruida por dragones hace décadas, y ahora busca venganza y redención.",
      inventory: "Martillo de guerra +1, Armadura de placas, Escudo del clan, Pociones de curación (3)",
      linkedItems: { locations: [], npcs: [], quests: [], objects: [], notes: [] },
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
      backstory: "Luna descubrió sus poderes mágicos cuando era niña tras tocar un cristal mágico en el bosque.",
      inventory: "Bastón arcano, Túnica de mago, Componentes de hechizos, Libro de conjuros",
      linkedItems: { locations: [], npcs: [], quests: [], objects: [], notes: [] },
      createdAt: "2024-01-16"
    }
  ],

  quests: [
    {
      id: 1,
      title: "El Rescate del Príncipe Perdido",
      description: "El príncipe Aldric ha desaparecido durante una expedición al Bosque Sombrío.",
      status: "En progreso",
      priority: "Alta",
      location: "Bosque Sombrío",
      reward: "1000 monedas de oro + Espada del Valor",
      notes: "El príncipe fue visto por última vez cerca del antiguo templo.",
      icon: "🤴",
      linkedItems: { locations: [], players: [], npcs: [], objects: [], notes: [] },
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      title: "Los Bandidos del Camino Real",
      description: "Una banda de bandidos está atacando a los comerciantes en el Camino Real.",
      status: "Pendiente",
      priority: "Media",
      location: "Camino Real",
      reward: "500 monedas de oro + Reconocimiento oficial",
      notes: "Los bandidos atacan principalmente por las noches.",
      icon: "⚔️",
      linkedItems: { locations: [], players: [], npcs: [], objects: [], notes: [] },
      createdAt: "2024-01-16"
    }
  ],

  objects: [
    {
      id: 1,
      name: "Espada de la Luna Creciente",
      type: "Arma",
      rarity: "Épico",
      icon: "⚔️",
      owner: "Thorin Escudoférro",
      location: "",
      description: "Una espada élfica forjada bajo la luz de la luna llena, brilla con luz plateada durante la noche.",
      properties: "+2 al ataque, daño radiante contra no-muertos",
      notes: "Forjada por los elfos de Rivendel hace 300 años.",
      linkedItems: { locations: [], players: [], npcs: [], quests: [], notes: [] },
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      name: "Poción de Curación Superior",
      type: "Poción",
      rarity: "Poco común",
      icon: "🧪",
      owner: "",
      location: "Tienda de Aldemar el Alquimista",
      description: "Líquido rojo brillante en una botella de cristal que restaura vitalidad instantáneamente.",
      properties: "Restaura 4d4+4 puntos de vida",
      notes: "Se puede beber como acción bonus.",
      linkedItems: { locations: [], players: [], npcs: [], quests: [], notes: [] },
      createdAt: "2024-01-16"
    }
  ],

  notes: [
    {
      id: 1,
      title: "Reglas de la Casa",
      content: "• Los jugadores pueden usar una poción como acción bonus\n• Críticos automáticos en 20 natural\n• Descansos largos solo en lugares seguros",
      category: "Reglas",
      icon: "📋",
      linkedItems: { locations: [], players: [], npcs: [], quests: [], objects: [] },
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      title: "Ideas para la Próxima Sesión",
      content: "Los jugadores deben investigar los misteriosos asesinatos en la ciudad. Pistas importantes:\n\n1. Las víctimas tenían marca de colmillos\n2. Solo atacan de noche",
      category: "Ideas",
      icon: "💡",
      linkedItems: { locations: [], players: [], npcs: [], quests: [], objects: [] },
      createdAt: "2024-01-16"
    }
  ]
}

// Datos de ejemplo para el selector - ahora incluyen los arrays de datos
const campaignsEjemplo = [
  {
    id: 1,
    name: "Las Crónicas de Eldoria",
    description: "Una aventura épica en un mundo de magia y dragones",
    createdAt: "2024-01-15",
    lastModified: "2024-01-20",
    // 🎯 Incluir datos iniciales
    ...INITIAL_CAMPAIGN_DATA
  },
  {
    id: 2,
    name: "El Reino Perdido",
    description: "Los héroes deben recuperar un reino ancestral",
    createdAt: "2024-02-01",
    lastModified: "2024-02-10",
    // 🎯 Incluir datos iniciales (copia para que sean independientes)
    ...JSON.parse(JSON.stringify(INITIAL_CAMPAIGN_DATA)),
    // Modificar algunos IDs para evitar conflictos
    locations: INITIAL_CAMPAIGN_DATA.locations.map(loc => ({ ...loc, id: loc.id + 100 })),
    npcs: INITIAL_CAMPAIGN_DATA.npcs.map(npc => ({ ...npc, id: npc.id + 100 })),
    players: INITIAL_CAMPAIGN_DATA.players.map(player => ({ ...player, id: player.id + 100 })),
    quests: INITIAL_CAMPAIGN_DATA.quests.map(quest => ({ ...quest, id: quest.id + 100 })),
    objects: INITIAL_CAMPAIGN_DATA.objects.map(obj => ({ ...obj, id: obj.id + 100 })),
    notes: INITIAL_CAMPAIGN_DATA.notes.map(note => ({ ...note, id: note.id + 100 }))
  }
]

function CampaignSelector({ onSelectCampaign }) {
  // Estado para manejar las campañas
  const [campaigns, setCampaigns] = useState(campaignsEjemplo)
  const [showNewCampaignForm, setShowNewCampaignForm] = useState(false)

  // Función para crear nueva campaña
  const handleCreateCampaign = (newCampaignBasic) => {
    console.log('Creando nueva campaña:', newCampaignBasic)
    
    // 🎯 Crear campaña completa con datos iniciales
    const newCampaign = {
      ...newCampaignBasic,
      // Añadir datos iniciales a la nueva campaña
      ...JSON.parse(JSON.stringify(INITIAL_CAMPAIGN_DATA)),
      // Generar IDs únicos para evitar conflictos
      locations: INITIAL_CAMPAIGN_DATA.locations.map(loc => ({ ...loc, id: Date.now() + loc.id })),
      npcs: INITIAL_CAMPAIGN_DATA.npcs.map(npc => ({ ...npc, id: Date.now() + npc.id })),
      players: INITIAL_CAMPAIGN_DATA.players.map(player => ({ ...player, id: Date.now() + player.id })),
      quests: INITIAL_CAMPAIGN_DATA.quests.map(quest => ({ ...quest, id: Date.now() + quest.id })),
      objects: INITIAL_CAMPAIGN_DATA.objects.map(obj => ({ ...obj, id: Date.now() + obj.id })),
      notes: INITIAL_CAMPAIGN_DATA.notes.map(note => ({ ...note, id: Date.now() + note.id }))
    }
    
    // Añadir la nueva campaña al estado
    setCampaigns(prevCampaigns => [...prevCampaigns, newCampaign])
    
    // Mostrar mensaje de éxito
    alert(`¡Campaña "${newCampaign.name}" creada exitosamente! 🎉`)
    
    // Cerrar el formulario
    setShowNewCampaignForm(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #15082a 25%, #0a0a0f 50%, #0a1525 75%, #0a0a0f 100%)',
      backgroundSize: '200% 200%',
      animation: 'gradientShift 10s ease infinite',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Header */}
      <div style={{
        textAlign: 'center',
        padding: '3rem 2rem 2rem',
        position: 'relative',
        zIndex: 1
      }}>
        <h1 style={{
          fontSize: 'clamp(2.5rem, 8vw, 4rem)',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 50%, #8b5cf6 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          marginBottom: '1rem',
          textShadow: '0 4px 20px rgba(139, 92, 246, 0.3)'
        }}>
          🎲 Gestor de Campañas D&D
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: 'var(--text-secondary)',
          maxWidth: '600px',
          margin: '0 auto 2rem'
        }}>
          Crea y gestiona mundos épicos para tus aventuras de rol
        </p>
        
        <button
          onClick={() => setShowNewCampaignForm(true)}
          className="btn-primary"
          style={{
            fontSize: '1.1rem',
            padding: '1rem 2rem',
            marginBottom: '3rem'
          }}
        >
          ➕ Nueva Campaña
        </button>
      </div>

      {/* Lista de campañas */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem 3rem',
        position: 'relative',
        zIndex: 1
      }}>
        {campaigns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📚</div>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '1.5rem', marginBottom: '1rem' }}>
              No hay campañas creadas
            </h3>
            <p style={{ color: 'var(--text-disabled)', marginBottom: '2rem' }}>
              Crea tu primera campaña para comenzar a gestionar tu mundo de D&D
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem'
          }}>
            {campaigns.map(campaign => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onSelect={() => onSelectCampaign(campaign)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal para nueva campaña */}
      {showNewCampaignForm && (
        <NewCampaignForm
          onClose={() => setShowNewCampaignForm(false)}
          onCreateCampaign={handleCreateCampaign}
        />
      )}
    </div>
  )
}

// Componente para cada tarjeta de campaña
function CampaignCard({ campaign, onSelect }) {
  return (
    <div
      onClick={onSelect}
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '20px',
        padding: '2rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
      className="campaign-card"
    >
      {/* Contenido principal */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1.5rem'
        }}>
          <div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '0.5rem'
            }}>
              {campaign.name}
            </h3>
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '0.9rem'
            }}>
              {campaign.description}
            </p>
          </div>
          <div style={{
            fontSize: '2rem',
            opacity: 0.7
          }}>
            🎲
          </div>
        </div>

        {/* Estadísticas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
              {campaign.locations?.length || 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Lugares</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
              {campaign.players?.length || 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Jugadores</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>
              {campaign.npcs?.length || 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>NPCs</div>
          </div>
        </div>

        {/* Información adicional */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
              {campaign.quests?.length || 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Misiones</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#06b6d4' }}>
              {campaign.objects?.length || 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Objetos</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
              {campaign.notes?.length || 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Notas</div>
          </div>
        </div>

        {/* Fechas */}
        <div style={{
          fontSize: '0.8rem',
          color: 'var(--text-disabled)',
          borderTop: '1px solid rgba(139, 92, 246, 0.2)',
          paddingTop: '1rem',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>Creada: {new Date(campaign.createdAt).toLocaleDateString()}</span>
          <span>Actualizada: {new Date(campaign.lastModified).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Efecto de brillo al hover */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
        opacity: 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: 'none'
      }} />
    </div>
  )
}

export default CampaignSelector