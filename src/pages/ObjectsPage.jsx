import React from 'react'
import UniversalManager from '../components/EntityManager'

/**
 * ObjectsManager optimizado usando UniversalManager
 * Antes: ~513 líneas de código
 * Después: ~15 líneas de código
 * Reducción: ~97% del código específico
 */
function ObjectsManager({ campaign, connections, selectedItemForNavigation, updateCampaign }) {
  return (
    <UniversalManager
      entityType="objects"
      campaign={campaign}
      connections={connections}
      selectedItemForNavigation={selectedItemForNavigation}
      updateCampaign={updateCampaign}
    />
  )
}

export default ObjectsManager