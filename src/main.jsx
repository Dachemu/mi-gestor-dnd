import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import Particles from './Particles'
import CampaignSelector from './CampaignSelector'
import CampaignManager from './CampaignManager' // Lo crearemos después
import './App.css'

function App() {
  // Estado para la navegación
  const [currentView, setCurrentView] = useState('selector') // 'selector' o 'campaign'
  const [selectedCampaign, setSelectedCampaign] = useState(null)

  // Función para ir al selector de campañas
  const goToSelector = () => {
    setCurrentView('selector')
    setSelectedCampaign(null)
  }

  // Función para ir a gestionar una campaña
  const goToCampaign = (campaign) => {
    setSelectedCampaign(campaign)
    setCurrentView('campaign')
  }

  return (
    <>
      <Particles />
      
      {/* Mostrar componente según la vista actual */}
      {currentView === 'selector' && (
        <CampaignSelector onSelectCampaign={goToCampaign} />
      )}
      
      {currentView === 'campaign' && selectedCampaign && (
        <CampaignManager 
          campaign={selectedCampaign} 
          onBackToSelector={goToSelector}
        />
      )}
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)