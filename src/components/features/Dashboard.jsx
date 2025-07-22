import React from 'react'
import { COLORS, GRADIENTS } from '../../constants/colors'
import { BaseCard, BaseButton, BaseBadge } from '../ui/base'

/**
 * Dashboard Component - Réplica exacta del archivo de referencia
 * Incluye navegación por categorías, estadísticas y misiones activas
 */
const Dashboard = React.memo(function Dashboard({ campaign, onTabChange, onNavigateToItem }) {
  // Función para obtener el color de prioridad
  const getPriorityColor = (priority) => {
    const colors = {
      'Crítica': 'bg-red-500',
      'Alta': 'bg-orange-500',
      'Media': 'bg-yellow-500',
      'Baja': 'bg-green-500'
    }
    return colors[priority] || 'bg-gray-500'
  }

  // Configuración de categorías con colores específicos
  const categoryConfig = {
    locations: { name: 'Lugares', icon: '📍', color: '#3b82f6', colorEnd: '#2563eb' },
    players: { name: 'Jugadores', icon: '👥', color: '#10b981', colorEnd: '#059669' },
    npcs: { name: 'NPCs', icon: '🧙', color: '#8b5cf6', colorEnd: '#7c3aed' },
    objects: { name: 'Objetos', icon: '📦', color: '#06b6d4', colorEnd: '#0891b2' },
    quests: { name: 'Misiones', icon: '📜', color: '#f97316', colorEnd: '#ea580c' },
    notes: { name: 'Notas', icon: '📝', color: '#ec4899', colorEnd: '#db2777' }
  }

  // Estadísticas de misiones
  const stats = {
    activeQuests: (campaign.quests || []).filter(q => q.status === 'En progreso').length,
    completedQuests: (campaign.quests || []).filter(q => q.status === 'Completada').length,
    pendingQuests: (campaign.quests || []).filter(q => q.status === 'Pendiente').length
  }

  // Componente reutilizable para las secciones de misiones
  const MissionSection = ({ title, icon, quests, emptyMessage, colorScheme, onNavigateToItem, getPriorityColor }) => {
    const [expanded, setExpanded] = React.useState(false)
    const maxItems = 5
    const displayQuests = expanded ? quests : quests.slice(0, maxItems)
    const hasMore = quests.length > maxItems
    
    return (
    <BaseCard variant="mission" className={`mission-section ${colorScheme}`}>
      <div className="mission-header">
        <span className="mission-icon">{icon}</span>
        <BaseCard.Title className="mission-title">{title}</BaseCard.Title>
        <BaseBadge 
          variant="count" 
          color={
            colorScheme === 'active' ? 'orange' :
            colorScheme === 'completed' ? 'green' :
            'gray'
          }
          size="sm"
        >
          {quests.length}
        </BaseBadge>
      </div>
      <div className="mission-list">
        {quests.length > 0 ? (
          <>
            {displayQuests.map((quest, index) => (
              <div
                key={quest.id || index}
                className="mission-item-card"
                onClick={() => onNavigateToItem(quest, 'quests')}
              >
                <span className="mission-item-icon">{quest.icon || '📜'}</span>
                <span className="mission-item-title">{quest.title || quest.name}</span>
                <BaseBadge 
                  variant="priority" 
                  color={
                    quest.priority === 'Crítica' ? 'red' :
                    quest.priority === 'Alta' ? 'orange' :
                    quest.priority === 'Media' ? 'blue' :
                    'green'
                  }
                  size="xs"
                  className="mission-item-priority"
                >
                  {quest.priority === 'Crítica' ? 'CRIT' :
                   quest.priority === 'Alta' ? 'ALTA' :
                   quest.priority === 'Media' ? 'MED' :
                   'BAJA'}
                </BaseBadge>
              </div>
            ))}
            {hasMore && !expanded && (
              <div className="mission-more" onClick={() => setExpanded(true)}>
                <p>+ {quests.length - maxItems} misiones más...</p>
              </div>
            )}
            {expanded && hasMore && (
              <div className="mission-more" onClick={() => setExpanded(false)}>
                <p>▲ Mostrar menos</p>
              </div>
            )}
          </>
        ) : (
          <div className="mission-empty">
            <p>{emptyMessage}</p>
          </div>
        )}
      </div>
    </BaseCard>
    )
  }

  return (
    <div className="dashboard-container">
      {/* Header del Dashboard */}
      <div className="dashboard-header">
        <h1 className="campaign-title">
          {campaign.name}
        </h1>
        <p className="campaign-description">
          {campaign.description || 'Tu mundo de aventuras te espera'}
        </p>
      </div>

      {/* Category Navigation - Using BaseCard */}
      <div className="category-nav-compact">
        {Object.entries(categoryConfig).map(([key, config]) => (
          <BaseCard
            key={key}
            variant="category"
            clickable
            onClick={() => onTabChange(key)}
            hoverEffect="glow"
            icon={config.icon}
            gradient={`linear-gradient(135deg, ${config.color}, ${config.colorEnd})`}
            style={{
              '--color-start': config.color,
              '--color-end': config.colorEnd
            }}
          >
            <BaseCard.Title>{(campaign[key] || []).length}</BaseCard.Title>
            <div className="category-name-compact">{config.name}</div>
          </BaseCard>
        ))}
      </div>

      {/* Mission Sections - Three Rectangular Sections */}
      <div className="missions-grid">
        <MissionSection
          title="Misiones Activas"
          icon="🎯"
          quests={(campaign.quests || []).filter(q => q.status === 'En progreso')}
          emptyMessage="No hay misiones activas"
          colorScheme="active"
          onNavigateToItem={onNavigateToItem}
          getPriorityColor={getPriorityColor}
        />
        <MissionSection
          title="Misiones Pendientes"
          icon="⏳"
          quests={(campaign.quests || []).filter(q => q.status === 'Pendiente')}
          emptyMessage="No hay misiones pendientes"
          colorScheme="pending"
          onNavigateToItem={onNavigateToItem}
          getPriorityColor={getPriorityColor}
        />
        <MissionSection
          title="Misiones Completadas"
          icon="⭐"
          quests={(campaign.quests || []).filter(q => q.status === 'Completada')}
          emptyMessage="No hay misiones completadas"
          colorScheme="completed"
          onNavigateToItem={onNavigateToItem}
          getPriorityColor={getPriorityColor}
        />
      </div>

      {/* Estilos del Dashboard */}
      <style jsx>{`
        .dashboard-container {
          padding: 1rem;
          max-width: 1400px;
          margin: 0 auto;
          animation: fadeIn 0.5s ease-out;
        }

        .dashboard-header {
          text-align: left;
          margin-bottom: 1.5rem;
          padding: 0 0.5rem;
        }

        .campaign-title {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #ffffff 0%, #a78bfa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .campaign-description {
          color: #9ca3af;
          font-size: 1rem;
          margin: 0;
        }

        /* Category Navigation - More Compact */
        .category-nav-compact {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 0.5rem;
          margin-bottom: 1.25rem;
          padding: 0 0.5rem;
        }

        .category-nav-compact :global(.base-card) {
          padding: 0.4rem 0.25rem !important;
          min-height: 48px !important;
        }

        .category-nav-compact :global(.base-card-title) {
          font-size: 0.95rem !important;
          margin-bottom: 0.15rem !important;
        }

        .category-name-compact {
          font-size: 0.6rem;
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
          font-weight: 500;
        }

        /* Missions Grid - Three Equal Rectangular Sections */
        .missions-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
          margin-bottom: 1rem;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(139, 92, 246, 0.2);
        }

        .mission-section {
          min-height: 350px;
          max-height: 350px;
          display: flex;
          flex-direction: column;
          border-right: 1px solid rgba(139, 92, 246, 0.2);
          background: rgba(31, 41, 55, 0.3);
          padding: 1rem;
        }

        .mission-section:last-child {
          border-right: none;
        }

        .mission-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(139, 92, 246, 0.15);
          flex-shrink: 0;
        }

        .mission-icon {
          font-size: 1.2rem;
          margin-right: 0.5rem;
        }

        .mission-title {
          font-size: 1rem;
          font-weight: 600;
          color: white;
          margin: 0;
          flex: 1;
        }

        .mission-list {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          overflow-y: auto;
          max-height: 250px;
          padding-right: 0.25rem;
          /* Mejor scrollbar */
          scrollbar-width: thin;
          scrollbar-color: rgba(139, 92, 246, 0.3) transparent;
        }

        .mission-list::-webkit-scrollbar {
          width: 4px;
        }

        .mission-list::-webkit-scrollbar-track {
          background: transparent;
        }

        .mission-list::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 2px;
        }

        .mission-list::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }

        .mission-item-card {
          margin-bottom: 0;
          padding: 0.4rem 0.6rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(139, 92, 246, 0.1);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          flex-shrink: 0;
          height: 36px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .mission-item-card:hover {
          background: rgba(139, 92, 246, 0.1);
          border-color: rgba(139, 92, 246, 0.3);
          transform: translateY(-1px);
        }

        .mission-item-icon {
          font-size: 0.9rem;
          flex-shrink: 0;
        }

        .mission-item-title {
          flex: 1;
          font-size: 0.8rem;
          font-weight: 600;
          color: #e5e7eb;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1;
        }

        .mission-item-priority {
          flex-shrink: 0;
          font-size: 0.6rem !important;
          padding: 0.15rem 0.3rem !important;
          border-radius: 3px !important;
          font-weight: 600 !important;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }


        .mission-empty {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          font-style: italic;
          padding: 2rem;
        }

        .mission-empty p {
          margin: 0;
          font-size: 0.9rem;
        }

        .mission-more {
          text-align: center;
          padding: 0.5rem;
          background: rgba(139, 92, 246, 0.1);
          border-radius: 6px;
          margin-top: 0.25rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mission-more:hover {
          background: rgba(139, 92, 246, 0.2);
        }

        .mission-more p {
          margin: 0;
          font-size: 0.75rem;
          color: #8b5cf6;
          font-weight: 500;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .missions-grid {
            grid-template-columns: 1fr;
            gap: 1px;
          }

          .mission-section {
            min-height: 280px;
            max-height: 280px;
            border-right: none;
            border-bottom: 1px solid rgba(139, 92, 246, 0.2);
          }

          .mission-section:last-child {
            border-bottom: none;
          }

          .category-nav-compact {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.4rem;
          }

          .category-nav-compact :global(.base-card) {
            padding: 0.5rem 0.3rem !important;
            min-height: 55px !important;
          }

          .category-name-compact {
            font-size: 0.6rem;
          }

          .mission-list {
            max-height: 180px;
          }

          .mission-item-card {
            height: 34px;
            padding: 0.35rem 0.5rem;
            gap: 0.4rem;
          }

          .mission-item-icon {
            font-size: 0.85rem;
          }

          .mission-item-title {
            font-size: 0.75rem;
          }
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 0.75rem;
          }

          .campaign-title {
            font-size: 1.5rem;
          }

          .dashboard-header {
            margin-bottom: 1rem;
            padding: 0 0.25rem;
          }

          .category-nav-compact {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.4rem;
            margin-bottom: 1rem;
          }

          .category-nav-compact :global(.base-card) {
            padding: 0.4rem 0.25rem !important;
            min-height: 50px !important;
          }

          .category-name-compact {
            font-size: 0.55rem;
          }

          .mission-section {
            min-height: 250px;
            max-height: 250px;
            padding: 0.75rem;
          }

          .mission-header {
            margin-bottom: 0.75rem;
            padding-bottom: 0.5rem;
          }

          .mission-title {
            font-size: 0.9rem;
          }

          .mission-list {
            max-height: 160px;
            gap: 0.3rem;
          }

          .mission-item-card {
            height: 32px;
            padding: 0.3rem 0.45rem;
            gap: 0.35rem;
          }

          .mission-item-icon {
            font-size: 0.8rem;
          }

          .mission-item-title {
            font-size: 0.7rem;
          }

          .mission-item-priority {
            font-size: 0.55rem !important;
            padding: 0.1rem 0.25rem !important;
          }
        }

        @media (max-width: 480px) {
          .dashboard-container {
            padding: 0.5rem;
          }

          .campaign-title {
            font-size: 1.3rem;
          }

          .category-nav-compact {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.25rem;
            margin-bottom: 0.75rem;
          }

          .category-nav-compact :global(.base-card) {
            padding: 0.35rem 0.2rem !important;
            min-height: 45px !important;
          }

          .category-name-compact {
            font-size: 0.5rem;
          }

          .mission-section {
            min-height: 220px;
            max-height: 220px;
            padding: 0.5rem;
          }

          .mission-header {
            margin-bottom: 0.5rem;
            padding-bottom: 0.5rem;
          }

          .mission-title {
            font-size: 0.85rem;
          }

          .mission-list {
            max-height: 140px;
            gap: 0.25rem;
          }

          .mission-item-card {
            height: 30px;
            padding: 0.25rem 0.4rem;
            gap: 0.3rem;
          }

          .mission-item-icon {
            font-size: 0.75rem;
          }

          .mission-item-title {
            font-size: 0.65rem;
          }

          .mission-item-priority {
            font-size: 0.5rem !important;
            padding: 0.08rem 0.2rem !important;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
})

export default Dashboard