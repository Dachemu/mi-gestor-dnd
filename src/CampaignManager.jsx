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
  const [selectedItemForNavigation, setSelectedItemForNavigation] = useState(null)
  
  const updateCampaign = (updates) => {
    console.log('Actualizando campaña:', updates)
    setCurrentCampaign(prev => ({ ...prev, ...updates }))
  }

  // Hooks
  const connections = useConnections(currentCampaign, updateCampaign)
  const search = useSearch(currentCampaign)

  // ✨ Función para navegar a un elemento conectado
  const navigateToItem = (item, itemType) => {
    console.log('Navegando a:', itemType, item.name || item.title)
    
    // Cambiar a la pestaña correcta
    setActiveTab(itemType)
    
    // Seleccionar el elemento específico
    setSelectedItemForNavigation({
      item,
      type: itemType,
      timestamp: Date.now() // Para forzar re-render
    })
    
    // Limpiar la selección después de un momento para permitir navegación múltiple
    setTimeout(() => {
      setSelectedItemForNavigation(null)
    }, 100)
  }

  // Función para manejar click en resultado de búsqueda
  const handleSearchItemClick = (item, type) => {
    navigateToItem(item, type)
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
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SECCIÓN 3: Búsqueda y acciones */}
          <div className="nav-right">
            <div className="search-container">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={search.searchTerm}
                  onChange={(e) => search.setSearchTerm(e.target.value)}
                  onFocus={() => search.setShowSearchDropdown(true)}
                  className="search-input"
                />
                <Search size={16} className="search-icon" />
              </div>
              
              {search.showSearchDropdown && (
                <>
                  <div 
                    className="search-overlay"
                    onClick={search.closeSearch}
                  />
                  <SearchDropdown
                    searchTerm={search.searchTerm}
                    results={search.searchResults}
                    onItemClick={handleSearchItemClick}
                    onClose={search.closeSearch}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main style={{ 
        padding: '2rem',
        marginTop: '80px' // Para que no se superponga con la navegación fija
      }}>
        <TabContent 
          activeTab={activeTab} 
          campaign={currentCampaign} 
          onTabChange={setActiveTab} 
          connections={connections}
          onNavigateToItem={navigateToItem} // ✨ Pasar función de navegación
          selectedItemForNavigation={selectedItemForNavigation} // ✨ Pasar elemento seleccionado
        />
      </main>

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
function TabContent({ 
  activeTab, 
  campaign, 
  onTabChange, 
  connections, 
  onNavigateToItem, 
  selectedItemForNavigation 
}) {
  // Props comunes para todos los gestores
  const commonProps = {
    campaign,
    connections: {
      ...connections,
      // ✨ Agregar función de navegación a connections
      navigateToItem: onNavigateToItem
    },
    selectedItemForNavigation // ✨ Pasar elemento seleccionado para navegación
  }

  switch (activeTab) {
    case 'dashboard':
      return <Dashboard campaign={campaign} onTabChange={onTabChange} />
    case 'locations':
      return <LocationsManager {...commonProps} />
    case 'players':
      return <PlayersManager {...commonProps} />
    case 'npcs':
      return <NPCsManager {...commonProps} />
    case 'objects':
      return <ObjectsManager {...commonProps} />
    case 'quests':
      return <QuestsManager {...commonProps} />
    case 'notes':
      return <NotesManager {...commonProps} />
    default:
      return <Dashboard campaign={campaign} onTabChange={onTabChange} />
  }
}

// ✨ Dashboard mejorado con navegación directa
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
        <DashboardCard
          title="Lugares"
          count={getCount('locations')}
          icon="📍"
          color="#3b82f6"
          onClick={() => onTabChange('locations')}
        />
        <DashboardCard
          title="Jugadores"
          count={getCount('players')}
          icon="👥"
          color="#10b981"
          onClick={() => onTabChange('players')}
        />
        <DashboardCard
          title="NPCs"
          count={getCount('npcs')}
          icon="🧙"
          color="#8b5cf6"
          onClick={() => onTabChange('npcs')}
        />
        <DashboardCard
          title="Objetos"
          count={getCount('objects')}
          icon="📦"
          color="#06b6d4"
          onClick={() => onTabChange('objects')}
        />
        <DashboardCard
          title="Misiones"
          count={getCount('quests')}
          icon="📜"
          color="#f59e0b"
          onClick={() => onTabChange('quests')}
        />
        <DashboardCard
          title="Notas"
          count={getCount('notes')}
          icon="📝"
          color="#ec4899"
          onClick={() => onTabChange('notes')}
        />
      </div>

      {/* Resumen de actividad reciente */}
      <div style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: '16px',
        padding: '2rem'
      }}>
        <h3 style={{
          color: 'white',
          fontSize: '1.5rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          📊 Resumen de la Campaña
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem'
        }}>
          <div>
            <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              📈 Estadísticas Generales
            </h4>
            <ul style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
              <li>Total de elementos: {getCount('locations') + getCount('players') + getCount('npcs') + getCount('objects') + getCount('quests') + getCount('notes')}</li>
              <li>Campaña creada: {new Date(campaign.createdAt).toLocaleDateString()}</li>
              <li>Última modificación: {new Date(campaign.lastModified).toLocaleDateString()}</li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              🎯 Acciones Rápidas
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                onClick={() => onTabChange('locations')}
                className="btn-secondary"
                style={{ justifyContent: 'flex-start' }}
              >
                📍 Gestionar Lugares
              </button>
              <button
                onClick={() => onTabChange('quests')}
                className="btn-secondary"
                style={{ justifyContent: 'flex-start' }}
              >
                📜 Ver Misiones
              </button>
              <button
                onClick={() => onTabChange('notes')}
                className="btn-secondary"
                style={{ justifyContent: 'flex-start' }}
              >
                📝 Revisar Notas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente para las tarjetas del dashboard
function DashboardCard({ title, count, icon, color, onClick, description }) {
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
      
      <div style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        color: color,
        marginBottom: '0.5rem'
      }}>
        {count}
      </div>
      
      <p style={{ 
        color: 'var(--text-muted)', 
        fontSize: '0.875rem',
        margin: 0,
        lineHeight: '1.4'
      }}>
        {description || `${count === 1 ? 'elemento' : 'elementos'} en total`}
      </p>
    </div>
  )
}

export default CampaignManager