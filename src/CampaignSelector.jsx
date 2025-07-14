import React, { useState } from 'react'
import NewCampaignForm from './NewCampaignForm'

// Datos de ejemplo - después los sacaremos del localStorage
const campaignsEjemplo = [
  {
    id: 1,
    name: "Las Crónicas de Eldoria",
    description: "Una aventura épica en un mundo de magia y dragones",
    createdAt: "2024-01-15",
    lastModified: "2024-01-20",
    locations: 5,
    players: 4,
    npcs: 12,
    objects: 8,
    quests: 6,
    notes: 15
  },
  {
    id: 2,
    name: "El Reino Perdido",
    description: "Los héroes deben recuperar un reino ancestral",
    createdAt: "2024-02-01",
    lastModified: "2024-02-10",
    locations: 8,
    players: 3,
    npcs: 18,
    objects: 12,
    quests: 4,
    notes: 9
  }
]

function CampaignSelector({ onSelectCampaign }) {
  // Estado para manejar las campañas
  const [campaigns, setCampaigns] = useState(campaignsEjemplo)
  const [showNewCampaignForm, setShowNewCampaignForm] = useState(false)

  // Función para crear nueva campaña
  const handleCreateCampaign = (newCampaign) => {
    console.log('Creando nueva campaña:', newCampaign)
    
    // Añadir la nueva campaña al estado
    setCampaigns(prevCampaigns => [...prevCampaigns, newCampaign])
    
    // Mostrar mensaje de éxito
    alert(`¡Campaña "${newCampaign.name}" creada exitosamente! 🎉`)
  }

  // Función para seleccionar una campaña (ahora navega de verdad)
  const handleSelectCampaign = (campaign) => {
    console.log('Navegando a campaña:', campaign.name)
    onSelectCampaign(campaign) // Usar la función de navegación del padre
  }

  // Función para eliminar campaña
  const handleDeleteCampaign = (campaignId, campaignName) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${campaignName}"?`)) {
      setCampaigns(prevCampaigns => 
        prevCampaigns.filter(campaign => campaign.id !== campaignId)
      )
      alert(`Campaña "${campaignName}" eliminada`)
    }
  }

  return (
    <div className="gradient-bg">
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '2rem',
        minHeight: '100vh'
      }}>
        
        {/* Encabezado */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }} className="fade-in">
          <h1 className="main-title">
            ✨ Gestor de Campañas D&D
          </h1>
          <p className="subtitle">
            Crea mundos épicos y vive aventuras inolvidables
          </p>
        </div>

        {/* Botones de acción */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '1rem', 
          marginBottom: '3rem' 
        }}>
          <button 
            className="btn-primary" 
            onClick={() => setShowNewCampaignForm(true)}
          >
            ➕ Nueva Campaña
          </button>
          <button 
            className="btn-primary" 
            style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}
            onClick={() => alert('Función de importar - próximamente')}
          >
            📁 Importar
          </button>
        </div>

        {/* Lista de campañas */}
        {campaigns.length === 0 ? (
          // Estado vacío
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🎲</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.5rem', marginBottom: '2rem' }}>
              ¡Tu aventura comienza aquí!
            </p>
            <button 
              className="btn-primary" 
              onClick={() => setShowNewCampaignForm(true)}
            >
              Crear tu Primera Campaña
            </button>
          </div>
        ) : (
          // Grid de campañas
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem'
          }}>
            {campaigns.map((campaign) => (
              <CampaignCard 
                key={campaign.id} 
                campaign={campaign} 
                onSelect={handleSelectCampaign}
                onDelete={handleDeleteCampaign}
              />
            ))}
          </div>
        )}

        {/* Formulario de nueva campaña */}
        {showNewCampaignForm && (
          <NewCampaignForm
            onClose={() => setShowNewCampaignForm(false)}
            onCreateCampaign={handleCreateCampaign}
          />
        )}
      </div>
    </div>
  )
}

// Componente para cada carta de campaña (igual que antes)
function CampaignCard({ campaign, onSelect, onDelete }) {
  return (
    <div 
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: '16px',
        padding: '1.5rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        position: 'relative'
      }}
      className="campaign-card"
    >
      {/* Botón de eliminar */}
      <button
        onClick={(e) => {
          e.stopPropagation() // Evitar que se seleccione la campaña
          onDelete(campaign.id, campaign.name)
        }}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '6px',
          color: '#ef4444',
          padding: '0.25rem 0.5rem',
          cursor: 'pointer',
          fontSize: '0.8rem',
          opacity: 0.7,
          transition: 'opacity 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.opacity = 1}
        onMouseLeave={(e) => e.target.style.opacity = 0.7}
      >
        🗑️
      </button>

      {/* Contenido de la carta (clickeable) */}
      <div onClick={() => onSelect(campaign)}>
        <h3 style={{ 
          color: 'white', 
          fontSize: '1.5rem', 
          marginBottom: '0.5rem',
          fontWeight: 'bold',
          paddingRight: '2rem' // Espacio para el botón de eliminar
        }}>
          {campaign.name}
        </h3>
        
        <p style={{ 
          color: 'var(--text-muted)', 
          marginBottom: '1.5rem',
          lineHeight: '1.5'
        }}>
          {campaign.description || 'Una aventura épica te espera...'}
        </p>
        
        {/* Estadísticas de la campaña */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.5rem',
          fontSize: '0.9rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ color: '#3b82f6' }}>📍 {campaign.locations} lugares</div>
          <div style={{ color: '#10b981' }}>👥 {campaign.players} jugadores</div>
          <div style={{ color: '#8b5cf6' }}>🧙 {campaign.npcs} NPCs</div>
          <div style={{ color: '#06b6d4' }}>📦 {campaign.objects} objetos</div>
          <div style={{ color: '#f59e0b' }}>📜 {campaign.quests} misiones</div>
          <div style={{ color: '#3b82f6' }}>📝 {campaign.notes} notas</div>
        </div>
        
        {/* Fechas */}
        <div style={{ 
          fontSize: '0.8rem', 
          color: 'var(--text-disabled)',
          borderTop: '1px solid var(--glass-border)',
          paddingTop: '1rem',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>Creada: {new Date(campaign.createdAt).toLocaleDateString()}</span>
          <span>Actualizada: {new Date(campaign.lastModified).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )
}

export default CampaignSelector