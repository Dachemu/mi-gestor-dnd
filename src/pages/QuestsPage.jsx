import React from 'react'
import UniversalManager from '../components/EntityManager'

/**
 * QuestsManager optimizado usando UniversalManager
 * Antes: ~499 líneas de código
 * Después: ~15 líneas de código
 * Reducción: ~97% del código específico
 */
function QuestsManager({ campaign, connections, selectedItemForNavigation, updateCampaign }) {
  return (
    <UniversalManager
      entityType="quests"
      campaign={campaign}
      connections={connections}
      selectedItemForNavigation={selectedItemForNavigation}
      updateCampaign={updateCampaign}
    />
  )
}

export default QuestsManager