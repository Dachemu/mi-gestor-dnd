import React, { useState } from 'react'
import LocationsManager from './LocationsManager'
import NPCsManager from './NPCsManager'
import QuestsManager from './QuestsManager'
import ObjectsManager from './ObjectsManager'
import PlayersManager from './PlayersManager'
import NotesManager from './NotesManager'
import ConnectionModal from './components/ConnectionModal'
import { useConnections } from './hooks/useConnections'

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
  
  // ✨ Simulamos una función de actualización de campaña
  // En el futuro esto vendrá del localStorage o contexto global
  const [currentCampaign, setCurrentCampaign] = useState(campaign)
  
  const updateCampaign = (updates) => {
    console.log('Actualizando campaña:', updates)
    setCurrentCampaign(prev => ({ ...prev, ...updates }))
  }

  // 🔗 Hook de conexiones
  const connections = useConnections(currentCampaign, updateCampaign)

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
              {currentCampaign.name}
            </h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              {currentCampaign.description || 'Tu mundo de aventuras te espera'}
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
        <TabContent 
          activeTab={activeTab} 
          campaign={currentCampaign} 
          onTabChange={setActiveTab}
          connections={connections}
        />
      </div>

      {/* Modal de conexiones */}
      {connections.showConnectionModal && connections.connectionSource && (
        <ConnectionModal
          sourceItem={connections.connectionSource.item}
          sourceType={connections.connectionSource.type}
          campaign={currentCampaign}
          onConnect={connections.createConnection}
          onRemove={connections.removeConnection}
          onClose={connections.closeConnectionModal}
          getLinkedItems={connections.getLinkedItems}
          getAvailableItems={connections.getAvailableItems}
        />
      )}
    </div>
  )
}

// Componente para el contenido de cada pestaña
function TabContent({ activeTab, campaign, onTabChange, connections }) {
  switch (activeTab) {
    case 'dashboard':
      return <Dashboard campaign={campaign} onTabChange={onTabChange} />
    case 'locations':
      return <LocationsManager campaign={campaign} connections={connections} />
    case 'players':
      return <PlayersManager campaign={campaign} connections={connections} />
    case 'npcs':
      return <NPCsManager campaign={campaign} connections={connections} />
    case 'objects':
      return <ObjectsManager campaign={campaign} connections={connections} />
    case 'quests':
      return <QuestsManager campaign={campaign} connections={connections} />
    case 'notes':
      return <NotesManager campaign={campaign} connections={connections} />
    default:
      return <Dashboard campaign={campaign} onTabChange={onTabChange} />
  }
}

// Dashboard principal
function Dashboard({ campaign, onTabChange }) {
  // Simulamos contadores (en el futuro vendrán de la campaña real)
  const getCount = (type) => {
    return campaign[type]?.length || 0
  }

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
          value={getCount('locations')} 
          icon="📍" 
          color="#3b82f6"
          onClick={() => onTabChange('locations')}
        />
        <StatCard 
          title="Jugadores" 
          value={getCount('players')} 
          icon="👥" 
          color="#10b981"
          onClick={() => onTabChange('players')}
        />
        <StatCard 
          title="NPCs" 
          value={getCount('npcs')} 
          icon="🧙" 
          color="#8b5cf6"
          onClick={() => onTabChange('npcs')}
        />
        <StatCard 
          title="Objetos" 
          value={getCount('objects')} 
          icon="📦" 
          color="#06b6d4"
          onClick={() => onTabChange('objects')}
        />
        <StatCard 
          title="Misiones" 
          value={getCount('quests')} 
          icon="📜" 
          color="#f59e0b"
          onClick={() => onTabChange('quests')}
        />
        <StatCard 
          title="Notas" 
          value={getCount('notes')} 
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

        {/* Estadísticas de conexiones */}
        <div style={{
          background: 'rgba(139, 92, 246, 0.1)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginTop: '1.5rem'
        }}>
          <h3 style={{ 
            color: '#8b5cf6', 
            fontSize: '1.2rem', 
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🔗 Sistema de Conexiones Activado
          </h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
            Ahora puedes conectar elementos entre sí: relaciona NPCs con lugares, 
            misiones con objetos, jugadores con aventuras y mucho más. 
            Las conexiones aparecen en los paneles de detalle de cada elemento.
          </p>
        </div>
      </div>
    </div>
  )
}

// Componente de tarjeta de estadística
function StatCard({ title, value, icon, color, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: '16px',
        padding: '2rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        textAlign: 'center'
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-4px)'
        e.target.style.boxShadow = `0 8px 25px ${color}30`
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)'
        e.target.style.boxShadow = 'none'
      }}
    >
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon}</div>
      <div style={{ fontSize: '3rem', fontWeight: 'bold', color, marginBottom: '0.5rem' }}>
        {value}
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: '500' }}>
        {title}
      </div>
    </div>
  )
}

export default CampaignManager