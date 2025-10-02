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

  // Configurar sensores para detectar drag
  // activationConstraint previene conflictos con clicks
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px de movimiento antes de iniciar drag (reducido para mejor respuesta)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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
