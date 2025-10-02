import React, { useState, useEffect } from 'react'
import { debug, error as logError } from '../utils/logger'
import { Upload, Download, Trash2, Edit2 } from 'lucide-react'
import { loadCampaigns, saveCampaigns, generateId } from '../services/storage'
import { useNotification } from '../hooks/useNotification.jsx'
import { BaseButton, BaseCard } from '../components/ui/base'
import { CompactDriveButton } from '../components/sync/CompactDriveButton'
import { zeroConfigGoogleDrive } from '../services/zeroConfigGoogleDrive'
import CampaignForm from '../components/forms/CampaignForm'

// Estructura vacía para nuevas campañas - sin contenido por defecto
const INITIAL_CAMPAIGN_DATA = {
  locations: [],
  npcs: [],
  players: [],
  quests: [],
  objects: [],
  notes: []
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
  const [editingCampaign, setEditingCampaign] = useState(null)
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

  // 🎯 Escuchar cuando se cargan campañas desde Google Drive
  useEffect(() => {
    const handleGoogleDriveCampaigns = async (event) => {
      const { campaigns: driveCampaigns, folder } = event.detail

      try {
        setIsLoading(true)
        showNotification(`📁 Encontradas ${driveCampaigns.length} campañas en "${folder.name}"`, 'info')

        // Cargar las campañas desde Drive y sincronizar con local
        const loadedCampaigns = []
        const failedCampaigns = []

        for (const driveCampaign of driveCampaigns) {
          try {
            const campaignData = await zeroConfigGoogleDrive.loadCampaign(driveCampaign.name)
            loadedCampaigns.push(campaignData)
          } catch (error) {
            logError(`Error cargando campaña ${driveCampaign.name}:`, error)
            failedCampaigns.push(driveCampaign.name)
          }
        }

        if (loadedCampaigns.length > 0) {
          // Actualizar estado local
          setCampaigns(loadedCampaigns)

          // Guardar en localStorage también
          saveCampaigns(loadedCampaigns)

          showNotification(`✅ ${loadedCampaigns.length} campañas cargadas desde Google Drive`, 'success')
        }

        // Notificar campañas que fallaron
        if (failedCampaigns.length > 0) {
          showNotification(
            `⚠️ ${failedCampaigns.length} campaña${failedCampaigns.length > 1 ? 's' : ''} no pudo cargarse: ${failedCampaigns.join(', ')}`,
            'warning'
          )
        }

        // Caso donde todas las campañas fallaron
        if (loadedCampaigns.length === 0 && failedCampaigns.length > 0) {
          showNotification('❌ No se pudo cargar ninguna campaña desde Drive', 'error')
        }

      } catch (error) {
        logError('Error procesando campañas de Drive:', error)
        showNotification('❌ Error cargando campañas desde Drive', 'error')
      } finally {
        setIsLoading(false)
      }
    }

    // Agregar listener para campañas de Google Drive
    window.addEventListener('googleDriveCampaignsLoaded', handleGoogleDriveCampaigns)
    
    // Cleanup
    return () => {
      window.removeEventListener('googleDriveCampaignsLoaded', handleGoogleDriveCampaigns)
    }
  }, [showNotification])

  // Función de notificaciones ahora viene del hook centralizado

  // 🎯 Función para crear nueva campaña
  const handleCreateCampaign = (newCampaignBasic) => {
    debug('Creando nueva campaña:', newCampaignBasic)
    
    // Crear campaña con estructura vacía
    const newCampaign = {
      ...newCampaignBasic,
      // Usar estructura vacía
      ...INITIAL_CAMPAIGN_DATA
    }
    
    // Añadir al estado y guardar
    setCampaigns(prevCampaigns => {
      const newCampaigns = [...prevCampaigns, newCampaign];
      saveCampaigns(newCampaigns);
      return newCampaigns;
    });
    
    // Guardar automáticamente en Google Drive
    zeroConfigGoogleDrive.saveImmediately(newCampaign.name, newCampaign)
    
    // Mostrar notificación en lugar de alert
    showNotification(`¡Campaña "${newCampaign.name}" creada exitosamente! 🎉`)
    setShowNewCampaignForm(false)
  }

  // 🎯 Función para eliminar campaña
  const handleDeleteCampaign = (campaignId) => {
    const campaignToDelete = campaigns.find(c => c.id === campaignId)
    if (window.confirm('¿Estás seguro de que quieres eliminar esta campaña?')) {
      setCampaigns(prevCampaigns => {
        const newCampaigns = prevCampaigns.filter(c => c.id !== campaignId);
        saveCampaigns(newCampaigns);
        return newCampaigns;
      });
      
      // Eliminar de Google Drive también (implementar después si es necesario)
      if (campaignToDelete) {
        debug(`🗑️ Campaña "${campaignToDelete.name}" eliminada`)
      }
      
      showNotification('Campaña eliminada exitosamente')
    }
  }


  // 🎯 Función para editar campaña
  const handleEditCampaign = (campaign) => {
    setEditingCampaign(campaign)
  }

  // 🎯 Función para actualizar campaña
  const handleUpdateCampaign = (updatedCampaign) => {
    const campaignWithTimestamp = { 
      ...updatedCampaign, 
      lastModified: new Date().toISOString().split('T')[0] 
    }
    
    setCampaigns(prevCampaigns => {
      const newCampaigns = prevCampaigns.map(campaign => 
        campaign.id === updatedCampaign.id ? campaignWithTimestamp : campaign
      );
      saveCampaigns(newCampaigns);
      return newCampaigns;
    });
    
    // Guardar automáticamente en Google Drive
    zeroConfigGoogleDrive.saveImmediately(campaignWithTimestamp.name, campaignWithTimestamp)
    
    showNotification(`¡Campaña "${updatedCampaign.name}" actualizada exitosamente! ✨`)
    setEditingCampaign(null)
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
          
          // Guardar automáticamente en Google Drive
          zeroConfigGoogleDrive.saveImmediately(importedCampaign.name, importedCampaign)
          
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
              size="lg"
              onClick={() => setShowNewCampaignForm(true)}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                minWidth: '140px',
                gap: '8px'
              }}
            >
              ✨ Nueva Campaña
            </BaseButton>
            <BaseButton
              variant="secondary"
              size="lg"
              onClick={handleImportCampaign}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                minWidth: '140px'
              }}
            >
              📥 Importar
            </BaseButton>
            {/* Google Drive Button */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              minWidth: '140px'
            }}>
              <span style={{ 
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                ☁️
              </span>
              <CompactDriveButton 
                onCampaignLoaded={(name, data) => {
                  setCampaigns(prevCampaigns => {
                    // Verificar si ya existe una campaña con el mismo nombre
                    const existingIndex = prevCampaigns.findIndex(c => c.name === name)
                    
                    const campaignData = {
                      ...data,
                      id: data.id || generateId(),
                      name: name,
                      lastModified: new Date().toISOString().split('T')[0]
                    }
                    
                    let newCampaigns
                    if (existingIndex >= 0) {
                      // Actualizar campaña existente
                      newCampaigns = [...prevCampaigns]
                      newCampaigns[existingIndex] = campaignData
                      showNotification(`¡Campaña "${name}" actualizada desde Drive! 🔄`)
                    } else {
                      // Añadir nueva campaña
                      newCampaigns = [...prevCampaigns, campaignData]
                      showNotification(`¡Campaña "${name}" cargada desde Drive! 🎉`)
                    }
                    
                    saveCampaigns(newCampaigns)
                    return newCampaigns
                  })
                }}
              />
            </div>
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
                size="lg"
                onClick={() => setShowNewCampaignForm(true)}
                style={{ 
                  marginTop: '1.5rem',
                  padding: '16px 32px',
                  fontSize: '18px',
                  fontWeight: '700',
                  minWidth: '220px'
                }}
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
                onEdit={() => handleEditCampaign(campaign)}
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
          background: linear-gradient(135deg, #ffffff 0%, #6366f1 100%);
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
          border: 1px solid rgba(79, 70, 229, 0.2);
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

      {/* Modal para editar campaña */}
      {editingCampaign && (
        <CampaignForm
          campaign={editingCampaign}
          onClose={() => setEditingCampaign(null)}
          onSave={handleUpdateCampaign}
        />
      )}

      {/* Modal para nueva campaña */}
      {showNewCampaignForm && (
        <CampaignForm
          onClose={() => setShowNewCampaignForm(false)}
          onSave={handleCreateCampaign}
        />
      )}
    </div>
  )
}

// Iconos para campañas - se asigna uno basado en el hash del nombre
const CAMPAIGN_ICONS = ['🐉', '⚔️', '🏰', '🧙‍♂️', '🗡️', '🛡️', '⭐', '🔮', '🏺', '📜', '👑', '🌟', '🦅', '🐺', '🌙', '☀️', '⚡', '🔥', '💎', '🍃']

// Función para obtener icono de campaña
const getCampaignIcon = (campaignName) => {
  if (!campaignName) return '🎲'
  let hash = 0
  for (let i = 0; i < campaignName.length; i++) {
    const char = campaignName.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return CAMPAIGN_ICONS[Math.abs(hash) % CAMPAIGN_ICONS.length]
}

// 🎯 Componente para cada tarjeta de campaña
function CampaignCard({ campaign, onSelect, onDelete, onExport, onEdit }) {
  const campaignIcon = campaign.emoji || getCampaignIcon(campaign.name)
  
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <div style={{
            fontSize: '32px',
            lineHeight: '1',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
            borderRadius: '12px',
            padding: '8px',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '48px',
            height: '48px'
          }}>
            {campaignIcon}
          </div>
          <BaseCard.Title style={{ margin: 0, flex: 1 }}>
            {campaign.name}
          </BaseCard.Title>
        </div>
        
        <BaseCard.Actions>
          <BaseButton
            variant="compact"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            icon={<Edit2 size={16} />}
            title="Editar campaña"
            style={{
              background: 'rgba(16, 185, 129, 0.2)',
              borderColor: 'rgba(16, 185, 129, 0.3)',
              color: '#10b981'
            }}
          />
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


export default CampaignSelector