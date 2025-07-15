import React from 'react'
import { Eye, Edit, Trash2, Link2 } from 'lucide-react'

/**
 * Componente para mostrar listas de elementos en formato compacto tipo cards
 * Elimina el scroll excesivo y mejora la experiencia visual
 */
function CompactList({ 
  items = [], 
  itemType, 
  onSelectItem, 
  onEditItem, 
  onDeleteItem, 
  onOpenConnections,
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
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '1.5rem',
      padding: '1rem 0'
    }}>
      {items.map(item => {
        const connectionCount = getConnectionCount ? getConnectionCount(item) : 0
        
        return (
          <div
            key={item.id}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '1.5rem',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
            className="compact-card"
            onClick={() => onSelectItem(item)}
          >
            {/* Nombre/Título */}
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: 'white',
              margin: '0 0 0.75rem 0',
              lineHeight: '1.3',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
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
                  backgroundColor: 'var(--accent-blue)',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  {item.type}
                </span>
              )}
              
              {item.class && (
                <span style={{
                  backgroundColor: 'var(--accent-green)',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  {item.class}
                </span>
              )}
              
              {item.role && (
                <span style={{
                  backgroundColor: 'var(--accent-purple)',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  {item.role}
                </span>
              )}
              
              {item.status && (
                <span style={{
                  backgroundColor: item.status === 'Completada' ? 'var(--accent-green)' : 
                               item.status === 'En progreso' ? 'var(--accent-orange)' : 
                               'var(--accent-gray)',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '500'
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

            {/* Botones de acción */}
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              marginTop: 'auto'
            }}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectItem(item)
                }}
                style={{
                  background: 'var(--accent-blue)',
                  border: 'none',
                  color: 'white',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  flex: 1
                }}
                className="action-button"
              >
                <Eye size={16} />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEditItem(item)
                }}
                style={{
                  background: 'var(--accent-orange)',
                  border: 'none',
                  color: 'white',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  flex: 1
                }}
                className="action-button"
              >
                <Edit size={16} />
              </button>
              
              {onOpenConnections && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onOpenConnections(item, itemType)
                  }}
                  style={{
                    background: 'var(--accent-purple)',
                    border: 'none',
                    color: 'white',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    flex: 1
                  }}
                  className="action-button"
                >
                  <Link2 size={16} />
                </button>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteItem(item.id, item.name || item.title)
                }}
                style={{
                  background: 'var(--accent-red)',
                  border: 'none',
                  color: 'white',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                className="action-button"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )
      })}

      <style jsx>{`
        .compact-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
          border-color: var(--accent-blue);
        }
        
        .action-button:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  )
}

export default CompactList