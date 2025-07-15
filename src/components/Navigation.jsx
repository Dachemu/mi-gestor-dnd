import React, { useState, useEffect } from 'react'
import { Search, ArrowLeft, Menu, X } from 'lucide-react'

// Este componente debe ser importado en CampaignManager.jsx como:
// import Navigation from './components/Navigation'

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

function Navigation({ 
  campaignName, 
  activeTab, 
  onTabChange, 
  onBackToSelector,
  searchTerm,
  onSearchChange,
  onSearchFocus,
  showSearchDropdown
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Cerrar menú móvil al cambiar de pestaña
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [activeTab])

  return (
    <>
      <nav className="navigation-bar">
        <div className="navigation-container">
          {/* Sección izquierda - Logo y título */}
          <div className="nav-section nav-left">
            <button
              onClick={onBackToSelector}
              className="btn-back"
              aria-label="Volver a campañas"
            >
              <ArrowLeft size={16} />
              {!isMobile && <span>Campañas</span>}
            </button>
            
            <h1 className="campaign-title">
              {campaignName}
            </h1>
          </div>

          {/* Sección central - Pestañas (desktop) */}
          {!isMobile && (
            <div className="nav-section nav-center">
              <div className="tabs-container">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                    aria-current={activeTab === tab.id ? 'page' : undefined}
                  >
                    <span className="tab-icon">{tab.icon}</span>
                    <span className="tab-name">{tab.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sección derecha - Búsqueda y menú móvil */}
          <div className="nav-section nav-right">
            <div className="search-wrapper">
              <div className="search-field">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={onSearchFocus}
                  className="search-input-nav"
                  aria-label="Buscar en la campaña"
                />
                <Search size={16} className="search-icon-nav" />
              </div>
            </div>

            {/* Botón menú móvil */}
            {isMobile && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="mobile-menu-btn"
                aria-label="Menú de navegación"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Menú móvil desplegable */}
      {isMobile && isMobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`mobile-tab ${activeTab === tab.id ? 'active' : ''}`}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-name">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Estilos del componente */}
      <style jsx>{`
        .navigation-bar {
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

        .navigation-container {
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
          justify-content: center;
        }

        .nav-right {
          flex-shrink: 0;
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

        /* Título de campaña */
        .campaign-title {
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

        /* Contenedor de pestañas */
        .tabs-container {
          display: flex;
          gap: 0.5rem;
          background: rgba(31, 41, 55, 0.6);
          border-radius: 12px;
          padding: 0.5rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(139, 92, 246, 0.2);
        }

        /* Pestañas */
        .tab {
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

        .tab:hover {
          background: rgba(139, 92, 246, 0.1);
          color: #e5e7eb;
        }

        .tab.active {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
        }

        /* Búsqueda */
        .search-wrapper {
          position: relative;
        }

        .search-field {
          position: relative;
        }

        .search-input-nav {
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

        .search-input-nav:focus {
          background: rgba(31, 41, 55, 0.95);
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        .search-input-nav::placeholder {
          color: #6b7280;
        }

        .search-icon-nav {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          pointer-events: none;
        }

        /* Botón menú móvil */
        .mobile-menu-btn {
          display: none;
          background: rgba(139, 92, 246, 0.2);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 8px;
          color: #a78bfa;
          padding: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mobile-menu-btn:hover {
          background: rgba(139, 92, 246, 0.3);
        }

        /* Menú móvil */
        .mobile-menu {
          position: fixed;
          top: 60px;
          left: 0;
          right: 0;
          background: rgba(15, 15, 25, 0.98);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(139, 92, 246, 0.2);
          z-index: 99;
          animation: slideDown 0.3s ease-out;
        }

        .mobile-tabs {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .mobile-tab {
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

        .mobile-tab:hover {
          background: rgba(139, 92, 246, 0.1);
          color: #e5e7eb;
        }

        .mobile-tab.active {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
          font-weight: 600;
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
          .search-input-nav {
            width: 220px;
          }
        }

        @media (max-width: 1024px) {
          .navigation-container {
            padding: 0 1rem;
            gap: 1rem;
          }

          .campaign-title {
            font-size: 1.2rem;
            max-width: 200px;
          }

          .tab {
            padding: 0.6rem 0.8rem;
            font-size: 0.85rem;
          }

          .search-input-nav {
            width: 180px;
            font-size: 0.85rem;
          }
        }

        @media (max-width: 768px) {
          .navigation-bar {
            padding: 0.75rem 0;
          }

          .mobile-menu-btn {
            display: flex;
          }

          .campaign-title {
            font-size: 1.1rem;
            max-width: 150px;
          }

          .btn-back {
            padding: 0.4rem 0.6rem;
          }

          .search-input-nav {
            width: 140px;
            padding: 0.5rem 0.75rem 0.5rem 2rem;
            font-size: 0.8rem;
          }

          .search-icon-nav {
            width: 14px;
            height: 14px;
          }
        }

        @media (max-width: 480px) {
          .navigation-container {
            padding: 0 0.75rem;
            gap: 0.5rem;
          }

          .campaign-title {
            font-size: 1rem;
            max-width: 100px;
          }

          .search-input-nav {
            width: 100px;
          }
        }
      `}</style>
    </>
  )
}

export default Navigation