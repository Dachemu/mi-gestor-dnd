import React, { useState, useEffect, useCallback } from 'react'
import { SearchIcon, BackIcon, MenuIcon, CloseIcon } from '../components/icons'
import { useLogger } from '../hooks/useLogger'
import UniversalManager from '../components/EntityManager'
import ConnectionModal from '../components/ConnectionModal'
import SearchDropdown from '../components/GlobalSearchDropdown'
import Dashboard from '../components/Dashboard'
import { useConnections } from '../hooks/useConnections'
import { useSearch } from '../hooks/useSearch'
import { saveCampaigns, loadCampaigns } from '../services'

// Tabs configuration
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
  const { debug, logError } = useLogger()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [currentCampaign, setCurrentCampaign] = useState(campaign)
  const [selectedItemForNavigation, setSelectedItemForNavigation] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Detect if mobile
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

  // Close mobile menu when tab changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [activeTab])

  // Enhanced function to update campaign with auto-save
  const updateCampaign = useCallback((updates) => {
    debug('Actualizando campaña:', updates)
    setCurrentCampaign(prev => {
      const newCampaign = { ...prev, ...updates }
      
      // Auto-save changes
      saveChanges(newCampaign)
      
      return newCampaign
    })
  }, [])

  // Function to save changes to localStorage
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
      debug('Cambios guardados automáticamente')
    } catch (error) {
      logError('Error al guardar cambios:', error)
    } finally {
      setIsSaving(false)
    }
  }, [isSaving])

  // Hooks
  const connections = useConnections(currentCampaign, updateCampaign)
  const search = useSearch(currentCampaign)

  // Enhanced function to navigate to connected element
  const navigateToItem = useCallback((item, itemType) => {
    debug('Navegando a:', itemType, item.name || item.title)
    
    // Switch to correct tab
    setActiveTab(itemType)
    
    // Select specific element
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
              <BackIcon size={16} />
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
              <SearchIcon size={16} className="search-icon" />
              
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
                {isMobileMenuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
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
          height: 100vh;
          background: var(--bg-dark);
          overflow-x: hidden;
          width: 100%;
          display: flex;
          flex-direction: column;
        }

        /* Navegación */
        .campaign-nav {
          background: rgba(15, 15, 25, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(139, 92, 246, 0.2);
          z-index: 100;
          padding: 1rem 0;
          flex-shrink: 0;
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
          background: rgba(15, 15, 25, 0.98);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(139, 92, 246, 0.2);
          z-index: 99;
          animation: slideDown 0.3s ease-out;
          flex-shrink: 0;
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
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          width: 100%;
          flex: 1;
          min-height: 0;
          box-sizing: border-box;
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
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .nav-container {
            padding: 0 0.5rem;
            gap: 0.5rem;
            display: grid;
            grid-template-columns: auto 1fr auto;
            align-items: center;
          }

          .nav-left {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            min-width: 0;
          }

          .nav-right {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            min-width: 0;
          }

          .campaign-title-nav {
            font-size: 0.9rem;
            max-width: 80px;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .search-box {
            width: 100%;
            max-width: 120px;
            min-width: 80px;
          }

          .search-input {
            width: 100%;
            min-width: 80px;
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
            white-space: nowrap;
          }
          
          .campaign-content {
            padding: 0.5rem;
            width: 100%;
          }
        }

        /* Móvil muy pequeño */
        @media (max-width: 360px) {
          .nav-container {
            padding: 0 0.25rem;
            gap: 0.25rem;
          }

          .search-box {
            max-width: 100px;
            min-width: 70px;
          }

          .search-input {
            min-width: 70px;
            padding: 0.3rem 0.4rem 0.3rem 1.5rem;
            font-size: 0.7rem;
          }

          .search-icon {
            width: 10px;
            height: 10px;
            left: 0.4rem;
          }

          .btn-back {
            padding: 0.25rem 0.4rem;
            font-size: 0.75rem;
          }

          .campaign-content {
            padding: 0.25rem;
          }

          .dashboard-container {
            padding: 0.5rem;
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

  // Dynamic entity managers using UniversalManager
  if (activeTab === 'dashboard') {
    return <Dashboard campaign={campaign} onTabChange={onTabChange} onNavigateToItem={onNavigateToItem} />
  }

  // All entity types use UniversalManager directly
  const entityTypes = ['locations', 'players', 'npcs', 'objects', 'quests', 'notes']
  if (entityTypes.includes(activeTab)) {
    return <UniversalManager entityType={activeTab} {...commonProps} />
  }

  // Default fallback
  return <Dashboard campaign={campaign} onTabChange={onTabChange} onNavigateToItem={onNavigateToItem} />
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



export default CampaignManager