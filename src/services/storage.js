// Servicio para manejar la persistencia local de campañas
// Este archivo se encarga de guardar y cargar datos del navegador
import { error as logError } from '../utils/logger'

const STORAGE_KEY = 'dnd-campaigns';

// Función para cargar todas las campañas guardadas (síncrona - compatibilidad)
export const loadCampaigns = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  } catch (error) {
    logError('Error al cargar campañas:', error);
    return [];
  }
};

// Función async para cargar campañas sin bloquear el hilo principal
export const loadCampaignsAsync = () => {
  return new Promise((resolve) => {
    // Usar setTimeout para no bloquear el hilo principal
    setTimeout(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const campaigns = JSON.parse(saved);
          resolve(campaigns);
        } else {
          resolve([]);
        }
      } catch (error) {
        logError('Error al cargar campañas:', error);
        resolve([]);
      }
    }, 0);
  });
};

// Función para guardar todas las campañas (síncrona - compatibilidad)
export const saveCampaigns = (campaigns) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
    return true;
  } catch (error) {
    logError('Error al guardar campañas:', error);
    return false;
  }
};

// Función async para guardar campañas sin bloquear el hilo principal
export const saveCampaignsAsync = (campaigns) => {
  return new Promise((resolve) => {
    // Usar setTimeout para no bloquear el hilo principal
    setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
        resolve(true);
      } catch (error) {
        logError('Error al guardar campañas:', error);
        resolve(false);
      }
    }, 0);
  });
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
    logError('Error al guardar campaña:', error);
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
    logError('Error al eliminar campaña:', error);
    return false;
  }
};

// Función para buscar una campaña por ID
export const getCampaignById = (campaignId) => {
  const campaigns = loadCampaigns();
  return campaigns.find(c => c.id === campaignId);
};

// Función mejorada para generar un ID único para nuevas campañas
// Usa timestamp + dos números aleatorios para minimizar colisiones
export const generateId = () => {
  const timestamp = Date.now().toString(36);
  const randomPart1 = Math.random().toString(36).substring(2, 15);
  const randomPart2 = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomPart1}${randomPart2}`;
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
    logError('Error al exportar campaña:', error);
    return false;
  }
};

// Función auxiliar para validar estructura de campaña
const validateCampaignStructure = (data) => {
  const requiredFields = ['name', 'id'];
  const arrayFields = ['locations', 'players', 'npcs', 'quests', 'objects', 'notes'];

  // Validar campos requeridos
  for (const field of requiredFields) {
    if (!data[field] || typeof data[field] !== 'string' || data[field].trim() === '') {
      return `Falta el campo requerido o es inválido: ${field}`;
    }
  }

  // Validar que los arrays sean realmente arrays
  for (const field of arrayFields) {
    if (data[field] !== undefined && !Array.isArray(data[field])) {
      return `El campo '${field}' debe ser un array`;
    }
  }

  // Validar tamaño razonable del archivo (max 10MB en JSON)
  const dataStr = JSON.stringify(data);
  if (dataStr.length > 10 * 1024 * 1024) {
    return 'El archivo es demasiado grande (máximo 10MB)';
  }

  return null; // Sin errores
};

// Función para importar una campaña desde archivo JSON
export const importCampaign = (file) => {
  return new Promise((resolve, reject) => {
    // Validar tipo de archivo
    if (!file.name.endsWith('.json')) {
      reject(new Error('El archivo debe ser un JSON'));
      return;
    }

    // Validar tamaño del archivo (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error('El archivo es demasiado grande (máximo 10MB)'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const campaignData = JSON.parse(event.target.result);

        // Validar estructura
        const validationError = validateCampaignStructure(campaignData);
        if (validationError) {
          reject(new Error(`Campaña inválida: ${validationError}`));
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
        if (error instanceof SyntaxError) {
          reject(new Error('El archivo JSON está mal formado'));
        } else {
          reject(new Error('Error al procesar archivo: ' + error.message));
        }
      }
    };

    reader.onerror = () => {
      reject(new Error('Error al leer archivo'));
    };

    reader.readAsText(file);
  });
};