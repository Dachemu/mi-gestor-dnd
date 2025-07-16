import React from 'react'
import UniversalManager from './components/UniversalManager'

/**
 * PlayersManager optimizado usando UniversalManager
 * Antes: ~611 líneas de código
 * Después: ~15 líneas de código
 * Reducción: ~97% del código específico
 */
function PlayersManager({ campaign, connections, selectedItemForNavigation, updateCampaign }) {
  return (
    <UniversalManager
      entityType="players"
      campaign={campaign}
      connections={connections}
      selectedItemForNavigation={selectedItemForNavigation}
      updateCampaign={updateCampaign}
    />
  )
}

export default PlayersManager