import React, { useState, useEffect, useCallback } from 'react'
import { SearchIcon, BackIcon, MenuIcon, CloseIcon } from '../components/ui/icons'
import { useLogger } from '../hooks/useLogger.js'
import UniversalManager from '../components/features/EntityManager'
import ConnectionModal from '../components/features/ConnectionModal'
import SearchDropdown from '../components/features/GlobalSearchDropdown'
import { ImprovedSearchBox } from '../components/features/ImprovedSearchBox'
import Dashboard from '../components/features/Dashboard'
import { useConnections } from '../hooks/useConnections.js'
import { useSearch } from '../hooks/useSearch.js'
import { saveCampaigns, loadCampaigns, exportCampaign } from '../services'
import { Download } from 'lucide-react'
import styles from './CampaignDashboard.module.css'
import { BaseButton, BaseInput, BaseBadge } from '../components/ui/base'

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

function CampaignDashboard({ campaign, onBackToSelector }) {
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

  // ✅ Función para exportar campaña actual
  const handleExportCampaign = useCallback(() => {
    try {
      if (exportCampaign(currentCampaign)) {
        debug('Campaña exportada exitosamente')
      } else {
        logError('Error al exportar la campaña')
      }
    } catch (error) {
      logError('Error al exportar campaña:', error)
    }
  }, [currentCampaign, debug, logError])

  return (
    <div className={styles.campaignManager}>
      {/* Navegación superior */}
      <nav className={styles.campaignNav}>
        <div className={styles.navContainer}>
          {/* Sección izquierda */}
          <div className={`${styles.navSection} ${styles.navLeft}`}>
            <BaseButton
              variant="secondary"
              size="sm"
              onClick={onBackToSelector}
              icon={<BackIcon size={16} />}
              aria-label="Volver a campañas"
            >
              {!isMobile && "Campañas"}
            </BaseButton>
          </div>

          {/* Sección central - Pestañas (desktop) */}
          {!isMobile && (
            <div className={`${styles.navSection} ${styles.navCenter}`}>
              <div className={styles.tabsWrapper}>
                {TABS.map(tab => (
                  <BaseButton
                    key={tab.id}
                    variant="tab"
                    size="sm"
                    active={activeTab === tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    icon={<span className="tab-icon">{tab.icon}</span>}
                    aria-current={activeTab === tab.id ? 'page' : undefined}
                  >
                    <span className="tab-text">{tab.name}</span>
                  </BaseButton>
                ))}
              </div>
            </div>
          )}

          {/* Sección derecha */}
          <div className={`${styles.navSection} ${styles.navRight}`}>
            <ImprovedSearchBox 
              search={search} 
              navigateToItem={handleSearchItemClick} 
            />
            {/* Botón de exportar */}
            {!isMobile && (
              <BaseButton
                variant="compact"
                onClick={handleExportCampaign}
                icon={<Download size={16} />}
                title="Exportar campaña"
                aria-label="Exportar campaña"
                className={styles.exportButton}
              >
                <span className={styles.exportText}>Exportar</span>
              </BaseButton>
            )}

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
          </div>

          {/* Botón menú móvil */}
          {isMobile && (
              <BaseButton
                variant="compact"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                icon={isMobileMenuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
                aria-label="Menú de navegación"
                className={styles.mobileMenuToggle}
              />
          )}
        </div>
      </nav>

      {/* Menú móvil */}
      {isMobile && isMobileMenuOpen && (
        <div className={styles.mobileMenuDropdown}>
          <div className={styles.mobileTabsList}>
            {TABS.map(tab => (
              <BaseButton
                key={tab.id}
                variant="tab"
                active={activeTab === tab.id}
                onClick={() => handleTabChange(tab.id)}
                icon={<span className="tab-icon">{tab.icon}</span>}
                className={styles.mobileTabButton}
              >
                <span className="tab-text">{tab.name}</span>
              </BaseButton>
            ))}
            
            {/* Botón de exportar en menú móvil */}
            <BaseButton
              variant="secondary"
              onClick={handleExportCampaign}
              icon={<Download size={16} />}
              className={`${styles.mobileTabButton} ${styles.exportMobile}`}
            >
              <span className="tab-text">Exportar Campaña</span>
            </BaseButton>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <main className={styles.campaignContent}>
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
          <BaseBadge variant="count" color="blue" size="sm">
            {count}
          </BaseBadge>
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
          border-bottom: 1px solid rgba(79, 70, 229, 0.2);
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
          background: rgba(79, 70, 229, 0.15);
          border-color: rgba(79, 70, 229, 0.3);
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
          color: #4f46e5;
          border-color: rgba(79, 70, 229, 0.3);
        }

        .more-quests .quest-name {
          color: #4f46e5;
        }

        .more-quests:hover {
          background: rgba(79, 70, 229, 0.2);
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



export default CampaignDashboard