import React, { useState, useEffect } from 'react'
import { debug, error as logError } from '../utils/logger'
import { Upload, Download, Trash2 } from 'lucide-react'
import { loadCampaigns, saveCampaigns, generateId } from '../services/storage'
import { useNotification } from '../hooks/useNotification.jsx'
import { BaseButton, BaseInput, BaseCard } from '../components/ui/base'

// Datos iniciales mínimos para nuevas campañas
const INITIAL_CAMPAIGN_DATA = {
  locations: [
    {
      name: "Taberna del Dragón Dorado",
      description: "Una acogedora taberna en el centro de la ciudad",
      importance: "Alta",
      inhabitants: "Bardo local, comerciantes, aventureros",
      notes: "Lugar perfecto para conseguir información y rumores",
      icon: "🏛️",
      category: "General",
      linkedItems: { locations: [], players: [], npcs: [], quests: [], objects: [] },
      createdAt: new Date().toISOString().split('T')[0]
    }
  ],
  npcs: [
    {
      name: "Maestro Alaric",
      role: "Sabio del pueblo",
      description: "Un anciano mago retirado que vive en una torre",
      attitude: "Amistoso",
      notes: "Conoce la historia antigua de la región",
      icon: "🧙",
      category: "General",
      linkedItems: { locations: [], players: [], npcs: [], quests: [], objects: [] },
      createdAt: new Date().toISOString().split('T')[0]
    }
  ],
  quests: [
    {
      name: "Recuperar el Amuleto Perdido",
      description: "Un artefacto ancestral ha sido robado del templo",
      status: "Pendiente",
      priority: "Alta",
      location: "Templo de la Luna",
      reward: "500 monedas de oro",
      notes: "Los ladrones fueron vistos dirigiéndose hacia el bosque",
      icon: "📜",
      category: "General",
      linkedItems: { locations: [], players: [], npcs: [], quests: [], objects: [] },
      createdAt: new Date().toISOString().split('T')[0]
    }
  ],
  notes: [
    {
      title: "Bienvenido a tu nueva campaña",
      content: "¡Comienza a crear tu mundo fantástico! Usa las diferentes pestañas para añadir lugares, personajes, misiones y más.",
      category: "General",
      icon: "📝",
      linkedItems: { locations: [], players: [], npcs: [], quests: [], objects: [] },
      createdAt: new Date().toISOString().split('T')[0]
    }
  ]
}

// 🎯 FUNCIONES DE PERSISTENCIA - Ahora usando servicio centralizado

const exportCampaign = (campaign) => {
  try {
    const dataStr = JSON.stringify(campaign, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${campaign.name.replace(/[^a-z0-9]/gi, '_')}_campaign.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    logError('Error al exportar campaña:', error);
    return false;
  }
};

const importCampaign = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const campaignData = JSON.parse(event.target.result);
        
        // Validar que tenga la estructura básica
        if (!campaignData.name || !campaignData.id) {
          reject(new Error('Archivo de campaña inválido'));
          return;
        }
        
        // Generar nuevo ID para evitar conflictos
        const newCampaign = {
          ...campaignData,
          id: generateId(),
          createdAt: new Date().toISOString().split('T')[0],
          lastModified: new Date().toISOString().split('T')[0]
        };
        
        resolve(newCampaign);
      } catch (error) {
        reject(new Error('Error al procesar archivo: ' + error.message));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error al leer archivo'));
    };
    
    reader.readAsText(file);
  });
};

function CampaignSelector({ onSelectCampaign }) {
  // 🎯 Estado - ARRANCA VACÍO
  const [campaigns, setCampaigns] = useState([])
  const [showNewCampaignForm, setShowNewCampaignForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Hook de notificaciones
  const { showNotification, NotificationComponent } = useNotification()

  // 🎯 Cargar campañas al iniciar
  useEffect(() => {
    setIsLoading(true)
    const savedCampaigns = loadCampaigns()
    setCampaigns(savedCampaigns) // Si está vacío, queda vacío
    setIsLoading(false)
  }, [])

  // Función de notificaciones ahora viene del hook centralizado

  // 🎯 Función para crear nueva campaña
  const handleCreateCampaign = (newCampaignBasic) => {
    debug('Creando nueva campaña:', newCampaignBasic)
    
    // Crear campaña con estructura básica
    const newCampaign = {
      ...newCampaignBasic,
      // Copiar estructura básica (no ejemplos extensos)
      ...JSON.parse(JSON.stringify(INITIAL_CAMPAIGN_DATA)),
      // Generar IDs únicos
      locations: INITIAL_CAMPAIGN_DATA.locations.map(loc => ({ 
        ...loc, 
        id: generateId(),
        createdAt: new Date().toISOString().split('T')[0]
      })),
      npcs: INITIAL_CAMPAIGN_DATA.npcs.map(npc => ({ 
        ...npc, 
        id: generateId(),
        createdAt: new Date().toISOString().split('T')[0]
      })),
      players: [], // Empezar sin jugadores
      quests: INITIAL_CAMPAIGN_DATA.quests.map(quest => ({ 
        ...quest, 
        id: generateId(),
        createdAt: new Date().toISOString().split('T')[0]
      })),
      objects: [], // Empezar sin objetos
      notes: INITIAL_CAMPAIGN_DATA.notes.map(note => ({ 
        ...note, 
        id: generateId(),
        createdAt: new Date().toISOString().split('T')[0]
      }))
    }
    
    // Añadir al estado y guardar
    setCampaigns(prevCampaigns => {
      const newCampaigns = [...prevCampaigns, newCampaign];
      saveCampaigns(newCampaigns);
      return newCampaigns;
    });
    
    // Mostrar notificación en lugar de alert
    showNotification(`¡Campaña "${newCampaign.name}" creada exitosamente! 🎉`)
    setShowNewCampaignForm(false)
  }

  // 🎯 Función para eliminar campaña
  const handleDeleteCampaign = (campaignId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta campaña?')) {
      setCampaigns(prevCampaigns => {
        const newCampaigns = prevCampaigns.filter(c => c.id !== campaignId);
        saveCampaigns(newCampaigns);
        return newCampaigns;
      });
      showNotification('Campaña eliminada exitosamente')
    }
  }

  // 🎯 Función para exportar campaña
  const handleExportCampaign = (campaign) => {
    if (exportCampaign(campaign)) {
      showNotification('¡Campaña exportada exitosamente! 📁')
    } else {
      showNotification('Error al exportar la campaña', 'error')
    }
  }

  // 🎯 Función para importar campaña
  const handleImportCampaign = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (file) {
        try {
          const importedCampaign = await importCampaign(file)
          setCampaigns(prevCampaigns => {
            const newCampaigns = [...prevCampaigns, importedCampaign];
            saveCampaigns(newCampaigns);
            return newCampaigns;
          });
          showNotification(`¡Campaña "${importedCampaign.name}" importada exitosamente! 🎉`)
        } catch (error) {
          showNotification(`Error al importar: ${error.message}`, 'error')
        }
      }
    }
    input.click()
  }

  if (isLoading) {
    return (
      <div className="gradient-bg">
        <div className="app-container">
          <div style={{ color: 'white', fontSize: '1.5rem' }}>
            Cargando campañas...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="gradient-bg">
      <div className="app-container">
        {/* Notificación */}
        <NotificationComponent />

        {/* Título principal compacto */}
        <div className="header-compact">
          <h1 className="main-title-compact fade-in">
            ⚔️ Gestor de Campañas D&D
          </h1>
          
          {/* Botones de acción integrados en el header */}
          <div className="header-actions fade-in">
            <BaseButton
              variant="primary"
              size="sm"
              onClick={() => setShowNewCampaignForm(true)}
            >
              ➕ Nueva
            </BaseButton>
            <BaseButton
              variant="secondary"
              size="sm"
              onClick={handleImportCampaign}
              icon={<Upload size={14} />}
            >
              Importar
            </BaseButton>
          </div>
        </div>

        {/* Lista de campañas o mensaje de bienvenida - más compacta */}
        {campaigns.length === 0 ? (
          <div className="welcome-section">
            <div className="welcome-content">
              <h3 className="welcome-title">
                ¡Bienvenido, Dungeon Master! 🎲
              </h3>
              <p className="welcome-subtitle">
                Crea tu primera campaña para comenzar a construir mundos épicos.
              </p>
              <BaseButton
                variant="primary"
                onClick={() => setShowNewCampaignForm(true)}
                style={{ marginTop: '1rem' }}
              >
                🚀 Crear Mi Primera Campaña
              </BaseButton>
            </div>
          </div>
        ) : (
          <div className="campaigns-grid-compact">
            {campaigns.map(campaign => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onSelect={() => onSelectCampaign(campaign)}
                onDelete={() => handleDeleteCampaign(campaign.id)}
                onExport={() => handleExportCampaign(campaign)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Estilos para layout compacto */}
      <style jsx>{`
        .header-compact {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto 2rem;
          padding: 0 1rem;
          gap: 2rem;
        }

        .main-title-compact {
          font-size: clamp(1.5rem, 4vw, 2.5rem);
          font-weight: 700;
          background: linear-gradient(135deg, #ffffff 0%, #a78bfa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
          flex: 1;
        }

        .header-actions {
          display: flex;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        .welcome-section {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          text-align: center;
          padding: 2rem 1rem;
        }

        .welcome-content {
          background: rgba(31, 41, 55, 0.3);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 20px;
          padding: 2rem;
          backdrop-filter: blur(10px);
        }

        .welcome-title {
          font-size: 1.8rem;
          font-weight: 600;
          color: #e5e7eb;
          margin: 0 0 1rem;
        }

        .welcome-subtitle {
          color: #9ca3af;
          font-size: 1rem;
          margin: 0 0 1.5rem;
          line-height: 1.5;
        }

        .campaigns-grid-compact {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.5rem;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .header-compact {
            flex-direction: column;
            gap: 1rem;
            margin-bottom: 1.5rem;
            text-align: center;
          }

          .main-title-compact {
            font-size: clamp(1.2rem, 6vw, 2rem);
          }

          .header-actions {
            gap: 0.5rem;
          }

          .campaigns-grid-compact {
            grid-template-columns: 1fr;
            gap: 1rem;
            padding: 0 0.5rem;
          }

          .welcome-section {
            padding: 1rem 0.5rem;
          }

          .welcome-content {
            padding: 1.5rem;
          }

          .welcome-title {
            font-size: 1.5rem;
          }

          .welcome-subtitle {
            font-size: 0.9rem;
          }
        }

        @media (max-width: 480px) {
          .header-compact {
            padding: 0 0.5rem;
          }

          .main-title-compact {
            font-size: clamp(1rem, 7vw, 1.8rem);
          }

          .welcome-content {
            padding: 1rem;
            border-radius: 15px;
          }

          .welcome-title {
            font-size: 1.3rem;
          }

          .welcome-subtitle {
            font-size: 0.85rem;
          }
        }
      `}</style>

      {/* Modal para nueva campaña */}
      {showNewCampaignForm && (
        <NewCampaignForm
          onClose={() => setShowNewCampaignForm(false)}
          onCreateCampaign={handleCreateCampaign}
        />
      )}
    </div>
  )
}

// 🎯 Componente para cada tarjeta de campaña
function CampaignCard({ campaign, onSelect, onDelete, onExport }) {
  return (
    <BaseCard
      variant="campaign"
      clickable
      onClick={onSelect}
      hoverEffect="lift"
      stats={{
        'Lugares': campaign.locations?.length || 0,
        'NPCs': campaign.npcs?.length || 0,
        'Misiones': campaign.quests?.length || 0
      }}
      className="campaign-card"
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '1rem'
      }}>
        <BaseCard.Title>
          {campaign.name}
        </BaseCard.Title>
        
        <BaseCard.Actions>
          <BaseButton
            variant="compact"
            onClick={(e) => {
              e.stopPropagation()
              onExport()
            }}
            icon={<Download size={16} />}
            title="Exportar campaña"
            style={{
              background: 'rgba(59, 130, 246, 0.2)',
              borderColor: 'rgba(59, 130, 246, 0.3)',
              color: '#3b82f6'
            }}
          />
          <BaseButton
            variant="compact"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            icon={<Trash2 size={16} />}
            title="Eliminar campaña"
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              borderColor: 'rgba(239, 68, 68, 0.3)',
              color: '#ef4444'
            }}
          />
        </BaseCard.Actions>
      </div>

      <BaseCard.Description>
        {campaign.description || 'Una aventura épica te espera...'}
      </BaseCard.Description>

      <BaseCard.Footer>
        <span>Creada: {new Date(campaign.createdAt).toLocaleDateString()}</span>
        <span>Actualizada: {new Date(campaign.lastModified).toLocaleDateString()}</span>
      </BaseCard.Footer>
    </BaseCard>
  )
}

// 🎯 Formulario para crear nueva campaña
function NewCampaignForm({ onClose, onCreateCampaign }) {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    const newCampaign = {
      id: generateId(),
      name: formData.name,
      description: formData.description,
      createdAt: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0]
    }

    onCreateCampaign(newCampaign)
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        background: 'rgba(31, 41, 55, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '20px',
        padding: '2rem',
        width: '90%',
        maxWidth: '500px'
      }}>
        <h2 style={{ 
          color: 'white', 
          marginBottom: '2rem',
          textAlign: 'center',
          fontSize: '1.8rem'
        }}>
          🎲 Nueva Campaña
        </h2>

        <form onSubmit={handleSubmit}>
          <BaseInput
            label="Nombre de la campaña"
            placeholder="Ej: La Sombra del Dragón"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
            required
            size="md"
            style={{ marginBottom: '1.5rem' }}
          />

          <BaseInput
            variant="textarea"
            label="Descripción (opcional)"
            placeholder="Una breve descripción de tu campaña..."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
            rows={4}
            size="md"
            style={{ marginBottom: '2rem' }}
          />

          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'flex-end' 
          }}>
            <BaseButton
              variant="secondary"
              onClick={onClose}
              type="button"
            >
              Cancelar
            </BaseButton>
            <BaseButton
              variant="primary"
              type="submit"
            >
              🚀 Crear Campaña
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CampaignSelector