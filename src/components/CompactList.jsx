import React from 'react'
import { Eye, Edit, Trash2, Link2 } from 'lucide-react'

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
          <div
            key={item.id}
            style={{
              background: 'linear-gradient(135deg, rgba(15, 15, 25, 0.95) 0%, rgba(26, 26, 46, 0.9) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              borderRadius: '20px',
              padding: '2rem',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)'
            }}
            className="compact-card"
            onClick={() => onSelectItem(item)}
          >
            {/* Gradiente decorativo superior */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #8b5cf6, #3b82f6, #10b981, #f59e0b, #ec4899)',
              borderRadius: '20px 20px 0 0'
            }} />
            
            {/* Efecto de brillo sutil */}
            <div style={{
              position: 'absolute',
              top: '3px',
              left: '1rem',
              right: '1rem',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
              borderRadius: '1px'
            }} />
            
            {/* Icono del elemento */}
            <div style={{
              fontSize: '3rem',
              marginBottom: '1.5rem',
              textAlign: 'center',
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5))',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2), transparent)',
                borderRadius: '50%',
                filter: 'blur(10px)',
                transform: 'scale(1.5)'
              }} />
              <span style={{ position: 'relative', zIndex: 1 }}>
                {item.icon || '📝'}
              </span>
            </div>
            
            {/* Nombre/Título */}
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: '0 0 1rem 0',
              lineHeight: '1.3',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textAlign: 'center'
            }}>
              {item.name || item.title}
            </h3>

            {/* Información secundaria */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              {/* Tipo específico por item */}
              {item.type && (
                <span style={{
                  background: 'linear-gradient(135deg, var(--accent-blue), #2563eb)',
                  color: 'white',
                  padding: '0.375rem 0.875rem',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                }}>
                  {item.type}
                </span>
              )}
              
              {item.class && (
                <span style={{
                  background: 'linear-gradient(135deg, var(--accent-green), #059669)',
                  color: 'white',
                  padding: '0.375rem 0.875rem',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                }}>
                  {item.class}
                </span>
              )}
              
              {item.role && (
                <span style={{
                  background: 'linear-gradient(135deg, var(--accent-purple), #7c3aed)',
                  color: 'white',
                  padding: '0.375rem 0.875rem',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)'
                }}>
                  {item.role}
                </span>
              )}
              
              {item.status && (
                <span style={{
                  background: item.status === 'Completada' ? 'linear-gradient(135deg, var(--accent-green), #059669)' : 
                           item.status === 'En progreso' ? 'linear-gradient(135deg, var(--accent-orange), #d97706)' : 
                           'linear-gradient(135deg, var(--accent-gray), #4b5563)',
                  color: 'white',
                  padding: '0.375rem 0.875rem',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  boxShadow: item.status === 'Completada' ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 
                           item.status === 'En progreso' ? '0 2px 8px rgba(245, 158, 11, 0.3)' : 
                           '0 2px 8px rgba(107, 114, 128, 0.3)'
                }}>
                  {item.status}
                </span>
              )}
            </div>

            {/* Descripción/Vista previa */}
            {(item.description || item.content) && (
              <p style={{
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                lineHeight: '1.4',
                margin: '0 0 1rem 0',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {item.description || item.content}
              </p>
            )}

            {/* Indicador de conexiones */}
            {connectionCount > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--accent-blue)',
                fontSize: '0.8rem',
                marginBottom: '1rem'
              }}>
                <Link2 size={14} />
                <span>{connectionCount} conexión{connectionCount !== 1 ? 'es' : ''}</span>
              </div>
            )}

            {/* Indicador de click */}
            <div style={{
              marginTop: 'auto',
              paddingTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              opacity: 0.7
            }}>
              Clic para abrir
            </div>
          </div>
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