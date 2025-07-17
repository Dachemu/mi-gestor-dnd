import React from 'react'
import UniversalManager from '../components/EntityManager'

/**
 * NPCsManager optimizado usando UniversalManager
 * Antes: ~453 líneas de código
 * Después: ~15 líneas de código
 * Reducción: ~97% del código específico
 */
function NPCsManager({ campaign, connections, selectedItemForNavigation, updateCampaign }) {
  return (
    <UniversalManager
      entityType="npcs"
      campaign={campaign}
      connections={connections}
      selectedItemForNavigation={selectedItemForNavigation}
      updateCampaign={updateCampaign}
    />
  )
}

export default NPCsManager