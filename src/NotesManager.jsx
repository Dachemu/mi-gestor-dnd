import React from 'react'
import UniversalManager from './components/UniversalManager'

/**
 * NotesManager optimizado usando UniversalManager
 * Antes: ~486 líneas de código
 * Después: ~15 líneas de código
 * Reducción: ~97% del código específico
 */
function NotesManager({ campaign, connections, selectedItemForNavigation, updateCampaign }) {
  return (
    <UniversalManager
      entityType="notes"
      campaign={campaign}
      connections={connections}
      selectedItemForNavigation={selectedItemForNavigation}
      updateCampaign={updateCampaign}
    />
  )
}

export default NotesManager