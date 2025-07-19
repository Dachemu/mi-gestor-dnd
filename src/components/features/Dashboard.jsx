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
  const MissionSection = ({ title, icon, quests, emptyMessage, colorScheme, onNavigateToItem, getPriorityColor }) => (
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
            {quests.slice(0, 5).map((quest, index) => (
              <BaseCard
                key={quest.id || index}
                variant="compact"
                clickable
                onClick={() => onNavigateToItem(quest, 'quests')}
                hoverEffect="lift"
                icon={quest.icon || '📜'}
                className="mission-item-card"
              >
                <BaseCard.Title className="mission-quest-title">
                  {quest.title || quest.name}
                </BaseCard.Title>
                <BaseCard.Description className="mission-location">
                  {quest.location || 'Sin ubicación'}
                </BaseCard.Description>
                <BaseBadge 
                  variant="priority" 
                  color={
                    quest.priority === 'Crítica' ? 'red' :
                    quest.priority === 'Alta' ? 'orange' :
                    quest.priority === 'Media' ? 'blue' :
                    'green'
                  }
                  size="sm"
                >
                  {quest.priority || 'Media'}
                </BaseBadge>
              </BaseCard>
            ))}
            {quests.length > 5 && (
              <div className="mission-more">
                <p>+ {quests.length - 5} misiones más...</p>
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
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          animation: fadeIn 0.5s ease-out;
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .campaign-title {
          font-size: 3rem;
          font-weight: 700;
          background: linear-gradient(135deg, #ffffff 0%, #a78bfa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1rem;
        }

        .campaign-description {
          color: #9ca3af;
          font-size: 1.125rem;
          margin: 0;
        }

        /* Category Navigation - Using BaseCard */
        .category-nav-compact {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2rem;
          justify-content: space-between;
        }

        .category-name-compact {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
          font-weight: 500;
        }

        /* Missions Grid - Three Rectangular Sections */
        .missions-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .mission-section {
          min-height: 300px;
          display: flex;
          flex-direction: column;
        }

        .mission-section.active {
          border-color: rgba(245, 158, 11, 0.3);
        }

        .mission-section.pending {
          border-color: rgba(107, 114, 128, 0.3);
        }

        .mission-section.completed {
          border-color: rgba(16, 185, 129, 0.3);
        }

        .mission-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(139, 92, 246, 0.2);
        }

        .mission-icon {
          font-size: 1.5rem;
          margin-right: 0.75rem;
        }

        .mission-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          margin: 0;
          flex: 1;
        }


        .mission-list {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .mission-item-card {
          margin-bottom: 0.75rem;
          position: relative;
        }

        .mission-quest-title {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 0.25rem 0;
        }

        .mission-location {
          font-size: 0.8rem;
          margin: 0 0 0.5rem 0;
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
          padding: 0.75rem;
          background: rgba(139, 92, 246, 0.1);
          border-radius: 8px;
          margin-top: 0.5rem;
        }

        .mission-more p {
          margin: 0;
          font-size: 0.8rem;
          color: #8b5cf6;
          font-weight: 500;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .missions-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .mission-section {
            min-height: 250px;
          }

          .category-nav-compact {
            gap: 0.75rem;
          }

          .category-name-compact {
            font-size: 0.7rem;
          }
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 1rem;
          }

          .campaign-title {
            font-size: 2rem;
          }

          .category-nav-compact {
            gap: 0.5rem;
          }

          .category-name-compact {
            font-size: 0.65rem;
          }

          .missions-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .mission-section {
            min-height: 200px;
            padding: 1rem;
          }

          .mission-header {
            margin-bottom: 1rem;
            padding-bottom: 0.75rem;
          }

          .mission-title {
            font-size: 1.1rem;
          }

          .mission-quest-title {
            font-size: 0.9rem;
          }

          .mission-location {
            font-size: 0.75rem;
          }
        }

        @media (max-width: 480px) {
          .dashboard-container {
            padding: 0.75rem;
          }

          .campaign-title {
            font-size: 1.5rem;
          }

          .category-nav-compact {
            gap: 0.25rem;
          }

          .category-name-compact {
            font-size: 0.6rem;
          }

          .mission-section {
            min-height: 180px;
            padding: 0.75rem;
          }

          .mission-header {
            margin-bottom: 0.75rem;
            padding-bottom: 0.5rem;
          }

          .mission-title {
            font-size: 1rem;
          }

          .mission-item-card {
            margin-bottom: 0.5rem;
          }

          .mission-quest-title {
            font-size: 0.85rem;
          }

          .mission-location {
            font-size: 0.7rem;
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