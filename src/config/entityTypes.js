/**
 * Configuración central para todos los tipos de entidades del gestor D&D
 * Define esquemas, validaciones, iconos y comportamientos específicos
 */

// Esquemas de formulario para cada tipo de entidad
export const ENTITY_SCHEMAS = {
  players: {
    name: { type: 'text', required: true, label: 'Nombre del personaje', placeholder: 'Ej: Aragorn' },
    player: { type: 'text', label: 'Jugador real', placeholder: 'Nombre del jugador' },
    class: { 
      type: 'select', 
      label: 'Clase',
      options: ['Bárbaro', 'Bardo', 'Brujo', 'Clérigo', 'Druida', 'Explorador', 'Guerrero', 'Hechicero', 'Mago', 'Monje', 'Paladín', 'Pícaro', 'Artificiero']
    },
    background: { type: 'text', label: 'Trasfondo', placeholder: 'Ej: Noble, Forajido, Ermitaño...' },
    description: { type: 'textarea', label: 'Descripción del personaje', placeholder: 'Apariencia, personalidad, historia personal...' },
    backstory: { type: 'richtext', label: 'Historia del personaje', placeholder: 'Historia completa del personaje, conexiones con la trama, motivaciones...' },
    avatar: { type: 'text', label: 'Avatar', defaultValue: '⚔️' },
    icon: { type: 'text', label: 'Icono', defaultValue: '⚔️' }
  },

  quests: {
    title: { type: 'text', required: true, label: 'Título de la misión', placeholder: 'Ej: Recuperar el Amuleto Perdido' },
    description: { type: 'textarea', label: 'Descripción', placeholder: 'Describe la misión: objetivos, contexto, lo que deben hacer los jugadores...' },
    status: { 
      type: 'select', 
      label: 'Estado', 
      defaultValue: 'Pendiente',
      options: ['Pendiente', 'En progreso', 'Completada', 'Fallida']
    },
    priority: { 
      type: 'select', 
      label: 'Prioridad', 
      defaultValue: 'Media',
      options: ['Crítica', 'Alta', 'Media', 'Baja']
    },
    location: { type: 'text', label: 'Ubicación', placeholder: '¿Dónde tiene lugar esta misión?' },
    reward: { type: 'text', label: 'Recompensa', placeholder: 'Ej: 1000 monedas de oro + Espada mágica' },
    detailedDescription: { type: 'richtext', label: 'Descripción detallada', placeholder: 'Información adicional, pistas, secretos, detalles para el DM...' },
    icon: { type: 'text', label: 'Icono', defaultValue: '📜' }
  },

  objects: {
    name: { type: 'text', required: true, label: 'Nombre', placeholder: 'Ej: Espada Llameante de Ignis' },
    type: { 
      type: 'select', 
      label: 'Tipo',
      options: ['Arma', 'Armadura', 'Escudo', 'Poción', 'Pergamino', 'Anillo', 'Amuleto', 'Joya', 'Gema', 'Herramienta', 'Instrumento', 'Libro', 'Mapa', 'Llave', 'Reliquia', 'Artefacto', 'Componente', 'Material', 'Tesoro', 'Símbolo Sagrado', 'Linterna', 'Otro']
    },
    rarity: { 
      type: 'select', 
      label: 'Rareza', 
      defaultValue: 'Común',
      options: ['Común', 'Poco común', 'Raro', 'Épico', 'Legendario']
    },
    description: { type: 'textarea', label: 'Descripción', placeholder: 'Apariencia, historia, características especiales...' },
    detailedDescription: { type: 'richtext', label: 'Descripción detallada', placeholder: 'Información adicional, historia detallada, propiedades mágicas...' },
    owner: { type: 'text', label: 'Propietario', placeholder: '¿Quién lo posee?' },
    location: { type: 'text', label: 'Ubicación', placeholder: '¿Dónde se encuentra?' },
    icon: { type: 'text', label: 'Icono', defaultValue: '📦' }
  },

  npcs: {
    name: { type: 'text', required: true, label: 'Nombre', placeholder: 'Ej: Maestro Elrond' },
    role: { type: 'text', label: 'Rol o Profesión', placeholder: 'Ej: Posadero, Comerciante, Guardia...' },
    description: { type: 'textarea', label: 'Descripción', placeholder: 'Apariencia física, personalidad, trasfondo...' },
    location: { type: 'text', label: 'Ubicación habitual', placeholder: '¿Dónde se le puede encontrar normalmente?' },
    attitude: { 
      type: 'select', 
      label: 'Actitud hacia los jugadores', 
      defaultValue: 'Neutral',
      options: ['Amistoso', 'Neutral', 'Hostil', 'Desconfiado', 'Servicial']
    },
    detailedDescription: { type: 'richtext', label: 'Descripción detallada', placeholder: 'Información adicional, secretos, motivaciones, conexiones con otros personajes...' },
    icon: { type: 'text', label: 'Icono', defaultValue: '👤' }
  },

  locations: {
    name: { type: 'text', required: true, label: 'Nombre del lugar', placeholder: 'Ej: Taberna del Dragón Dorado' },
    type: { 
      type: 'select', 
      label: 'Tipo de lugar',
      options: ['Ciudad', 'Pueblo', 'Taberna', 'Castillo', 'Fortaleza', 'Torre', 'Cueva', 'Mazmorra', 'Bosque', 'Montaña', 'Templo', 'Universidad', 'Mercado', 'Puerto', 'Ruinas', 'Otro']
    },
    description: { type: 'textarea', label: 'Descripción', placeholder: 'Describe el lugar: su apariencia, atmósfera, características especiales...' },
    importance: { 
      type: 'select', 
      label: 'Importancia en la campaña', 
      defaultValue: 'Media',
      options: ['Crítica', 'Alta', 'Media', 'Baja']
    },
    inhabitants: { type: 'text', label: 'Habitantes', placeholder: '¿Quién vive o frecuenta este lugar?' },
    detailedDescription: { type: 'richtext', label: 'Descripción detallada', placeholder: 'Información adicional, secretos, detalles específicos para el DM...' },
    icon: { type: 'text', label: 'Icono', defaultValue: '🏛️' }
  },

  notes: {
    title: { type: 'text', required: true, label: 'Título', placeholder: 'Ej: Notas de la Sesión 5' },
    category: { 
      type: 'select', 
      label: 'Categoría', 
      defaultValue: 'General',
      options: ['General', 'Sesión', 'Trama', 'Personajes', 'Mundo', 'Reglas']
    },
    content: { type: 'richtext', label: 'Contenido', placeholder: 'Escribe el contenido de tu nota aquí...', minHeight: '300px' },
    modifiedAt: { type: 'datetime', label: 'Fecha de modificación', readOnly: true }
  }
}

// Configuración principal de cada tipo de entidad
export const ENTITY_CONFIGS = {
  players: {
    key: 'players',
    name: 'Jugador',
    pluralName: 'Jugadores',
    icon: '👥',
    emptyIcon: '👥',
    emptyMessage: 'No hay jugadores aún. ¡Añade el primer héroe de tu campaña!',
    description: 'Los héroes de tu campaña',
    schema: ENTITY_SCHEMAS.players,
    displayFields: {
      primary: 'name',
      secondary: ['class'],
      description: 'description'
    },
    detailSections: [
      {
        title: 'Información básica',
        fields: ['player', 'class', 'background', 'description']
      },
      {
        title: 'Historia del personaje',
        fields: ['backstory'],
        render: 'html'
      }
    ],
    colors: {}
  },

  quests: {
    key: 'quests',
    name: 'Misión',
    pluralName: 'Misiones',
    icon: '📜',
    emptyIcon: '📜',
    emptyMessage: 'No hay misiones aún. ¡Crea la primera aventura de tu campaña!',
    description: 'Las aventuras y objetivos',
    schema: ENTITY_SCHEMAS.quests,
    displayFields: {
      primary: 'title',
      secondary: ['status', 'priority'],
      description: 'description'
    },
    detailSections: [
      {
        title: 'Información básica',
        fields: ['description', 'location', 'reward']
      },
      {
        title: 'Descripción detallada',
        fields: ['detailedDescription'],
        render: 'html'
      }
    ],
    colors: {
      status: {
        'Completada': '#10b981',
        'En progreso': '#f59e0b',
        'Pendiente': '#6b7280',
        'Fallida': '#ef4444'
      },
      priority: {
        'Crítica': '#ff0000',
        'Alta': '#ef4444',
        'Media': '#f59e0b',
        'Baja': '#10b981'
      }
    }
  },

  objects: {
    key: 'objects',
    name: 'Objeto',
    pluralName: 'Objetos',
    icon: '📦',
    emptyIcon: '📦',
    emptyMessage: 'No hay objetos aún. ¡Añade el primer tesoro de tu campaña!',
    description: 'Los tesoros y artefactos',
    schema: ENTITY_SCHEMAS.objects,
    displayFields: {
      primary: 'name',
      secondary: ['type', 'rarity'],
      description: 'description'
    },
    detailSections: [
      {
        title: 'Información básica',
        fields: ['description', 'owner', 'location']
      },
      {
        title: 'Descripción detallada',
        fields: ['detailedDescription'],
        render: 'html'
      }
    ],
    colors: {
      rarity: {
        'Legendario': '#ff6b35',
        'Épico': '#8b5cf6',
        'Raro': '#3b82f6',
        'Poco común': '#10b981',
        'Común': '#6b7280'
      }
    }
  },

  npcs: {
    key: 'npcs',
    name: 'NPC',
    pluralName: 'NPCs',
    icon: '🧙',
    emptyIcon: '🧙',
    emptyMessage: 'No hay NPCs aún. ¡Añade el primer personaje de tu campaña!',
    description: 'Los personajes que dan vida al mundo',
    schema: ENTITY_SCHEMAS.npcs,
    displayFields: {
      primary: 'name',
      secondary: ['role'],
      description: 'description'
    },
    detailSections: [
      {
        title: 'Información básica',
        fields: ['description', 'location', 'attitude']
      },
      {
        title: 'Descripción detallada',
        fields: ['detailedDescription'],
        render: 'html'
      }
    ],
    colors: {
      attitude: {
        'Amistoso': '#10b981',
        'Hostil': '#ef4444',
        'Neutral': '#8b5cf6'
      }
    }
  },

  locations: {
    key: 'locations',
    name: 'Lugar',
    pluralName: 'Lugares',
    icon: '📍',
    emptyIcon: '📍',
    emptyMessage: 'No hay lugares aún. ¡Añade el primer escenario de tu campaña!',
    description: 'Los escenarios donde transcurren las aventuras',
    schema: ENTITY_SCHEMAS.locations,
    displayFields: {
      primary: 'name',
      secondary: ['type', 'importance'],
      description: 'description'
    },
    detailSections: [
      {
        title: 'Información básica',
        fields: ['description', 'type', 'inhabitants']
      },
      {
        title: 'Descripción detallada',
        fields: ['detailedDescription'],
        render: 'html'
      }
    ],
    colors: {
      importance: {
        'Crítica': '#ff0000',
        'Alta': '#ef4444',
        'Media': '#f59e0b',
        'Baja': '#10b981'
      }
    }
  },

  notes: {
    key: 'notes',
    name: 'Nota',
    pluralName: 'Notas',
    icon: '📝',
    emptyIcon: '📝',
    emptyMessage: 'No hay notas aún. ¡Añade la primera nota de tu campaña!',
    description: 'Tus apuntes y recordatorios',
    schema: ENTITY_SCHEMAS.notes,
    displayFields: {
      primary: 'title',
      secondary: ['category'],
      description: 'content'
    },
    detailSections: [
      {
        title: 'Contenido',
        fields: ['content'],
        render: 'html'
      }
    ],
    colors: {
      category: {
        'General': '#6b7280',
        'Sesión': '#3b82f6',
        'Trama': '#8b5cf6',
        'Personajes': '#10b981',
        'Mundo': '#f59e0b',
        'Reglas': '#ef4444'
      }
    },
    filters: ['category'],
    fixedIcon: '📝'
  }
}

// Función helper para obtener la configuración de un tipo de entidad
export function getEntityConfig(entityType) {
  return ENTITY_CONFIGS[entityType] || null
}

// Función helper para obtener todos los tipos de entidad disponibles
export function getAllEntityTypes() {
  return Object.keys(ENTITY_CONFIGS)
}

// Función helper para validar un item según su esquema
export function validateEntity(entityType, data) {
  const config = getEntityConfig(entityType)
  if (!config) return { isValid: false, errors: ['Tipo de entidad no válido'] }

  const errors = {}
  
  Object.entries(config.schema).forEach(([fieldName, fieldConfig]) => {
    if (fieldConfig.required && (!data[fieldName] || !data[fieldName].toString().trim())) {
      errors[fieldName] = `${fieldConfig.label} es obligatorio`
    }
  })

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export default ENTITY_CONFIGS