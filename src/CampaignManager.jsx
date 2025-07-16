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
          height: calc(100vh - 80px);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
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
            width: 200px;
          }
        }

        @media (max-width: 1024px) {
          .nav-container {
            padding: 0 1rem;
            gap: 1rem;
          }

          .campaign-title-nav {
            font-size: 1.2rem;
            max-width: 180px;
          }

          .tab-button {
            padding: 0.6rem 0.8rem;
            font-size: 0.85rem;
          }

          .search-input {
            width: 160px;
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

          .nav-container {
            padding: 0 0.75rem;
          }

          .campaign-title-nav {
            font-size: 1.1rem;
            max-width: 120px;
          }

          .btn-back {
            padding: 0.4rem 0.6rem;
          }

          .search-input {
            width: 120px;
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
            height: calc(100vh - 65px);
          }
        }

        @media (max-width: 480px) {
          .nav-container {
            padding: 0 0.5rem;
            gap: 0.25rem;
          }

          .nav-left {
            flex: 1;
            min-width: 0;
          }

          .nav-right {
            flex-shrink: 0;
          }

          .campaign-title-nav {
            font-size: 0.9rem;
            max-width: 80px;
          }

          .search-input {
            width: 90px;
            padding: 0.4rem 0.5rem 0.4rem 1.75rem;
            font-size: 0.75rem;
          }

          .search-icon {
            width: 12px;
            height: 12px;
            left: 0.5rem;
          }

          .btn-back {
            padding: 0.3rem 0.5rem;
            font-size: 0.8rem;
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
      return <Dashboard campaign={campaign} onTabChange={onTabChange} onNavigateToItem={onNavigateToItem} />
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
      return <Dashboard campaign={campaign} onTabChange={onTabChange} onNavigateToItem={onNavigateToItem} />
  }
}

// ✅ Componente para las tarjetas de estado de misiones
const QuestStatusCard = React.memo(function QuestStatusCard({ 
  title, 
  icon, 
  count, 
  quests, 
  className, 
  onQuestClick 
}) {
  return (
    <>
      <div className={`quest-status-card ${className}`}>
        <div className="quest-status-header">
          <span className="quest-status-icon">{icon}</span>
          <h4>{title}</h4>
          <span className="quest-count-badge">{count}</span>
        </div>
        
        {count > 0 ? (
          <div className="quest-list">
            {quests.slice(0, 5).map((quest, index) => (
              <div 
                key={quest.id || index}
                className="quest-item"
                onClick={() => onQuestClick(quest)}
              >
                <span className="quest-icon">{quest.icon || '📜'}</span>
                <span className="quest-name">{quest.name || quest.title}</span>
                <span className="quest-arrow">→</span>
              </div>
            ))}
            {quests.length > 5 && (
              <div className="quest-item more-quests" onClick={() => onQuestClick()}>
                <span className="quest-icon">⋯</span>
                <span className="quest-name">Ver todas ({quests.length})</span>
                <span className="quest-arrow">→</span>
              </div>
            )}
          </div>
        ) : (
          <div className="no-quests">
            <span>No hay misiones {title.toLowerCase()}</span>
          </div>
        )}
      </div>

      <style jsx>{`
        .quest-status-card {
          cursor: default;
          user-select: none;
          min-height: 250px;
          display: flex;
          flex-direction: column;
        }

        .quest-status-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(139, 92, 246, 0.2);
        }

        .quest-status-header h4 {
          flex: 1;
          margin: 0 0.5rem;
        }

        .quest-count-badge {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          min-width: 24px;
          text-align: center;
        }

        .quest-list {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .quest-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
          border: 1px solid transparent;
        }

        .quest-item:hover {
          background: rgba(139, 92, 246, 0.15);
          border-color: rgba(139, 92, 246, 0.3);
          transform: translateX(2px);
        }

        .quest-icon {
          font-size: 1rem;
          flex-shrink: 0;
        }

        .quest-name {
          color: #e5e7eb;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
          font-weight: 500;
        }

        .quest-arrow {
          color: #9ca3af;
          font-size: 0.8rem;
          opacity: 0;
          transition: opacity 0.2s ease;
          flex-shrink: 0;
        }

        .quest-item:hover .quest-arrow {
          opacity: 1;
        }

        .more-quests {
          font-weight: 600;
          color: #8b5cf6;
          border-color: rgba(139, 92, 246, 0.3);
        }

        .more-quests .quest-name {
          color: #8b5cf6;
        }

        .more-quests:hover {
          background: rgba(139, 92, 246, 0.2);
        }

        .no-quests {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          font-style: italic;
          font-size: 0.9rem;
          text-align: center;
          padding: 2rem 1rem;
        }
      `}</style>
    </>
  )
})

// ✅ Dashboard mejorado con mejor rendimiento
const Dashboard = React.memo(function Dashboard({ campaign, onTabChange, onNavigateToItem }) {
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
      {/* Header del Dashboard - Compact version */}
      <div className="dashboard-header-compact">
        <div className="dashboard-breadcrumb">
          <span className="breadcrumb-icon">🏰</span>
          <h1 className="campaign-title-dashboard">{campaign.name}</h1>
        </div>
        {campaign.description && (
          <p className="campaign-subtitle">"{campaign.description}"</p>
        )}
      </div>

      {/* Layout Principal Mejorado */}
      <div className="dashboard-main-layout">
        {/* Sección Superior - Resumen General */}
        <div className="dashboard-general-summary">
          <div className="stats-overview">
            <h3 className="section-title">📊 Resumen General</h3>
            <div className="stats-grid">
              {sections.map(section => (
                <div
                  key={section.type}
                  className="stat-card"
                  onClick={() => onTabChange(section.type)}
                  style={{ '--card-color': section.color }}
                >
                  <div className="stat-icon">{section.icon}</div>
                  <div className="stat-info">
                    <div className="stat-count">{getCount(section.type)}</div>
                    <div className="stat-label">{section.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sección Inferior - Detalle de Misiones */}
        <div className="dashboard-quests-detail">
          <h3 className="section-title">🎯 Estado de Misiones</h3>
          
          {/* Resumen de estados */}
          <div className="quest-status-summary">
            <div className="quest-status-item active" onClick={() => onTabChange('quests')}>
              <div className="quest-status-icon">⏳</div>
              <div className="quest-status-info">
                <div className="quest-status-count">{activeQuests.length}</div>
                <div className="quest-status-label">En Progreso</div>
              </div>
            </div>
            <div className="quest-status-item completed" onClick={() => onTabChange('quests')}>
              <div className="quest-status-icon">✅</div>
              <div className="quest-status-info">
                <div className="quest-status-count">{completedQuests.length}</div>
                <div className="quest-status-label">Completadas</div>
              </div>
            </div>
            <div className="quest-status-item pending" onClick={() => onTabChange('quests')}>
              <div className="quest-status-icon">⏸️</div>
              <div className="quest-status-info">
                <div className="quest-status-count">{pendingQuests.length}</div>
                <div className="quest-status-label">Pendientes</div>
              </div>
            </div>
          </div>

          {/* Columnas de misiones por estado */}
          <div className="missions-by-state">
            {/* Misiones En Progreso */}
            <div className="mission-column">
              <h4 className="mission-column-title">⏳ En Progreso ({activeQuests.length})</h4>
              {activeQuests.length > 0 ? (
                <div className="mission-list">
                  {activeQuests.slice(0, 5).map((quest, index) => (
                    <div 
                      key={quest.id || index}
                      className="mission-item"
                      onClick={() => onNavigateToItem(quest, 'quests')}
                    >
                      <span className="mission-icon">{quest.icon || '📜'}</span>
                      <div className="mission-info">
                        <div className="mission-name">{quest.name || quest.title}</div>
                        <div className="mission-priority">{quest.priority || 'Media'}</div>
                      </div>
                      <span className="mission-arrow">→</span>
                    </div>
                  ))}
                  {activeQuests.length > 5 && (
                    <div className="more-missions-link" onClick={() => onTabChange('quests')}>
                      Ver todas ({activeQuests.length})
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-missions">
                  <span className="no-missions-icon">🎭</span>
                  <p>No hay misiones activas</p>
                </div>
              )}
            </div>

            {/* Misiones Completadas */}
            <div className="mission-column">
              <h4 className="mission-column-title">✅ Completadas ({completedQuests.length})</h4>
              {completedQuests.length > 0 ? (
                <div className="mission-list">
                  {completedQuests.slice(0, 5).map((quest, index) => (
                    <div 
                      key={quest.id || index}
                      className="mission-item completed"
                      onClick={() => onNavigateToItem(quest, 'quests')}
                    >
                      <span className="mission-icon">{quest.icon || '📜'}</span>
                      <div className="mission-info">
                        <div className="mission-name">{quest.name || quest.title}</div>
                        <div className="mission-reward">{quest.reward || 'Sin recompensa'}</div>
                      </div>
                      <span className="mission-arrow">→</span>
                    </div>
                  ))}
                  {completedQuests.length > 5 && (
                    <div className="more-missions-link" onClick={() => onTabChange('quests')}>
                      Ver todas ({completedQuests.length})
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-missions">
                  <span className="no-missions-icon">🏆</span>
                  <p>No hay misiones completadas</p>
                </div>
              )}
            </div>

            {/* Misiones Pendientes */}
            <div className="mission-column">
              <h4 className="mission-column-title">⏸️ Pendientes ({pendingQuests.length})</h4>
              {pendingQuests.length > 0 ? (
                <div className="mission-list">
                  {pendingQuests.slice(0, 5).map((quest, index) => (
                    <div 
                      key={quest.id || index}
                      className="mission-item pending"
                      onClick={() => onNavigateToItem(quest, 'quests')}
                    >
                      <span className="mission-icon">{quest.icon || '📜'}</span>
                      <div className="mission-info">
                        <div className="mission-name">{quest.name || quest.title}</div>
                        <div className="mission-location">{quest.location || 'Sin ubicación'}</div>
                      </div>
                      <span className="mission-arrow">→</span>
                    </div>
                  ))}
                  {pendingQuests.length > 5 && (
                    <div className="more-missions-link" onClick={() => onTabChange('quests')}>
                      Ver todas ({pendingQuests.length})
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-missions">
                  <span className="no-missions-icon">📝</span>
                  <p>No hay misiones pendientes</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          min-height: auto;
        }

        .dashboard-header-compact {
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .dashboard-breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .breadcrumb-icon {
          font-size: 1.5rem;
        }

        .breadcrumb-text {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .campaign-title-dashboard {
          font-size: 1.8rem;
          font-weight: 700;
          color: white;
          margin: 0;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .campaign-subtitle {
          color: var(--text-muted);
          font-size: 0.95rem;
          font-style: italic;
          margin: 0;
          opacity: 0.8;
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

        .dashboard-main-layout {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          margin-top: 1rem;
        }

        .dashboard-general-summary {
          width: 100%;
        }

        .dashboard-quests-detail {
          width: 100%;
        }

        .quest-status-summary {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .quest-status-item {
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid transparent;
        }

        .quest-status-item:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }

        .quest-status-item.active {
          border-color: rgba(245, 158, 11, 0.5);
        }

        .quest-status-item.completed {
          border-color: rgba(16, 185, 129, 0.5);
        }

        .quest-status-item.pending {
          border-color: rgba(107, 114, 128, 0.5);
        }

        .quest-status-icon {
          font-size: 1.2rem;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(139, 92, 246, 0.2);
          border-radius: 6px;
        }

        .quest-status-count {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.25rem;
        }

        .quest-status-label {
          font-size: 0.7rem;
          color: #9ca3af;
          font-weight: 500;
        }

        .missions-by-state {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .mission-column {
          background: linear-gradient(135deg, rgba(31, 41, 55, 0.8), rgba(31, 41, 55, 0.4));
          border-radius: 16px;
          border: 1px solid rgba(139, 92, 246, 0.2);
          padding: 1.5rem;
          min-height: 300px;
          display: flex;
          flex-direction: column;
        }

        .mission-column-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: white;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .mission-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          flex: 1;
        }

        .mission-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .mission-item:hover {
          background: rgba(139, 92, 246, 0.15);
          border-color: rgba(139, 92, 246, 0.3);
          transform: translateX(2px);
        }

        .mission-item.completed {
          opacity: 0.8;
        }

        .mission-item.pending {
          opacity: 0.9;
        }

        .mission-icon {
          font-size: 1rem;
          flex-shrink: 0;
        }

        .mission-info {
          flex: 1;
        }

        .mission-name {
          color: white;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .mission-priority,
        .mission-reward,
        .mission-location {
          color: #9ca3af;
          font-size: 0.8rem;
          line-height: 1.3;
        }

        .mission-arrow {
          color: #9ca3af;
          font-size: 0.8rem;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .mission-item:hover .mission-arrow {
          opacity: 1;
        }

        .more-missions-link {
          text-align: center;
          padding: 0.75rem;
          color: #8b5cf6;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .more-missions-link:hover {
          background: rgba(139, 92, 246, 0.1);
        }

        .no-missions {
          text-align: center;
          padding: 2rem 1rem;
          color: #9ca3af;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .no-missions-icon {
          font-size: 2rem;
          display: block;
          margin-bottom: 1rem;
        }

        .section-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: white;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .stats-overview {
          background: linear-gradient(135deg, rgba(31, 41, 55, 0.8), rgba(31, 41, 55, 0.4));
          border-radius: 16px;
          border: 1px solid rgba(139, 92, 246, 0.2);
          padding: 1.5rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid transparent;
        }

        .stat-card:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--card-color);
          transform: translateY(-2px);
        }

        .stat-icon {
          font-size: 1.5rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(139, 92, 246, 0.2);
          border-radius: 8px;
        }

        .stat-info {
          flex: 1;
        }

        .stat-count {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--card-color);
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #9ca3af;
          font-weight: 500;
        }


        .quest-status-card {
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(31, 41, 55, 0.8), rgba(31, 41, 55, 0.4));
          border-radius: 16px;
          border: 1px solid rgba(139, 92, 246, 0.2);
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .quest-status-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
          border-color: rgba(139, 92, 246, 0.3);
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

        .quest-status-card.active .quest-count-badge {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .quest-status-card.completed .quest-count-badge {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .quest-status-card.pending .quest-count-badge {
          background: rgba(107, 114, 128, 0.2);
          color: #9ca3af;
          border: 1px solid rgba(107, 114, 128, 0.3);
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
          
          .dashboard-header-compact {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
          }

          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.75rem;
          }

          .stat-card {
            padding: 0.75rem;
            flex-direction: column;
            text-align: center;
            gap: 0.5rem;
          }

          .stat-icon {
            width: 32px;
            height: 32px;
            font-size: 1.2rem;
          }

          .stat-count {
            font-size: 1.2rem;
          }

          .stat-label {
            font-size: 0.7rem;
          }

          .quest-status-summary {
            flex-direction: column;
            gap: 0.75rem;
          }

          .quest-status-item {
            padding: 0.75rem;
          }

          .quest-status-count {
            font-size: 1.2rem;
          }

          .quest-status-label {
            font-size: 0.65rem;
          }

          .missions-by-state {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .mission-column {
            padding: 1rem;
            min-height: 200px;
          }

          .mission-item {
            padding: 0.5rem;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .mission-info {
            width: 100%;
          }

          .mission-name {
            font-size: 0.85rem;
          }

          .mission-priority,
          .mission-reward,
          .mission-location {
            font-size: 0.75rem;
          }

          .section-title {
            font-size: 1.1rem;
          }

          .mission-column-title {
            font-size: 1rem;
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