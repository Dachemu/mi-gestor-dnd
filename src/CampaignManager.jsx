import React, { useState } from 'react'
import { Search, ArrowLeft, Download } from 'lucide-react'
import LocationsManager from './LocationsManager'
import NPCsManager from './NPCsManager'
import QuestsManager from './QuestsManager'
import ObjectsManager from './ObjectsManager'
import PlayersManager from './PlayersManager'
import NotesManager from './NotesManager'
import ConnectionModal from './components/ConnectionModal'
import SearchDropdown from './SearchDropdown'
import { useConnections } from './hooks/useConnections'
import { useSearch } from './hooks/useSearch'

// Configuración de las pestañas
const tabs = [
  { id: 'dashboard', name: 'Dashboard', icon: '🏠' },
  { id: 'locations', name: 'Lugares', icon: '📍' },
  { id: 'players', name: 'Jugadores', icon: '👥' },
  { id: 'npcs', name: 'NPCs', icon: '🧙' },
  { id: 'objects', name: 'Objetos', icon: '📦' },
  { id: 'quests', name: 'Misiones', icon: '📜' },
  { id: 'notes', name: 'Notas', icon: '📝' }
]

function CampaignManager({ campaign, onBackToSelector }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [currentCampaign, setCurrentCampaign] = useState(campaign)
  
  const updateCampaign = (updates) => {
    console.log('Actualizando campaña:', updates)
    setCurrentCampaign(prev => ({ ...prev, ...updates }))
  }

  // Hooks
  const connections = useConnections(currentCampaign, updateCampaign)
  const search = useSearch(currentCampaign)

  // Función para manejar click en resultado de búsqueda
  const handleSearchItemClick = (item, type) => {
    setActiveTab(type)
    console.log('Navegando a:', type, item.name || item.title)
    search.closeSearch()
  }

  return (
    <div className="gradient-bg">
      {/* ✨ Navegación limpia y responsive */}
      <nav className="clean-nav">
        <div className="clean-nav-container">
          
          {/* SECCIÓN 1: Botón volver + Título */}
          <div className="nav-left">
            <button
              onClick={onBackToSelector}
              className="btn-back-clean"
            >
              <ArrowLeft size={14} />
              <span>Campañas</span>
            </button>
            
            <h1 className="campaign-title-clean">
              {currentCampaign.name}
            </h1>
          </div>

          {/* SECCIÓN 2: Pestañas centradas */}
          <div className="nav-center">
            <div className="tabs-container-clean">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-clean ${activeTab === tab.id ? 'active' : ''}`}
                >
                  <span>{tab.icon}</span>
                  <span className="tab-text">{tab.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SECCIÓN 3: Buscador + Acciones */}
          <div className="nav-right">
            {/* Buscador */}
            <div className="search-clean">
              <Search className="search-icon-clean" />
              <input
                type="text"
                placeholder="Buscar..."
                className="search-input-clean"
                value={search.searchTerm}
                onChange={(e) => search.handleSearchChange(e.target.value)}
                onFocus={search.handleSearchFocus}
                onBlur={search.handleSearchBlur}
              />
              
              {search.showSearchDropdown && search.searchResults.length > 0 && (
                <SearchDropdown
                  searchTerm={search.searchTerm}
                  results={search.searchResults}
                  onItemClick={handleSearchItemClick}
                  onClose={search.closeSearch}
                />
              )}
            </div>

            {/* Botón exportar */}
            <button
              className="export-btn-clean"
              onClick={() => alert('Función de exportar - próximamente')}
              title="Exportar campaña"
            >
              <Download size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem 1rem',
        minHeight: 'calc(100vh - 80px)'
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

// Componente para renderizar el contenido de cada pestaña
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

// ✨ Dashboard LIMPIO sin mensaje innecesario
function Dashboard({ campaign, onTabChange }) {
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

      {/* ✨ Información limpia del Dashboard */}
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
          ⚡ Bienvenido a {campaign.name}
        </h2>
        
        <p style={{ 
          color: 'var(--text-muted)', 
          marginBottom: '1.5rem',
          lineHeight: '1.6'
        }}>
          Desde aquí puedes gestionar todos los elementos de tu campaña. 
          Usa las pestañas superiores para navegar entre diferentes secciones.
        </p>

        {/* ✨ Grid de acciones rápidas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '2rem'
        }}>
          <QuickActionCard
            title="Crear Lugar"
            description="Añade un nuevo lugar a tu mundo"
            icon="📍"
            color="#3b82f6"
            onClick={() => onTabChange('locations')}
          />
          <QuickActionCard
            title="Añadir NPC"
            description="Crea un personaje para tu historia"
            icon="🧙"
            color="#8b5cf6"
            onClick={() => onTabChange('npcs')}
          />
          <QuickActionCard
            title="Nueva Misión"
            description="Planifica la siguiente aventura"
            icon="📜"
            color="#f59e0b"
            onClick={() => onTabChange('quests')}
          />
          <QuickActionCard
            title="Tomar Notas"
            description="Guarda ideas importantes"
            icon="📝"
            color="#3b82f6"
            onClick={() => onTabChange('notes')}
          />
        </div>
      </div>
    </div>
  )
}

// ✨ Tarjeta de estadística mejorada
function StatCard({ title, value, icon, color, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: '16px',
        padding: '1.5rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = `0 8px 25px ${color}30`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{icon}</div>
      <div style={{ 
        fontSize: '2.5rem', 
        fontWeight: 'bold', 
        color, 
        marginBottom: '0.5rem' 
      }}>
        {value}
      </div>
      <div style={{ 
        color: 'var(--text-muted)', 
        fontSize: '1rem', 
        fontWeight: '500' 
      }}>
        {title}
      </div>
    </div>
  )
}

// ✨ Componente nuevo: Tarjeta de acción rápida
function QuickActionCard({ title, description, icon, color, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'rgba(31, 41, 55, 0.5)',
        border: '1px solid rgba(139, 92, 246, 0.1)',
        borderRadius: '12px',
        padding: '1.25rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(31, 41, 55, 0.7)'
        e.currentTarget.style.borderColor = `${color}40`
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(31, 41, 55, 0.5)'
        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.1)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.75rem',
        marginBottom: '0.5rem'
      }}>
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
        <h4 style={{ 
          color: 'white', 
          fontSize: '1rem', 
          fontWeight: '600',
          margin: 0
        }}>
          {title}
        </h4>
      </div>
      <p style={{ 
        color: 'var(--text-muted)', 
        fontSize: '0.875rem',
        margin: 0,
        lineHeight: '1.4'
      }}>
        {description}
      </p>
    </div>
  )
}

export default CampaignManager