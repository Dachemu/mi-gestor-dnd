import React from 'react'
import { COLORS, GRADIENTS } from '../constants/colors'

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
    <div className={`mission-section ${colorScheme}`}>
      <div className="mission-header">
        <span className="mission-icon">{icon}</span>
        <h3 className="mission-title">{title}</h3>
        <span className="mission-count">{quests.length}</span>
      </div>
      <div className="mission-list">
        {quests.length > 0 ? (
          <>
            {quests.slice(0, 5).map((quest, index) => (
              <div 
                key={quest.id || index}
                className="mission-item"
                onClick={() => onNavigateToItem(quest, 'quests')}
              >
                <div className="mission-content">
                  <div className="mission-quest-icon">{quest.icon || '📜'}</div>
                  <div className="mission-info">
                    <h4 className="mission-quest-title">{quest.title || quest.name}</h4>
                    <p className="mission-location">{quest.location || 'Sin ubicación'}</p>
                  </div>
                </div>
                <span className={`mission-priority ${getPriorityColor(quest.priority)}`}>
                  {quest.priority || 'Media'}
                </span>
              </div>
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
    </div>
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

      {/* Category Navigation - Compact Single Line */}
      <div className="category-nav-compact">
        {Object.entries(categoryConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className="category-button-compact"
            style={{
              '--color-start': config.color,
              '--color-end': config.colorEnd
            }}
          >
            <div className="category-icon-compact">{config.icon}</div>
            <div className="category-info-compact">
              <div className="category-count-compact">
                {(campaign[key] || []).length}
              </div>
              <div className="category-name-compact">{config.name}</div>
            </div>
          </button>
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

        /* Category Navigation - Compact Single Line */
        .category-nav-compact {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2rem;
          justify-content: space-between;
        }

        .category-button-compact {
          flex: 1;
          min-width: 140px;
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid rgba(139, 92, 246, 0.2);
          background: rgba(20, 20, 35, 0.6);
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .category-button-compact::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, var(--color-start), var(--color-end));
          opacity: 0.05;
          transition: opacity 0.2s ease;
        }

        .category-button-compact:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          border-color: var(--color-start);
        }

        .category-button-compact:hover::before {
          opacity: 0.15;
        }

        .category-icon-compact {
          font-size: 1.5rem;
          position: relative;
          z-index: 1;
          flex-shrink: 0;
        }

        .category-info-compact {
          position: relative;
          z-index: 1;
          flex: 1;
        }

        .category-count-compact {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.125rem;
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
          background: rgba(15, 15, 25, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
          min-height: 300px;
          display: flex;
          flex-direction: column;
          transition: all 0.2s ease;
        }

        .mission-section:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
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

        .mission-count {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
          min-width: 24px;
          text-align: center;
        }

        .mission-section.active .mission-count {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }

        .mission-section.pending .mission-count {
          background: rgba(107, 114, 128, 0.2);
          color: #9ca3af;
        }

        .mission-section.completed .mission-count {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .mission-list {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .mission-item {
          background: rgba(31, 41, 55, 0.3);
          border-radius: 12px;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid transparent;
        }

        .mission-item:hover {
          background: rgba(31, 41, 55, 0.5);
          border-color: rgba(139, 92, 246, 0.3);
          transform: translateX(2px);
        }

        .mission-content {
          display: flex;
          align-items: center;
          flex: 1;
        }

        .mission-quest-icon {
          font-size: 1.25rem;
          margin-right: 0.75rem;
        }

        .mission-info {
          flex: 1;
        }

        .mission-quest-title {
          font-size: 1rem;
          font-weight: 600;
          color: white;
          margin: 0 0 0.25rem 0;
        }

        .mission-location {
          font-size: 0.8rem;
          color: #9ca3af;
          margin: 0;
        }

        .mission-priority {
          padding: 0.25rem 0.5rem;
          border-radius: 8px;
          font-size: 0.7rem;
          font-weight: 600;
          color: white;
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

          .category-button-compact {
            min-width: 120px;
            padding: 0.75rem;
          }

          .category-count-compact {
            font-size: 1.25rem;
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

          .category-button-compact {
            min-width: 100px;
            padding: 0.5rem;
            flex-direction: column;
            text-align: center;
            gap: 0.25rem;
          }

          .category-icon-compact {
            font-size: 1.25rem;
          }

          .category-count-compact {
            font-size: 1rem;
            margin-bottom: 0;
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

          .mission-item {
            padding: 0.75rem;
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

          .category-button-compact {
            min-width: 80px;
            padding: 0.4rem;
          }

          .category-icon-compact {
            font-size: 1rem;
          }

          .category-count-compact {
            font-size: 0.9rem;
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

          .mission-item {
            padding: 0.5rem;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .mission-content {
            width: 100%;
          }

          .mission-priority {
            align-self: flex-end;
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