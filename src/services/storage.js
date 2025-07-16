// Servicio para manejar la persistencia local de campañas
// Este archivo se encarga de guardar y cargar datos del navegador

const STORAGE_KEY = 'dnd-campaigns';

// Función para cargar todas las campañas guardadas
export const loadCampaigns = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  } catch (error) {
    console.error('Error al cargar campañas:', error);
    return [];
  }
};

// Función para guardar todas las campañas
export const saveCampaigns = (campaigns) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
    return true;
  } catch (error) {
    console.error('Error al guardar campañas:', error);
    return false;
  }
};

// Función para guardar una campaña específica
export const saveCampaign = (campaign) => {
  try {
    const campaigns = loadCampaigns();
    const existingIndex = campaigns.findIndex(c => c.id === campaign.id);
    
    if (existingIndex !== -1) {
      // Actualizar campaña existente
      campaigns[existingIndex] = {
        ...campaign,
        lastModified: new Date().toISOString()
      };
    } else {
      // Agregar nueva campaña
      campaigns.push({
        ...campaign,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      });
    }
    
    return saveCampaigns(campaigns);
  } catch (error) {
    console.error('Error al guardar campaña:', error);
    return false;
  }
};

// Función para eliminar una campaña
export const deleteCampaign = (campaignId) => {
  try {
    const campaigns = loadCampaigns();
    const filtered = campaigns.filter(c => c.id !== campaignId);
    return saveCampaigns(filtered);
  } catch (error) {
    console.error('Error al eliminar campaña:', error);
    return false;
  }
};

// Función para buscar una campaña por ID
export const getCampaignById = (campaignId) => {
  const campaigns = loadCampaigns();
  return campaigns.find(c => c.id === campaignId);
};

// Función para generar un ID único para nuevas campañas
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Función para exportar una campaña a archivo JSON
export const exportCampaign = (campaign) => {
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

// Función para importar una campaña desde archivo JSON
export const importCampaign = (file) => {
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
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString()
        };
        
        // Retornar la campaña importada sin guardar
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