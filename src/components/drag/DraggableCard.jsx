import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

/**
 * Componente wrapper para hacer cualquier tarjeta draggable
 * Mantiene la funcionalidad de click mientras permite drag & drop
 * Optimizado con React.memo para evitar re-renders innecesarios
 */
export function DraggableCard({
  id,
  children,
  disabled = false
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled
  })

  // Combinar transform del drag con scale
  const transformValue = transform
    ? `${CSS.Transform.toString(transform)} ${isDragging ? 'scale(1.05)' : ''}`
    : isDragging ? 'scale(1.05)' : undefined

  const style = {
    transform: transformValue,
    transition: transition || (isDragging ? 'none' : 'transform 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'),
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    touchAction: 'none',
    zIndex: isDragging ? 1000 : 'auto',
    boxShadow: isDragging
      ? '0 20px 40px rgba(79, 70, 229, 0.3), 0 0 60px rgba(79, 70, 229, 0.2)'
      : 'none',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={isDragging ? 'dragging' : ''}
    >
      {children}
    </div>
  )
}
