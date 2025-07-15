import React, { useState, useEffect } from 'react'
import { Download, Upload, Trash2 } from 'lucide-react'
import NewCampaignForm from './NewCampaignForm'

// 🎯 DATOS MÍNIMOS PARA NUEVAS CAMPAÑAS (solo estructura, sin ejemplos extensos)
const INITIAL_CAMPAIGN_DATA = {
  locations: [
    {
      id: 1,
      name: "Ciudad Principal",
      type: "Ciudad",
      description: "El punto de partida de tu aventura",
      inhabitants: "Ciudadanos locales",
      importance: "Alta",
      icon: "🏰",
      linkedItems: { npcs: [], players: [], quests: [], objects: [], notes: [] },
      createdAt: new Date().toISOString().split('T')[0]
    }
  ],
  
  npcs: [
    {
      id: 1,
      name: "Alcalde del Pueblo",
      role: "Autoridad local",
      location: "Ciudad Principal",
      description: "La persona que da la bienvenida a los aventureros",
      attitude: "Amistoso",
      icon: "👤",
      notes: "Siempre busca ayuda para resolver problemas locales",
      linkedItems: { locations: [], players: [], quests: [], objects: [], notes: [] },
      createdAt: new Date().toISOString().split('T')[0]
    }
  ],

  players: [],  // Empezar sin jugadores predefinidos

  quests: [
    {
      id: 1,
      name: "Primera Aventura",
      type: "Principal",
      status: "No iniciada",
      description: "Tu primera misión en este mundo",
      reward: "Por definir",
      difficulty: "Baja",
      icon: "📜",
      linkedItems: { locations: [], npcs: [], players: [], objects: [], notes: [] },
      createdAt: new Date().toISOString().split('T')[0]
    }
  ],

  objects: [],  // Empezar sin objetos predefinidos

  notes: [
    {
      id: 1,
      title: "Notas de la campaña",
      content: "Aquí puedes anotar ideas importantes para tu campaña.",
      category: "General",
      icon: "📝",
      linkedItems: { locations: [], players: [], npcs: [], quests: [], objects: [] },
      createdAt: new Date().toISOString().split('T')[0]
    }
  ]
}

// 🎯 FUNCIONES DE PERSISTENCIA
const loadCampaigns = () => {
  try {
    const saved = localStorage.getItem('dnd-campaigns');
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  } catch (error) {
    console.error('Error al cargar campañas:', error);
    return [];
  }
};

const saveCampaigns = (campaigns) => {
  try {
    localStorage.setItem('dnd-campaigns', JSON.stringify(campaigns));
    return true;
  } catch (error) {
    console.error('Error al guardar campañas:', error);
    return false;
  }
};

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
    console.error('Error al exportar campaña:', error);
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
          id: Date.now() + Math.random(),
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

  // 🎯 Cargar campañas al iniciar
  useEffect(() => {
    setIsLoading(true)
    const savedCampaigns = loadCampaigns()
    setCampaigns(savedCampaigns) // Si está vacío, queda vacío
    setIsLoading(false)
  }, [])

  // 🎯 Función para crear nueva campaña
  const handleCreateCampaign = (newCampaignBasic) => {
    console.log('Creando nueva campaña:', newCampaignBasic)
    
    // Crear campaña con estructura básica
    const newCampaign = {
      ...newCampaignBasic,
      // Copiar estructura básica (no ejemplos extensos)
      ...JSON.parse(JSON.stringify(INITIAL_CAMPAIGN_DATA)),
      // Generar IDs únicos
      locations: INITIAL_CAMPAIGN_DATA.locations.map(loc => ({ 
        ...loc, 
        id: Date.now() + Math.random(),
        createdAt: new Date().toISOString().split('T')[0]
      })),
      npcs: INITIAL_CAMPAIGN_DATA.npcs.map(npc => ({ 
        ...npc, 
        id: Date.now() + Math.random() + 0.1,
        createdAt: new Date().toISOString().split('T')[0]
      })),
      players: [], // Empezar sin jugadores
      quests: INITIAL_CAMPAIGN_DATA.quests.map(quest => ({ 
        ...quest, 
        id: Date.now() + Math.random() + 0.2,
        createdAt: new Date().toISOString().split('T')[0]
      })),
      objects: [], // Empezar sin objetos
      notes: INITIAL_CAMPAIGN_DATA.notes.map(note => ({ 
        ...note, 
        id: Date.now() + Math.random() + 0.3,
        createdAt: new Date().toISOString().split('T')[0]
      }))
    }
    
    // Añadir al estado y guardar
    setCampaigns(prevCampaigns => {
      const newCampaigns = [...prevCampaigns, newCampaign];
      saveCampaigns(newCampaigns);
      return newCampaigns;
    });
    
    alert(`¡Campaña "${newCampaign.name}" creada exitosamente! 🎉`)
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
      alert('Campaña eliminada exitosamente')
    }
  }

  // 🎯 Función para exportar campaña
  const handleExportCampaign = (campaign) => {
    if (exportCampaign(campaign)) {
      alert('¡Campaña exportada exitosamente! 📁')
    } else {
      alert('Error al exportar la campaña')
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
          alert(`¡Campaña "${importedCampaign.name}" importada exitosamente! 📥`)
        } catch (error) {
          alert('Error al importar: ' + error.message)
        }
      }
    }
    input.click()
  }

  // 🎯 Pantalla de carga
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #15082a 25%, #0a0a0f 50%, #0a1525 75%, #0a0a0f 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'pulse 2s infinite' }}>🎲</div>
          <p style={{ fontSize: '1.2rem', color: '#8b5cf6' }}>Cargando campañas...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #15082a 25%, #0a0a0f 50%, #0a1525 75%, #0a0a0f 100%)',
      backgroundSize: '200% 200%',
      animation: 'gradientShift 10s ease infinite',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Header */}
      <div style={{
        textAlign: 'center',
        padding: '3rem 2rem 2rem',
        position: 'relative',
        zIndex: 1
      }}>
        <h1 style={{
          fontSize: 'clamp(2.5rem, 8vw, 4rem)',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 50%, #8b5cf6 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          marginBottom: '1rem',
          textShadow: '0 4px 20px rgba(139, 92, 246, 0.3)'
        }}>
          🎲 Gestor de Campañas D&D
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: '#e5e7eb',
          maxWidth: '600px',
          margin: '0 auto 2rem'
        }}>
          Crea y gestiona mundos épicos para tus aventuras de rol
        </p>
        
        {/* Botones de acción */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowNewCampaignForm(true)}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)'
            }}
          >
            ➕ Nueva Campaña
          </button>
          
          <button
            onClick={handleImportCampaign}
            style={{
              background: 'transparent',
              color: '#8b5cf6',
              padding: '1rem 2rem',
              borderRadius: '12px',
              border: '2px solid #8b5cf6',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
            }}
          >
            <Upload size={20} />
            Importar
          </button>
        </div>
      </div>

      {/* Lista de campañas */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem 3rem',
        position: 'relative',
        zIndex: 1
      }}>
        {campaigns.length === 0 ? (
          // 🎯 Pantalla de bienvenida cuando no hay campañas
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <div style={{ fontSize: '6rem', marginBottom: '2rem', opacity: 0.7 }}>📚</div>
            <h3 style={{ 
              color: '#9ca3af', 
              fontSize: '2rem', 
              marginBottom: '1rem',
              fontWeight: '600'
            }}>
              ¡Bienvenido, Dungeon Master!
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
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)'
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(139, 92, 246, 0.2)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Contenido principal */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1rem'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: 'white',
            margin: 0,
            flex: 1
          }}>
            {campaign.name}
          </h3>
          
          {/* Botones de acción */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onExport()
              }}
              style={{
                background: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid rgba(139, 92, 246, 0.5)',
                borderRadius: '8px',
                padding: '0.5rem',
                cursor: 'pointer',
                color: '#8b5cf6',
                transition: 'all 0.2s ease'
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
                border: '1px solid rgba(239, 68, 68, 0.5)',
                borderRadius: '8px',
                padding: '0.5rem',
                cursor: 'pointer',
                color: '#ef4444',
                transition: 'all 0.2s ease'
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
    </div>
  )
}

export default CampaignSelector