import React from 'react'
import UniversalManager from './components/UniversalManager'

/**
 * LocationsManager optimizado usando UniversalManager
 * Antes: ~644 líneas de código
 * Después: ~15 líneas de código
 * Reducción: ~98% del código específico
 */
function LocationsManager({ campaign, connections, selectedItemForNavigation, updateCampaign }) {
  return (
    <UniversalManager
      entityType="locations"
      campaign={campaign}
      connections={connections}
      selectedItemForNavigation={selectedItemForNavigation}
      updateCampaign={updateCampaign}
    />
  )
}

export default LocationsManager