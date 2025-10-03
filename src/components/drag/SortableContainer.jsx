import React from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'

/**
 * Contenedor sortable que gestiona el drag & drop de items
 * @param {Array} items - Array de items a ordenar (deben tener un campo 'id')
 * @param {Function} onReorder - Callback cuando se reordena (recibe newOrder array)
 * @param {ReactNode} children - Componentes hijo (DraggableCard)
 * @param {String} strategy - Estrategia de ordenamiento (por defecto vertical)
 */
export function SortableContainer({
  items,
  onReorder,
  children,
  strategy = verticalListSortingStrategy,
  renderOverlay = null
}) {
  const [activeId, setActiveId] = React.useState(null)

  // Configurar sensores para detectar drag con auto-scroll optimizado
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Configuración de auto-scroll personalizado y optimizado
  const autoScrollConfig = React.useMemo(() => ({
    interval: 5, // Actualización ultra rápida (cada 5ms)
    acceleration: 10, // Aceleración muy alta
    threshold: {
      x: 0.2, // 20% del ancho (no necesario para vertical)
      y: 0.15, // 15% de la altura para activar scroll
    },
  }), [])

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveId(null)

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id)
      const newIndex = items.findIndex(item => item.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = [...items]
        const [movedItem] = newItems.splice(oldIndex, 1)
        newItems.splice(newIndex, 0, movedItem)

        onReorder(newItems)
      }
    }
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      modifiers={[restrictToWindowEdges]}
      autoScroll={autoScrollConfig}
    >
      <SortableContext items={items.map(item => item.id)} strategy={strategy}>
        {children}
      </SortableContext>

      {/* Overlay opcional para mostrar el item mientras se arrastra */}
      {renderOverlay && (
        <DragOverlay>
          {activeId ? renderOverlay(items.find(item => item.id === activeId)) : null}
        </DragOverlay>
      )}
    </DndContext>
  )
}
