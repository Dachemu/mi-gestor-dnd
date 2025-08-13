import React, { useEffect, useState } from 'react'
import { SimpleGoogleDriveButton } from '../sync/SimpleGoogleDriveButton'
import { useSimpleGoogleDrive } from '../../hooks/useSimpleGoogleDrive'

/**
 * Ejemplo de integración de Google Drive simplificado en cualquier componente
 */
export function SimpleDriveIntegration({ campaignName, campaignData, onCampaignChange }) {
  const {
    isConnected,
    hasAutoSave,
    hasPendingChanges,
    markForAutoSave,
    loadCampaign,
    error
  } = useSimpleGoogleDrive()

  // Auto-marcar cambios cuando cambie campaignData
  useEffect(() => {
    if (isConnected && campaignName && campaignData) {
      markForAutoSave(campaignName, campaignData)
    }
  }, [campaignData, isConnected, campaignName, markForAutoSave])

  const handleCampaignLoaded = (name, data) => {
    onCampaignChange?.(name, data)
  }

  return (
    <div>
      <h3>Google Drive - Versión Simplificada</h3>
      
      {/* Botón principal */}
      <SimpleGoogleDriveButton
        campaignName={campaignName}
        campaignData={campaignData}
        onCampaignLoaded={handleCampaignLoaded}
      />

      {/* Información de estado */}
      <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
        {isConnected ? (
          <div>
            ✅ Conectado a Google Drive
            {hasAutoSave && (
              <div>
                🔄 Auto-guardado cada 30 segundos
                {hasPendingChanges && <span> - Cambios pendientes</span>}
              </div>
            )}
          </div>
        ) : (
          <div>❌ No conectado a Google Drive</div>
        )}
      </div>

      {/* Errores */}
      {error && (
        <div style={{ color: 'red', marginTop: '0.5rem' }}>
          Error: {error}
        </div>
      )}
    </div>
  )
}

// Ejemplo de uso en un componente de campaña
export function ExampleCampaignComponent() {
  const [currentCampaign, setCurrentCampaign] = useState({
    name: 'Mi Campaña Épica',
    data: {
      players: [],
      npcs: [],
      locations: [],
      notes: []
    }
  })

  const handleCampaignDataChange = (newData) => {
    setCurrentCampaign(prev => ({
      ...prev,
      data: { ...prev.data, ...newData }
    }))
  }

  const handleCampaignLoaded = (name, data) => {
    setCurrentCampaign({ name, data })
  }

  return (
    <div>
      <h2>{currentCampaign.name}</h2>
      
      {/* Integración de Google Drive */}
      <SimpleDriveIntegration
        campaignName={currentCampaign.name}
        campaignData={currentCampaign.data}
        onCampaignChange={handleCampaignLoaded}
      />

      {/* Aquí iría el resto de tu interfaz de campaña */}
      <div>
        {/* Formularios, tablas, etc. */}
        <button onClick={() => handleCampaignDataChange({ 
          notes: [...currentCampaign.data.notes, { id: Date.now(), text: 'Nueva nota' }] 
        })}>
          Añadir Nota (activará auto-guardado)
        </button>
      </div>
    </div>
  )
}