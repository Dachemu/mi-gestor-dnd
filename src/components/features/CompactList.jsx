import React from 'react'
import { Eye, Edit, Trash2, Link2 } from 'lucide-react'
import { BaseCard, BaseBadge } from '../ui/base'

/**
 * Componente para mostrar listas de elementos en formato compacto tipo cards
 * Elimina el scroll excesivo y mejora la experiencia visual
 */

// Helper para crear botones con estilo consistente
const createActionButton = (color, hoverColor, shadowColor) => ({
  background: `linear-gradient(135deg, var(--accent-${color}), ${hoverColor})`,
  border: 'none',
  color: 'white',
  padding: '0.75rem',
  borderRadius: '10px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  flex: 1,
  boxShadow: `0 4px 12px rgba(${shadowColor}, 0.3)`,
  position: 'relative',
  overflow: 'hidden'
})

function CompactList({ 
  items = [], 
  itemType, 
  onSelectItem, 
  getConnectionCount,
  emptyMessage = "No hay elementos aún",
  emptyIcon = "📝"
}) {
  
  if (items.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        color: 'var(--text-muted)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
          {emptyIcon}
        </div>
        <p style={{ fontSize: '1.1rem', margin: 0 }}>
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <div className="responsive-grid">
      {items.map(item => {
        const connectionCount = getConnectionCount ? getConnectionCount(item) : 0
        
        return (
          <BaseCard
            key={item.id}
            variant="compact"
            clickable
            onClick={() => onSelectItem(item)}
            hoverEffect="lift"
            icon={item.icon || '📝'}
            badge={connectionCount > 0 ? connectionCount : null}
            gradient="linear-gradient(90deg, #8b5cf6, #3b82f6, #10b981, #f59e0b, #ec4899)"
            className="compact-card"
          >
            <BaseCard.Title style={{ textAlign: 'center' }}>
              {item.name || item.title}
            </BaseCard.Title>

            {/* Información secundaria usando BaseBadge */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              {item.type && (
                <BaseBadge variant="type" color="blue" size="sm">
                  {item.type}
                </BaseBadge>
              )}
              {item.class && (
                <BaseBadge variant="category" color="green" size="sm">
                  {item.class}
                </BaseBadge>
              )}
              {item.role && (
                <BaseBadge variant="category" color="purple" size="sm">
                  {item.role}
                </BaseBadge>
              )}
              {item.status && (
                <BaseBadge 
                  variant="status" 
                  color={
                    item.status === 'Completada' ? 'green' : 
                    item.status === 'En progreso' ? 'orange' : 
                    'gray'
                  }
                  size="sm"
                >
                  {item.status}
                </BaseBadge>
              )}
            </div>

            {/* Descripción usando BaseCard.Description */}
            {(item.description || item.content) && (
              <BaseCard.Description>
                {item.description || item.content}
              </BaseCard.Description>
            )}

            {/* Indicador de conexiones */}
            {connectionCount > 0 && (
              <div className="connection-indicator">
                <Link2 size={14} />
                <span>{connectionCount} conexión{connectionCount !== 1 ? 'es' : ''}</span>
              </div>
            )}

            {/* Indicador de click */}
            <BaseCard.Footer>
              <span style={{ margin: '0 auto', opacity: 0.7 }}>Clic para abrir</span>
            </BaseCard.Footer>
          </BaseCard>
        )
      })}

      <style jsx>{`
        .responsive-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
          gap: clamp(1rem, 2.5vw, 2rem);
          padding: clamp(0.5rem, 1.5vw, 1rem) 0;
          width: 100%;
          max-width: 100%;
          overflow: hidden;
          justify-content: center;
          align-items: start;
        }

        .compact-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(139, 92, 246, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.2);
          border-color: rgba(139, 92, 246, 0.8);
        }
        
        .action-button:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }
        
        .compact-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.03), rgba(59, 130, 246, 0.03));
          opacity: 0;
          transition: opacity 0.3s ease;
          border-radius: 16px;
        }
        
        .compact-card:hover::before {
          opacity: 1;
        }
        
        
        /* Connection indicator */
        .connection-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #3b82f6;
          font-size: 0.8rem;
          margin-bottom: 1rem;
        }
        
        @media (min-width: 1600px) {
          .responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 2.5rem;
          }
        }

        @media (max-width: 1400px) {
          .responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(min(100%, 270px), 1fr));
            gap: clamp(1rem, 2vw, 1.75rem);
          }
        }

        @media (max-width: 1200px) {
          .responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
            gap: clamp(0.875rem, 1.75vw, 1.5rem);
          }
        }

        @media (max-width: 1024px) {
          .responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr));
            gap: clamp(0.75rem, 1.5vw, 1.25rem);
          }
          
          .compact-card {
            padding: 1.5rem !important;
          }
        }
        
        @media (max-width: 900px) {
          .responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr));
            gap: clamp(0.75rem, 1.5vw, 1rem);
          }
          
          .compact-card {
            padding: 1.5rem !important;
          }
        }

        @media (max-width: 768px) {
          .responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(min(100%, 200px), 1fr));
            gap: clamp(0.625rem, 1.25vw, 0.875rem);
          }
          
          .compact-card {
            padding: 1.25rem !important;
          }
          
          .action-button {
            padding: 0.625rem !important;
          }
        }
        
        @media (max-width: 640px) {
          .responsive-grid {
            grid-template-columns: repeat(auto-fill, minmax(min(100%, 180px), 1fr));
            gap: 0.75rem;
            padding: 0.5rem 0;
          }
          
          .compact-card {
            padding: 1rem !important;
            margin: 0 !important;
          }
          
          .compact-card h3 {
            font-size: 1.1rem !important;
          }
        }
        
        @media (max-width: 480px) {
          .responsive-grid {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
          
          .compact-card {
            padding: 0.875rem !important;
          }
          
          .compact-card h3 {
            font-size: 1rem !important;
          }
          
          .action-button {
            padding: 0.5rem !important;
          }
        }
        
        @media (max-width: 360px) {
          .compact-card {
            padding: 0.75rem !important;
          }
          
          .compact-card h3 {
            font-size: 0.95rem !important;
          }
        }
      `}</style>
    </div>
  )
}

export default React.memo(CompactList)