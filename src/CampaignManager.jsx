import React, { useState, useEffect, useCallback } from 'react'
import { Search, ArrowLeft, Menu, X } from 'lucide-react'
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
import { saveCampaigns, loadCampaigns } from './services/storage'

// Configuración de las pestañas
const TABS = [
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
  const [isSaving, setIsSaving] = useState(false)
  
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

  // ✅ Función mejorada para actualizar la campaña con guardado automático
  const updateCampaign = useCallback((updates) => {
    console.log('Actualizando campaña:', updates)
    setCurrentCampaign(prev => {
      const newCampaign = { ...prev, ...updates }
      
      // Guardar automáticamente los cambios
      saveChanges(newCampaign)
      
      return newCampaign
    })
  }, [])

  // ✅ Función para guardar cambios en localStorage
  const saveChanges = useCallback((campaignToSave) => {
    if (isSaving) return
    
    setIsSaving(true)
    try {
      const campaigns = loadCampaigns()
      const updatedCampaigns = campaigns.map(c => 
        c.id === campaignToSave.id 
          ? { ...campaignToSave, lastModified: new Date().toISOString().split('T')[0] }
          : c
      )
      saveCampaigns(updatedCampaigns)
      console.log('Cambios guardados automáticamente')
    } catch (error) {
      console.error('Error al guardar cambios:', error)
    } finally {
      setIsSaving(false)
    }
  }, [isSaving])

  // Hooks
  const connections = useConnections(currentCampaign, updateCampaign)
  const search = useSearch(currentCampaign)

  // ✅ Función mejorada para navegar a un elemento conectado
  const navigateToItem = useCallback((item, itemType) => {
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
  }, [])

  // ✅ Función para manejar click en resultado de búsqueda
  const handleSearchItemClick = useCallback((item, type) => {
    navigateToItem(item, type)
    search.closeSearch()
  }, [navigateToItem, search])

  // ✅ Función para cambiar de pestaña
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId)
    setSelectedItemForNavigation(null)
  }, [])

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
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
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

            {/* Indicador de guardado */}
            {isSaving && (
              <span style={{ 
                color: '#10b981', 
                fontSize: '0.8rem',
                animation: 'pulse 1s infinite'
              }}>
                💾 Guardando...
              </span>
            )}

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
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
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
          onTabChange={handleTabChange} 
          connections={connections}
          onNavigateToItem={navigateToItem}
          selectedItemForNavigation={selectedItemForNavigation}
          updateCampaign={updateCampaign}
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

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
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

// ✅ Componente mejorado para renderizar el contenido de cada pestaña
function TabContent({ 
  activeTab, 
  campaign, 
  onTabChange, 
  connections, 
  onNavigateToItem, 
  selectedItemForNavigation,
  updateCampaign 
}) {
  // Props comunes para todos los gestores
  const commonProps = {
    campaign,
    connections: {
      ...connections,
      navigateToItem: onNavigateToItem
    },
    selectedItemForNavigation,
    updateCampaign
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

// ✅ Dashboard mejorado con mejor rendimiento
const Dashboard = React.memo(function Dashboard({ campaign, onTabChange }) {
  const getCount = (type) => {
    return campaign[type]?.length || 0
  }

  const sections = [
    {
      title: "Lugares",
      type: "locations",
      icon: "📍",
      color: "#3b82f6",
      description: "Escenarios y localizaciones"
    },
    {
      title: "Jugadores",
      type: "players",
      icon: "👥",
      color: "#10b981",
      description: "Héroes de la aventura"
    },
    {
      title: "NPCs",
      type: "npcs",
      icon: "🧙",
      color: "#8b5cf6",
      description: "Personajes del mundo"
    },
    {
      title: "Objetos",
      type: "objects",
      icon: "📦",
      color: "#06b6d4",
      description: "Tesoros y artefactos"
    },
    {
      title: "Misiones",
      type: "quests",
      icon: "📜",
      color: "#f59e0b",
      description: "Aventuras y objetivos"
    },
    {
      title: "Notas",
      type: "notes",
      icon: "📝",
      color: "#ec4899",
      description: "Apuntes y recordatorios"
    }
  ]

  const activeQuests = (campaign.quests || []).filter(quest => quest.status === 'En progreso')
  const completedQuests = (campaign.quests || []).filter(quest => quest.status === 'Completada')
  const pendingQuests = (campaign.quests || []).filter(quest => quest.status === 'Pendiente')

  return (
    <div className="dashboard-container fade-in">
      {/* Header del Dashboard */}
      <div className="dashboard-header">
        <div className="campaign-overview">
          <h1 className="campaign-title">🏰 {campaign.name}</h1>
          {campaign.description && (
            <p className="campaign-description">"{campaign.description}"</p>
          )}
        </div>
      </div>

      {/* Grid de Secciones */}
      <div className="dashboard-grid">
        {sections.map(section => (
          <DashboardCard
            key={section.type}
            title={section.title}
            count={getCount(section.type)}
            icon={section.icon}
            color={section.color}
            onClick={() => onTabChange(section.type)}
            description={section.description}
          />
        ))}
      </div>

      {/* Sección de Estado de Misiones */}
      <div className="quests-status">
        <h3 className="section-title">📊 Estado de Misiones</h3>
        <div className="quests-grid">
          <div className="quest-status-card active">
            <div className="quest-status-header">
              <span className="quest-status-icon">⏳</span>
              <h4>En Progreso</h4>
            </div>
            <div className="quest-count">{activeQuests.length}</div>
            <p>Misiones activas</p>
          </div>
          
          <div className="quest-status-card completed">
            <div className="quest-status-header">
              <span className="quest-status-icon">✅</span>
              <h4>Completadas</h4>
            </div>
            <div className="quest-count">{completedQuests.length}</div>
            <p>Misiones finalizadas</p>
          </div>
          
          <div className="quest-status-card pending">
            <div className="quest-status-header">
              <span className="quest-status-icon">⏸️</span>
              <h4>Pendientes</h4>
            </div>
            <div className="quest-count">{pendingQuests.length}</div>
            <p>Misiones por comenzar</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          min-height: calc(100vh - 120px);
        }

        .dashboard-header {
          margin-bottom: 3rem;
          padding: 2rem;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.05));
          border-radius: 20px;
          border: 1px solid rgba(139, 92, 246, 0.2);
          text-align: center;
        }

        .campaign-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0 0 0.5rem 0;
          background: linear-gradient(135deg, #ffffff, #e5e7eb);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .campaign-description {
          color: var(--text-muted);
          font-size: 1.1rem;
          font-style: italic;
          margin: 0;
        }

        .stat-highlight {
          text-align: center;
          padding: 1.5rem;
          background: rgba(139, 92, 246, 0.1);
          border-radius: 16px;
          border: 1px solid rgba(139, 92, 246, 0.3);
        }

        .stat-number {
          display: block;
          font-size: 3rem;
          font-weight: 900;
          background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-label {
          display: block;
          color: var(--text-muted);
          font-size: 0.9rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .recent-activity {
          margin-top: 3rem;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .activity-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .activity-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(31, 41, 55, 0.6), rgba(31, 41, 55, 0.3));
          border-radius: 16px;
          border: 1px solid rgba(139, 92, 246, 0.2);
          transition: all 0.3s ease;
        }

        .activity-card:hover {
          transform: translateY(-2px);
          border-color: rgba(139, 92, 246, 0.4);
          box-shadow: 0 8px 25px rgba(139, 92, 246, 0.1);
        }

        .activity-icon {
          font-size: 2rem;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(139, 92, 246, 0.2);
          border-radius: 12px;
        }

        .activity-content h4 {
          color: white;
          font-size: 1.1rem;
          margin: 0 0 0.25rem 0;
          font-weight: 600;
        }

        .quests-status {
          margin-top: 3rem;
        }

        .quests-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .quest-status-card {
          padding: 2rem;
          background: linear-gradient(135deg, rgba(31, 41, 55, 0.8), rgba(31, 41, 55, 0.4));
          border-radius: 20px;
          border: 1px solid rgba(139, 92, 246, 0.2);
          text-align: center;
          transition: all 0.3s ease;
        }

        .quest-status-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
        }

        .quest-status-card.active {
          border-color: rgba(245, 158, 11, 0.5);
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(31, 41, 55, 0.4));
        }

        .quest-status-card.completed {
          border-color: rgba(16, 185, 129, 0.5);
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(31, 41, 55, 0.4));
        }

        .quest-status-card.pending {
          border-color: rgba(107, 114, 128, 0.5);
          background: linear-gradient(135deg, rgba(107, 114, 128, 0.1), rgba(31, 41, 55, 0.4));
        }

        .quest-status-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .quest-status-icon {
          font-size: 1.5rem;
        }

        .quest-status-header h4 {
          color: white;
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .quest-count {
          font-size: 3rem;
          font-weight: 900;
          color: white;
          margin-bottom: 0.5rem;
        }

        .quest-status-card.active .quest-count {
          color: #f59e0b;
        }

        .quest-status-card.completed .quest-count {
          color: #10b981;
        }

        .quest-status-card.pending .quest-count {
          color: #6b7280;
        }

        .quest-status-card p {
          color: var(--text-muted);
          margin: 0;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 1rem;
          }
          
          .dashboard-header {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 1rem;
          }

          .campaign-title {
            font-size: 2rem;
          }
          
          .dashboard-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .activity-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
})

// ✅ Componente optimizado para las tarjetas del dashboard
const DashboardCard = React.memo(function DashboardCard({ 
  title, 
  count, 
  icon, 
  color, 
  onClick, 
  description 
}) {
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
        
        <div className="card-action">
          <span>Ver {title.toLowerCase()} →</span>
        </div>
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

        .dashboard-card:hover .card-action {
          opacity: 1;
          transform: translateX(0);
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
          margin: 0 0 1rem 0;
          line-height: 1.4;
        }

        .card-action {
          color: var(--card-color);
          font-size: 0.875rem;
          font-weight: 600;
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.3s ease;
        }

        @media (max-width: 768px) {
          .dashboard-card {
            padding: 1.25rem;
          }

          .card-count {
            font-size: 2rem;
          }

          .card-action {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  )
})

export default CampaignManager