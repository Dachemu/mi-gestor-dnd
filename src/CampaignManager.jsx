import React, { useState } from 'react'
import LocationsManager from './LocationsManager'
import NPCsManager from './NPCsManager'
import QuestsManager from './QuestsManager'
import ObjectsManager from './ObjectsManager'
import PlayersManager from './PlayersManager'
import NotesManager from './NotesManager'

// Configuración de las pestañas
const tabs = [
  { id: 'dashboard', name: 'Dashboard', icon: '🏠', color: '#8b5cf6' },
  { id: 'locations', name: 'Lugares', icon: '📍', color: '#3b82f6' },
  { id: 'players', name: 'Jugadores', icon: '👥', color: '#10b981' },
  { id: 'npcs', name: 'NPCs', icon: '🧙', color: '#8b5cf6' },
  { id: 'objects', name: 'Objetos', icon: '📦', color: '#06b6d4' },
  { id: 'quests', name: 'Misiones', icon: '📜', color: '#f59e0b' },
  { id: 'notes', name: 'Notas', icon: '📝', color: '#3b82f6' }
]

function CampaignManager({ campaign, onBackToSelector }) {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="gradient-bg">
      {/* Barra de navegación superior */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'rgba(20, 20, 35, 0.98)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--glass-border)',
        padding: '1rem 0'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '2rem'
        }}>
          {/* Botón volver */}
          <button
            onClick={onBackToSelector}
            className="btn-primary"
            style={{
              background: 'rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              padding: '0.5rem 1rem'
            }}
          >
            ← Campañas
          </button>

          {/* Título de la campaña */}
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0
            }}>
              {campaign.name}
            </h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              {campaign.description || 'Tu mundo de aventuras te espera'}
            </p>
          </div>

          {/* Pestañas de navegación */}
          <div style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              background: 'rgba(31, 41, 55, 0.4)',
              padding: '0.25rem',
              borderRadius: '12px',
              border: '1px solid rgba(139, 92, 246, 0.1)'
            }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeTab === tab.id 
                      ? 'rgba(139, 92, 246, 0.25)' 
                      : 'transparent',
                    color: activeTab === tab.id 
                      ? 'var(--text-primary)' 
                      : 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    boxShadow: activeTab === tab.id 
                      ? '0 0 12px rgba(139, 92, 246, 0.3)' 
                      : 'none'
                  }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Acciones adicionales */}
          <button
            className="btn-primary"
            style={{ padding: '0.5rem 1rem' }}
            onClick={() => alert('Función de exportar - próximamente')}
          >
            💾 Exportar
          </button>
        </div>
      </nav>

      {/* Contenido principal */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem',
        minHeight: 'calc(100vh - 100px)'
      }}>
        <TabContent activeTab={activeTab} campaign={campaign} onTabChange={setActiveTab} />
      </div>
    </div>
  )
}

// Componente para el contenido de cada pestaña
function TabContent({ activeTab, campaign, onTabChange }) {
  switch (activeTab) {
    case 'dashboard':
      return <Dashboard campaign={campaign} onTabChange={onTabChange} />
    case 'locations':
      return <LocationsManager campaign={campaign} />
    case 'players':
      return <PlayersManager campaign={campaign} />
    case 'npcs':
      return <NPCsManager campaign={campaign} />
    case 'objects':
      return <ObjectsManager campaign={campaign} />  // ← Cambiado aquí
    case 'quests':
      return <QuestsManager campaign={campaign} />
    case 'notes':
      return <NotesManager campaign={campaign} />
    default:
      return <Dashboard campaign={campaign} onTabChange={onTabChange} />
  }
}

// Dashboard principal
function Dashboard({ campaign, onTabChange }) {
  return (
    <div className="fade-in">
      {/* Estadísticas principales */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        <StatCard 
          title="Lugares" 
          value={campaign.locations} 
          icon="📍" 
          color="#3b82f6"
          onClick={() => onTabChange('locations')}
        />
        <StatCard 
          title="Jugadores" 
          value={campaign.players} 
          icon="👥" 
          color="#10b981"
          onClick={() => onTabChange('players')}
        />
        <StatCard 
          title="NPCs" 
          value={campaign.npcs} 
          icon="🧙" 
          color="#8b5cf6"
          onClick={() => onTabChange('npcs')}
        />
        <StatCard 
          title="Objetos" 
          value={campaign.objects} 
          icon="📦" 
          color="#06b6d4"
          onClick={() => onTabChange('objects')}
        />
        <StatCard 
          title="Misiones" 
          value={campaign.quests} 
          icon="📜" 
          color="#f59e0b"
          onClick={() => onTabChange('quests')}
        />
        <StatCard 
          title="Notas" 
          value={campaign.notes} 
          icon="📝" 
          color="#3b82f6"
          onClick={() => onTabChange('notes')}
        />
      </div>

      {/* Actividad reciente */}
      <div style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: '16px',
        padding: '2rem'
      }}>
        <h2 style={{ 
          color: 'white', 
          fontSize: '1.5rem', 
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          ⚡ Dashboard de {campaign.name}
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Bienvenido a tu mundo de aventuras. Desde aquí puedes gestionar todos los elementos de tu campaña.
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          <QuickAction 
            title="Añadir Lugar"
            description="Crea nuevos lugares para explorar"
            icon="📍"
            color="#3b82f6"
            onClick={() => onTabChange('locations')}
          />
          <QuickAction 
            title="Crear NPC"
            description="Añade personajes memorables"
            icon="🧙"
            color="#8b5cf6"
            onClick={() => onTabChange('npcs')}
          />
          <QuickAction 
            title="Nueva Misión"
            description="Diseña aventuras épicas"
            icon="📜"
            color="#f59e0b"
            onClick={() => onTabChange('quests')}
          />
        </div>
      </div>
    </div>
  )
}

// Componente para estadísticas
function StatCard({ title, value, icon, color, onClick }) {
  return (
    <div style={{
      background: 'var(--glass-bg)',
      border: '1px solid var(--glass-border)',
      borderRadius: '16px',
      padding: '1.5rem',
      textAlign: 'center',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    }}
    className="campaign-card"
    onClick={onClick}
    >
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ 
        fontSize: '2.5rem', 
        fontWeight: '700', 
        color: color,
        margin: '0.5rem 0'
      }}>
        {value}
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        {title}
      </div>
    </div>
  )
}

// Componente para acciones rápidas
function QuickAction({ title, description, icon, color, onClick }) {
  return (
    <div 
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '1rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      className="campaign-card"
      onClick={onClick}
    >
      <div style={{ 
        fontSize: '1.5rem', 
        color: color,
        marginBottom: '0.5rem' 
      }}>
        {icon}
      </div>
      <h4 style={{ color: 'white', marginBottom: '0.25rem' }}>{title}</h4>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        {description}
      </p>
    </div>
  )
}

// Placeholder para las otras pestañas
function TabPlaceholder({ title, campaign, type }) {
  return (
    <div className="fade-in" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>
        {title.split(' ')[0]}
      </div>
      <h2 style={{ color: 'white', fontSize: '2rem', marginBottom: '1rem' }}>
        {title}
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '2rem' }}>
        Gestión de {title.toLowerCase()} para "{campaign.name}"
      </p>
      <div style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Actualmente tienes <strong style={{ color: 'white' }}>{campaign[type]}</strong> {title.toLowerCase()} en esta campaña.
        </p>
        <button 
          className="btn-primary"
          onClick={() => alert(`Gestión de ${title} - próximamente en el siguiente paso`)}
        >
          ➕ Añadir {title.split(' ')[1] || title.split(' ')[0]}
        </button>
      </div>
    </div>
  )
}

export default CampaignManager