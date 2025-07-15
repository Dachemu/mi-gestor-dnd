import React, { useState, useEffect } from 'react'
import { Search, ArrowLeft, Download, Menu, X } from 'lucide-react'
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false)
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Cerrar menú móvil al cambiar de pestaña
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [activeTab])

  const updateCampaign = (updates) => {
    console.log('Actualizando campaña:', updates)
    setCurrentCampaign(prev => ({ ...prev, ...updates }))
  }

  // Hooks
  const connections = useConnections(currentCampaign, updateCampaign)
  const search = useSearch(currentCampaign)

  // Función para navegar a un elemento conectado
  const navigateToItem = (item, itemType) => {
    console.log('Navegando a:', itemType, item.name || item.title)
    
    // Cambiar a la pestaña correcta
    setActiveTab(itemType)
    
    // Seleccionar el elemento específico
    setSelectedItemForNavigation({
      item,
      type: itemType,
      timestamp: Date.now()
    })
    
    // Limpiar la selección después de un momento
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
    <div className="campaign-manager">
      {/* Navegación superior */}
      <nav className="campaign-nav">
        <div className="nav-container">
          {/* Sección izquierda */}
          <div className="nav-section nav-left">
            <button
              onClick={onBackToSelector}
              className="btn-back"
              aria-label="Volver a campañas"
            >
              <ArrowLeft size={16} />
              {!isMobile && <span>Campañas</span>}
            </button>
            
            <h1 className="campaign-title-nav">
              {currentCampaign.name}
            </h1>
          </div>

          {/* Sección central - Pestañas (desktop) */}
          {!isMobile && (
            <div className="nav-section nav-center">
              <div className="tabs-wrapper">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                    aria-current={activeTab === tab.id ? 'page' : undefined}
                  >
                    <span className="tab-icon">{tab.icon}</span>
                    <span className="tab-text">{tab.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sección derecha */}
          <div className="nav-section nav-right">
            <div className="search-box">
              <input
                type="text"
                placeholder="Buscar..."
                value={search.searchTerm}
                onChange={(e) => search.handleSearchChange(e.target.value)}
                onFocus={search.handleSearchFocus}
                onBlur={search.handleSearchBlur}
                className="search-input"
                aria-label="Buscar en la campaña"
              />
              <Search size={16} className="search-icon" />
              
              {search.showSearchDropdown && search.searchResults.length > 0 && (
                <SearchDropdown
                  searchTerm={search.searchTerm}
                  results={search.searchResults}
                  onItemClick={handleSearchItemClick}
                  onClose={search.closeSearch}
                />
              )}
            </div>

            {/* Botón menú móvil */}
            {isMobile && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="mobile-menu-toggle"
                aria-label="Menú de navegación"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Menú móvil */}
      {isMobile && isMobileMenuOpen && (
        <div className="mobile-menu-dropdown">
          <div className="mobile-tabs-list">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`mobile-tab-button ${activeTab === tab.id ? 'active' : ''}`}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-text">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <main className="campaign-content">
        <TabContent 
          activeTab={activeTab} 
          campaign={currentCampaign} 
          onTabChange={setActiveTab} 
          connections={connections}
          onNavigateToItem={navigateToItem}
          selectedItemForNavigation={selectedItemForNavigation}
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

      <style jsx>{`
        .campaign-manager {
          min-height: 100vh;
          background: var(--bg-dark);
        }

        /* Navegación */
        .campaign-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: rgba(15, 15, 25, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(139, 92, 246, 0.2);
          z-index: 100;
          padding: 1rem 0;
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }

        .nav-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .nav-left {
          flex-shrink: 0;
        }

        .nav-center {
          flex: 1;
          display: flex;
          justify-content: center;
        }

        .nav-right {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        /* Botón volver */
        .btn-back {
          background: rgba(139, 92, 246, 0.2);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 8px;
          color: #a78bfa;
          padding: 0.5rem 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .btn-back:hover {
          background: rgba(139, 92, 246, 0.3);
          transform: translateX(-2px);
        }

        /* Título */
        .campaign-title-nav {
          color: white;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 300px;
        }

        /* Pestañas */
        .tabs-wrapper {
          display: flex;
          gap: 0.5rem;
          background: rgba(31, 41, 55, 0.6);
          border-radius: 12px;
          padding: 0.5rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(139, 92, 246, 0.2);
        }

        .tab-button {
          background: transparent;
          border: none;
          border-radius: 8px;
          color: #9ca3af;
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          white-space: nowrap;
        }

        .tab-button:hover {
          background: rgba(139, 92, 246, 0.1);
          color: #e5e7eb;
        }

        .tab-button.active {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
        }

        /* Búsqueda */
        .search-box {
          position: relative;
        }

        .search-input {
          width: 280px;
          background: rgba(31, 41, 55, 0.8);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 10px;
          padding: 0.6rem 1rem 0.6rem 2.5rem;
          color: white;
          font-size: 0.9rem;
          outline: none;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          background: rgba(31, 41, 55, 0.95);
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        .search-input::placeholder {
          color: #6b7280;
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          pointer-events: none;
        }

        /* Menú móvil */
        .mobile-menu-toggle {
          display: none;
          background: rgba(139, 92, 246, 0.2);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 8px;
          color: #a78bfa;
          padding: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mobile-menu-toggle:hover {
          background: rgba(139, 92, 246, 0.3);
        }

        .mobile-menu-dropdown {
          position: fixed;
          top: 65px;
          left: 0;
          right: 0;
          background: rgba(15, 15, 25, 0.98);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(139, 92, 246, 0.2);
          z-index: 99;
          animation: slideDown 0.3s ease-out;
        }

        .mobile-tabs-list {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .mobile-tab-button {
          background: rgba(31, 41, 55, 0.6);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 8px;
          color: #9ca3af;
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          text-align: left;
        }

        .mobile-tab-button:hover {
          background: rgba(139, 92, 246, 0.1);
          color: #e5e7eb;
        }

        .mobile-tab-button.active {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
          font-weight: 600;
        }

        /* Contenido */
        .campaign-content {
          padding: 2rem;
          margin-top: 80px;
          min-height: calc(100vh - 80px);
        }

        /* Animaciones */
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .search-input {
            width: 220px;
          }
        }

        @media (max-width: 1024px) {
          .nav-container {
            padding: 0 1rem;
            gap: 1rem;
          }

          .campaign-title-nav {
            font-size: 1.2rem;
            max-width: 200px;
          }

          .tab-button {
            padding: 0.6rem 0.8rem;
            font-size: 0.85rem;
          }

          .search-input {
            width: 180px;
            font-size: 0.85rem;
          }
        }

        @media (max-width: 768px) {
          .campaign-nav {
            padding: 0.75rem 0;
          }

          .mobile-menu-toggle {
            display: flex;
          }

          .nav-center {
            display: none;
          }

          .campaign-title-nav {
            font-size: 1.1rem;
            max-width: 150px;
          }

          .btn-back {
            padding: 0.4rem 0.6rem;
          }

          .search-input {
            width: 140px;
            padding: 0.5rem 0.75rem 0.5rem 2rem;
            font-size: 0.8rem;
          }

          .search-icon {
            width: 14px;
            height: 14px;
          }

          .campaign-content {
            padding: 1rem;
            margin-top: 65px;
          }
        }

        @media (max-width: 480px) {
          .nav-container {
            padding: 0 0.75rem;
            gap: 0.5rem;
          }

          .campaign-title-nav {
            font-size: 1rem;
            max-width: 100px;
          }

          .search-input {
            width: 100px;
          }
        }
      `}</style>
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
      navigateToItem: onNavigateToItem
    },
    selectedItemForNavigation
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

// Dashboard mejorado
function Dashboard({ campaign, onTabChange }) {
  const getCount = (type) => {
    return campaign[type]?.length || 0
  }

  return (
    <div className="dashboard-container fade-in">
      <h2 style={{ 
        color: 'white', 
        fontSize: '2rem', 
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        📊 Resumen de {campaign.name}
      </h2>

      {/* Estadísticas principales */}
      <div className="stats-grid">
        <DashboardCard
          title="Lugares"
          count={getCount('locations')}
          icon="📍"
          color="#3b82f6"
          onClick={() => onTabChange('locations')}
          description="Escenarios y localizaciones"
        />
        <DashboardCard
          title="Jugadores"
          count={getCount('players')}
          icon="👥"
          color="#10b981"
          onClick={() => onTabChange('players')}
          description="Héroes de la aventura"
        />
        <DashboardCard
          title="NPCs"
          count={getCount('npcs')}
          icon="🧙"
          color="#8b5cf6"
          onClick={() => onTabChange('npcs')}
          description="Personajes del mundo"
        />
        <DashboardCard
          title="Objetos"
          count={getCount('objects')}
          icon="📦"
          color="#06b6d4"
          onClick={() => onTabChange('objects')}
          description="Tesoros y artefactos"
        />
        <DashboardCard
          title="Misiones"
          count={getCount('quests')}
          icon="📜"
          color="#f59e0b"
          onClick={() => onTabChange('quests')}
          description="Aventuras y objetivos"
        />
        <DashboardCard
          title="Notas"
          count={getCount('notes')}
          icon="📝"
          color="#ec4899"
          onClick={() => onTabChange('notes')}
          description="Apuntes y recordatorios"
        />
      </div>

      <style jsx>{`
        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

// Componente para las tarjetas del dashboard
function DashboardCard({ title, count, icon, color, onClick, description }) {
  return (
    <>
      <div
        onClick={onClick}
        className="dashboard-card"
        style={{
          '--card-color': color
        }}
      >
        <div className="card-header">
          <span className="card-icon">{icon}</span>
          <h4 className="card-title">{title}</h4>
        </div>
        
        <div className="card-count">{count}</div>
        
        <p className="card-description">{description}</p>
      </div>

      <style jsx>{`
        .dashboard-card {
          background: rgba(31, 41, 55, 0.5);
          border: 1px solid rgba(139, 92, 246, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .dashboard-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--card-color);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .dashboard-card:hover {
          background: rgba(31, 41, 55, 0.7);
          border-color: var(--card-color);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .dashboard-card:hover::before {
          opacity: 1;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .card-icon {
          font-size: 1.5rem;
        }

        .card-title {
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
        }

        .card-count {
          font-size: 2.5rem;
          font-weight: bold;
          color: var(--card-color);
          margin-bottom: 0.5rem;
        }

        .card-description {
          color: #9ca3af;
          font-size: 0.875rem;
          margin: 0;
          line-height: 1.4;
        }

        @media (max-width: 768px) {
          .dashboard-card {
            padding: 1.25rem;
          }

          .card-count {
            font-size: 2rem;
          }
        }
      `}</style>
    </>
  )
}

export default CampaignManager