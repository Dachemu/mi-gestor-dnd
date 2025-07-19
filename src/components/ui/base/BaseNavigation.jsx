import React, { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { BaseButton, BaseInput, BaseBadge } from './index'
import styles from './BaseNavigation.module.css'

/**
 * BaseNavigation Component
 * 
 * Componente unificado para todas las navegaciones de la aplicación.
 * Maneja headers, tabs, category cards, menús móviles y más.
 * 
 * @param {Object} props
 * @param {'header'|'tabs'|'category-cards'|'mobile-menu'|'dropdown-list'|'card-grid'} props.type - Tipo de navegación
 * @param {'horizontal'|'vertical'|'grid'} props.layout - Layout principal
 * @param {Array} props.sections - Secciones de la navegación (para headers)
 * @param {Array} props.items - Items de navegación (para tabs, cards, etc.)
 * @param {string} props.activeItem - Item actualmente activo
 * @param {Function} props.onItemClick - Callback cuando se hace click en un item
 * @param {Object} props.responsive - Configuración responsive
 * @param {Object} props.styling - Opciones de styling
 * @param {string} props.className - Clases CSS adicionales
 * @param {Object} props.searchConfig - Configuración de búsqueda (para headers)
 * @param {boolean} props.glassmorphism - Habilitar efecto glassmorphism
 */
const BaseNavigation = ({
  type = 'header',
  layout = 'horizontal',
  sections = [],
  items = [],
  activeItem = null,
  onItemClick = () => {},
  responsive = {},
  styling = {},
  className = '',
  searchConfig = null,
  glassmorphism = true,
  ...props
}) => {
  const [isMobile, setIsMobile] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= (responsive.breakpoint || 768)
      setIsMobile(mobile)
      if (!mobile) setIsMobileMenuOpen(false)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [responsive.breakpoint])

  // Clases base
  const navigationClasses = [
    styles.baseNavigation,
    styles[type],
    styles[layout],
    glassmorphism && styles.glassmorphism,
    isMobile && styles.mobile,
    className
  ].filter(Boolean).join(' ')

  // Renderizar según el tipo
  switch (type) {
    case 'header':
      return renderHeader()
    case 'tabs':
      return renderTabs()
    case 'category-cards':
      return renderCategoryCards()
    case 'mobile-menu':
      return renderMobileMenu()
    case 'dropdown-list':
      return renderDropdownList()
    case 'card-grid':
      return renderCardGrid()
    default:
      return renderHeader()
  }

  // === RENDERIZADORES ESPECÍFICOS ===

  function renderHeader() {
    return (
      <nav className={navigationClasses} {...props}>
        <div className={styles.headerContainer}>
          {/* Sección Izquierda */}
          {sections.find(s => s.position === 'left') && (
            <div className={`${styles.headerSection} ${styles.sectionLeft}`}>
              {renderSectionItems(sections.find(s => s.position === 'left'))}
            </div>
          )}

          {/* Sección Central (oculta en móvil por defecto) */}
          {!isMobile && sections.find(s => s.position === 'center') && (
            <div className={`${styles.headerSection} ${styles.sectionCenter}`}>
              {renderSectionItems(sections.find(s => s.position === 'center'))}
            </div>
          )}

          {/* Sección Derecha */}
          {sections.find(s => s.position === 'right') && (
            <div className={`${styles.headerSection} ${styles.sectionRight}`}>
              {renderSectionItems(sections.find(s => s.position === 'right'))}
              
              {/* Toggle de menú móvil */}
              {isMobile && responsive.showMobileToggle !== false && (
                <BaseButton
                  variant="compact"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  icon={isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                  className={styles.mobileToggle}
                />
              )}
            </div>
          )}
        </div>

        {/* Menú móvil desplegable */}
        {isMobile && isMobileMenuOpen && responsive.mobileItems && (
          <div className={styles.mobileDropdown}>
            {responsive.mobileItems.map((item, index) => (
              <BaseButton
                key={item.id || index}
                variant="tab"
                active={activeItem === item.id}
                onClick={() => {
                  onItemClick(item)
                  setIsMobileMenuOpen(false)
                }}
                className={styles.mobileTabButton}
              >
                {item.icon && <span className={styles.itemIcon}>{item.icon}</span>}
                <span className={styles.itemText}>{item.label || item.name}</span>
                {item.badge && (
                  <BaseBadge variant="count" color="blue" size="sm">
                    {item.badge}
                  </BaseBadge>
                )}
              </BaseButton>
            ))}
          </div>
        )}
      </nav>
    )
  }

  function renderTabs() {
    return (
      <nav className={navigationClasses} {...props}>
        <div className={styles.tabsContainer}>
          {items.map((item, index) => (
            <BaseButton
              key={item.id || index}
              variant="tab"
              active={activeItem === item.id}
              onClick={() => onItemClick(item)}
              className={styles.tabButton}
            >
              {item.icon && <span className={styles.itemIcon}>{item.icon}</span>}
              <span className={styles.itemText}>{item.label || item.name}</span>
              {item.badge && (
                <BaseBadge variant="count" color="blue" size="sm">
                  {item.badge}
                </BaseBadge>
              )}
            </BaseButton>
          ))}
        </div>
      </nav>
    )
  }

  function renderCategoryCards() {
    return (
      <nav className={navigationClasses} {...props}>
        <div className={styles.categoryCardsContainer}>
          {items.map((item, index) => (
            <div
              key={item.id || index}
              className={styles.categoryCard}
              onClick={() => onItemClick(item)}
              style={{
                '--gradient': item.gradient || 'linear-gradient(135deg, #8b5cf6, #ec4899)'
              }}
            >
              {item.icon && (
                <div className={styles.categoryIcon}>{item.icon}</div>
              )}
              <div className={styles.categoryContent}>
                <div className={styles.categoryCount}>
                  {item.count || 0}
                </div>
                <div className={styles.categoryName}>
                  {item.label || item.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </nav>
    )
  }

  function renderMobileMenu() {
    return (
      <div className={navigationClasses} {...props}>
        {items.map((item, index) => (
          <BaseButton
            key={item.id || index}
            variant="tab"
            active={activeItem === item.id}
            onClick={() => onItemClick(item)}
            className={styles.mobileMenuItem}
          >
            {item.icon && <span className={styles.itemIcon}>{item.icon}</span>}
            <span className={styles.itemText}>{item.label || item.name}</span>
          </BaseButton>
        ))}
      </div>
    )
  }

  function renderDropdownList() {
    return (
      <nav className={navigationClasses} {...props}>
        <div className={styles.dropdownContainer}>
          {items.map((item, index) => (
            <div
              key={item.id || index}
              className={styles.dropdownItem}
              onClick={() => onItemClick(item)}
            >
              {item.icon && (
                <span className={styles.itemIcon}>{item.icon}</span>
              )}
              <div className={styles.itemContent}>
                <div className={styles.itemTitle}>{item.label || item.name}</div>
                {item.subtitle && (
                  <div className={styles.itemSubtitle}>{item.subtitle}</div>
                )}
              </div>
              {item.badge && (
                <BaseBadge variant="type" color="blue" size="sm">
                  {item.badge}
                </BaseBadge>
              )}
            </div>
          ))}
        </div>
      </nav>
    )
  }

  function renderCardGrid() {
    return (
      <nav className={navigationClasses} {...props}>
        <div className={styles.cardGridContainer}>
          {items.map((item, index) => (
            <div
              key={item.id || index}
              className={styles.gridCard}
              onClick={() => onItemClick(item)}
            >
              {item.icon && (
                <div className={styles.cardIcon}>{item.icon}</div>
              )}
              <div className={styles.cardContent}>
                <div className={styles.cardTitle}>{item.label || item.name}</div>
                {item.subtitle && (
                  <div className={styles.cardSubtitle}>{item.subtitle}</div>
                )}
              </div>
              {item.badge && (
                <BaseBadge variant="count" color="blue" size="sm">
                  {item.badge}
                </BaseBadge>
              )}
            </div>
          ))}
        </div>
      </nav>
    )
  }

  // Renderizar items de una sección (para headers)
  function renderSectionItems(section) {
    if (!section || !section.items) return null

    return section.items.map((item, index) => {
      if (item.type === 'button') {
        return (
          <BaseButton
            key={item.id || index}
            variant={item.variant || 'secondary'}
            onClick={item.onClick || (() => onItemClick(item))}
            icon={item.icon}
            active={item.active}
            className={item.className}
          >
            {item.label || item.children}
          </BaseButton>
        )
      }

      if (item.type === 'search') {
        return (
          <BaseInput
            key={item.id || index}
            variant="search"
            placeholder={item.placeholder || 'Buscar...'}
            value={item.value}
            onChange={item.onChange}
            className={item.className}
          />
        )
      }

      if (item.type === 'custom') {
        return item.component
      }

      // Default: renderizar como texto
      return (
        <span key={item.id || index} className={styles.textItem}>
          {item.label || item.children}
        </span>
      )
    })
  }
}

export default BaseNavigation