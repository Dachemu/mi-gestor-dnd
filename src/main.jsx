import React, { useState, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import BackgroundParticles from './components/layout/BackgroundParticles'
import { BaseLoader } from './components/ui/base'
import GlobalProgressManager from './components/common/GlobalProgressManager'
import ErrorBoundary from './utils/errorBoundary'
import './App.css'

// Lazy loading de páginas principales para code splitting
const CampaignSelector = React.lazy(() => import('./pages/CampaignSelector'))
const CampaignDashboard = React.lazy(() => import('./pages/CampaignDashboard'))

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
    <ErrorBoundary>
      <BackgroundParticles />
      
      {/* Suspense wrapper para lazy loading con loader consistente */}
      <Suspense fallback={<BaseLoader />}>
        {/* Mostrar componente según la vista actual */}
        {currentView === 'selector' && (
          <CampaignSelector onSelectCampaign={goToCampaign} />
        )}
        
        {currentView === 'campaign' && selectedCampaign && (
          <CampaignDashboard 
            campaign={selectedCampaign} 
            onBackToSelector={goToSelector}
          />
        )}
      </Suspense>
      
      {/* Gestor global de progreso */}
      <GlobalProgressManager 
        position="bottom-right"
        maxVisible={3}
        showInModal={true}
      />
    </ErrorBoundary>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)