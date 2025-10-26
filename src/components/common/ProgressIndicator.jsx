/**
 * Componente de Indicador de Progreso Universal
 * Muestra el progreso de operaciones largas con diferentes estilos
 */

import React, { useState, useEffect } from 'react'
import progressTracker from '../../services/progressTracker'

const ProgressIndicator = ({ 
  operationId, 
  variant = 'default',
  showDetails = true,
  showSteps = false,
  compact = false,
  autoHide = true,
  onComplete
}) => {
  const [operation, setOperation] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!operationId) return

    const unsubscribe = progressTracker.subscribe(operationId, (event, operationData) => {
      setOperation(operationData)

      if (event === 'started') {
        setVisible(true)
      } else if (event === 'completed' && autoHide) {
        setTimeout(() => setVisible(false), 2000)
        onComplete?.(operationData.result)
      } else if (event === 'error' && autoHide) {
        setTimeout(() => setVisible(false), 5000)
      }
    })

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [operationId, autoHide, onComplete])

  if (!visible || !operation) {
    return null
  }

  const formatDuration = (ms) => {
    if (ms < 1000) return '< 1s'
    const seconds = Math.floor(ms / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m ${seconds % 60}s`
  }

  const formatETA = (ms) => {
    if (!ms || ms < 1000) return null
    const seconds = Math.ceil(ms / 1000)
    if (seconds < 60) return `~${seconds}s`
    const minutes = Math.ceil(seconds / 60)
    return `~${minutes}m`
  }

  const getStatusColor = () => {
    switch (operation.status) {
      case 'running': return 'bg-blue-500'
      case 'completed': return 'bg-green-500'
      case 'error': return 'bg-red-500'
      case 'cancelled': return 'bg-gray-500'
      default: return 'bg-blue-500'
    }
  }

  const getStatusIcon = () => {
    switch (operation.status) {
      case 'running': return '⏳'
      case 'completed': return '✅'
      case 'error': return '❌'
      case 'cancelled': return '⏹️'
      default: return '⏳'
    }
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-2 text-sm">
        <span>{getStatusIcon()}</span>
        <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[60px]">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getStatusColor()}`}
            style={{ width: `${operation.progress}%` }}
          />
        </div>
        <span className="text-xs text-gray-600">{Math.round(operation.progress)}%</span>
      </div>
    )
  }

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl">{getStatusIcon()}</span>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{operation.title}</h3>
              {operation.description && (
                <p className="text-gray-600 text-sm">{operation.description}</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${getStatusColor()}`}
                style={{ width: `${operation.progress}%` }}
              />
            </div>

            <div className="flex justify-between text-sm text-gray-600">
              <span>{Math.round(operation.progress)}%</span>
              {operation.estimatedTimeRemaining && (
                <span>ETA: {formatETA(operation.estimatedTimeRemaining)}</span>
              )}
            </div>

            {operation.currentStepDescription && (
              <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                {operation.currentStepDescription}
              </div>
            )}

            {operation.phase && operation.phase !== 'running' && (
              <div className="text-xs text-gray-500 capitalize">
                {operation.phase}
              </div>
            )}
          </div>

          {operation.status === 'error' && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {operation.error}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white border rounded-lg p-4 shadow-sm ${
      operation.status === 'error' ? 'border-red-200' : 'border-gray-200'
    }`}>
      <div className="flex items-start space-x-3">
        <span className="text-lg flex-shrink-0">{getStatusIcon()}</span>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium truncate">{operation.title}</h4>
            <span className="text-sm font-mono text-gray-500">
              {Math.round(operation.progress)}%
            </span>
          </div>

          {showDetails && operation.description && (
            <p className="text-sm text-gray-600 mb-3">{operation.description}</p>
          )}

          <div className="bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${getStatusColor()}`}
              style={{ width: `${operation.progress}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <div className="space-x-4">
              {operation.currentStep > 0 && operation.totalSteps > 0 && (
                <span>Paso {operation.currentStep}/{operation.totalSteps}</span>
              )}
              {operation.duration && (
                <span>{formatDuration(operation.duration)}</span>
              )}
            </div>
            
            {operation.estimatedTimeRemaining && operation.status === 'running' && (
              <span>ETA: {formatETA(operation.estimatedTimeRemaining)}</span>
            )}
          </div>

          {operation.currentStepDescription && (
            <div className="mt-2 text-sm text-gray-700 bg-gray-50 px-2 py-1 rounded">
              {operation.currentStepDescription}
            </div>
          )}

          {showSteps && operation.completedSteps && operation.completedSteps.length > 0 && (
            <div className="mt-3 space-y-1">
              <div className="text-xs text-gray-500">Pasos completados:</div>
              <div className="max-h-24 overflow-y-auto space-y-1">
                {operation.completedSteps.slice(-3).map((step, idx) => (
                  <div key={idx} className="text-xs text-green-600 flex items-center space-x-1">
                    <span>✓</span>
                    <span>{step.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {operation.status === 'error' && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              <div className="font-medium">Error:</div>
              <div>{operation.error}</div>
            </div>
          )}

          {operation.status === 'completed' && operation.result && showDetails && (
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
              <div className="font-medium">Completado exitosamente</div>
              {typeof operation.result === 'object' && operation.result.summary && (
                <div>{operation.result.summary}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProgressIndicator