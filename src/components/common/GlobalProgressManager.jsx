/**
 * Gestor Global de Progreso
 * Maneja múltiples operaciones de progreso y las muestra apropiadamente
 */

import React, { useState, useEffect } from 'react'
import ProgressIndicator from './ProgressIndicator'
import progressTracker from '../../services/progressTracker'

const GlobalProgressManager = ({ 
  position = 'bottom-right',
  maxVisible = 3,
  showInModal = false 
}) => {
  const [operations, setOperations] = useState([])
  const [modalOperation, setModalOperation] = useState(null)

  useEffect(() => {
    const unsubscribe = progressTracker.subscribeGlobal((event, operation) => {
      switch (event) {
        case 'operation-started':
          setOperations(prev => [...prev, operation])
          
          // Mostrar en modal si es operación crítica
          if (operation.type === 'synchronization' && showInModal) {
            setModalOperation(operation)
          }
          break

        case 'operation-updated':
          setOperations(prev => 
            prev.map(op => op.id === operation.id ? operation : op)
          )
          
          if (modalOperation?.id === operation.id) {
            setModalOperation(operation)
          }
          break

        case 'operation-completed':
        case 'operation-error':
        case 'operation-cancelled':
          // Mantener visible por unos segundos
          setTimeout(() => {
            setOperations(prev => prev.filter(op => op.id !== operation.id))
            
            if (modalOperation?.id === operation.id) {
              setModalOperation(null)
            }
          }, operation.status === 'error' ? 5000 : 2000)
          break
      }
    })

    return unsubscribe
  }, [showInModal, modalOperation])

  const getPositionClasses = () => {
    const base = 'fixed z-40 space-y-2 max-w-sm'
    
    switch (position) {
      case 'top-right':
        return `${base} top-4 right-4`
      case 'top-left':
        return `${base} top-4 left-4`
      case 'bottom-left':
        return `${base} bottom-4 left-4`
      case 'bottom-right':
      default:
        return `${base} bottom-4 right-4`
    }
  }

  const visibleOperations = operations
    .filter(op => op.status === 'running' || 
                  (op.endTime && Date.now() - op.endTime < 5000))
    .slice(0, maxVisible)

  return (
    <>
      {/* Modal para operación crítica */}
      {modalOperation && (
        <ProgressIndicator 
          operationId={modalOperation.id}
          variant="modal"
          showDetails={true}
          showSteps={true}
          autoHide={true}
          onComplete={() => setModalOperation(null)}
        />
      )}

      {/* Indicadores flotantes */}
      {visibleOperations.length > 0 && (
        <div className={getPositionClasses()}>
          {visibleOperations.map(operation => (
            <ProgressIndicator
              key={operation.id}
              operationId={operation.id}
              variant="default"
              showDetails={false}
              showSteps={false}
              compact={false}
              autoHide={true}
            />
          ))}
          
          {operations.length > maxVisible && (
            <div className="bg-white border rounded-lg p-2 shadow-sm text-sm text-gray-600 text-center">
              +{operations.length - maxVisible} más operaciones...
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default GlobalProgressManager