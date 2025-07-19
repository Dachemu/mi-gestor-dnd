import React, { useState, useEffect } from 'react'
import { debug, error as logError } from '../utils/logger'
import { Upload, Download, Trash2 } from 'lucide-react'
import { loadCampaigns, saveCampaigns, generateId } from '../services/storage'
import { useNotification } from '../hooks/useNotification.jsx'

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

        {/* Título principal */}
        <h1 className="main-title fade-in">
          ⚔️ Gestor de Campañas D&D
        </h1>
        <p className="subtitle fade-in">
          Crea y gestiona aventuras épicas con todas las herramientas que necesitas
        </p>

        {/* Botones de acción */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '3rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setShowNewCampaignForm(true)}
            className="btn-primary fade-in"
          >
            ➕ Nueva Campaña
          </button>
          <button
            onClick={handleImportCampaign}
            className="btn-secondary fade-in"
          >
            <Upload size={16} />
            Importar
          </button>
        </div>

        {/* Lista de campañas o mensaje de bienvenida */}
        {campaigns.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#9ca3af' }}>
            <h3 style={{ 
              fontSize: '1.8rem', 
              marginBottom: '1rem', 
              color: '#e5e7eb' 
            }}>
              ¡Bienvenido, Dungeon Master! 🎲
            </h3>
            <p style={{ 
              color: '#6b7280', 
              marginBottom: '2rem',
              fontSize: '1.2rem',
              maxWidth: '500px',
              margin: '0 auto 2rem'
            }}>
              Crea tu primera campaña para comenzar a construir mundos épicos y gestionar aventuras inolvidables.
            </p>
            <button
              onClick={() => setShowNewCampaignForm(true)}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                color: 'white',
                padding: '1.5rem 3rem',
                borderRadius: '15px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '1.3rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 30px rgba(139, 92, 246, 0.4)'
              }}
            >
              🚀 Crear Mi Primera Campaña
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem'
          }}>
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
    <div
      onClick={onSelect}
      style={{
        background: 'rgba(31, 41, 55, 0.5)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '20px',
        padding: '2rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
      className="campaign-card"
    >
      {/* Header con título y acciones */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '1rem'
      }}>
        <h3 style={{ 
          color: 'white', 
          fontSize: '1.5rem', 
          fontWeight: 'bold',
          margin: 0,
          flex: 1,
          paddingRight: '1rem'
        }}>
          {campaign.name}
        </h3>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onExport()
            }}
            style={{
              background: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              color: '#3b82f6',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Exportar campaña"
          >
            <Download size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#ef4444',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Eliminar campaña"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <p style={{
        color: '#e5e7eb',
        marginBottom: '1.5rem',
        fontSize: '0.9rem',
        lineHeight: '1.5'
      }}>
        {campaign.description || 'Una aventura épica te espera...'}
      </p>

      {/* Estadísticas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
            {campaign.locations?.length || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Lugares</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
            {campaign.npcs?.length || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>NPCs</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {campaign.quests?.length || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Misiones</div>
        </div>
      </div>

      {/* Fechas */}
      <div style={{
        fontSize: '0.8rem',
        color: '#6b7280',
        borderTop: '1px solid rgba(139, 92, 246, 0.2)',
        paddingTop: '1rem',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>Creada: {new Date(campaign.createdAt).toLocaleDateString()}</span>
        <span>Actualizada: {new Date(campaign.lastModified).toLocaleDateString()}</span>
      </div>
    </div>
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
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              color: 'white', 
              fontWeight: '600', 
              marginBottom: '0.5rem', 
              display: 'block' 
            }}>
              Nombre de la campaña *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
              placeholder="Ej: La Sombra del Dragón"
              className="input-field"
              required
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              color: 'white', 
              fontWeight: '600', 
              marginBottom: '0.5rem', 
              display: 'block' 
            }}>
              Descripción (opcional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
              placeholder="Una breve descripción de tu campaña..."
              className="input-field"
              style={{ minHeight: '100px', resize: 'vertical' }}
            />
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'flex-end' 
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              🚀 Crear Campaña
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CampaignSelector