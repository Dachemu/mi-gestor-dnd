/**
 * Librería centralizada de emojis para toda la aplicación
 *
 * CATEGORÍAS PRINCIPALES (para EmojiSelector - vista amplia):
 * - personas: Personajes, razas, profesiones
 * - lugares: Ubicaciones, edificios, naturaleza
 * - magia: Símbolos mágicos, criaturas fantásticas
 * - naturaleza: Animales, plantas, elementos
 * - objetos: Armas, herramientas, tesoros, documentos
 *
 * ICONOS COMPACTOS (para IconSelector - vista reducida por entidad):
 * Subconjuntos temáticos de las categorías principales
 */

// ============================================================
// CATEGORÍAS PRINCIPALES (EmojiSelector)
// ============================================================

export const EMOJI_CATEGORIES = {
  personas: {
    name: 'Personas',
    emojis: [
      '🧙', '🧙‍♀️', '🧙‍♂️', '🤴', '👸', '🧝', '🧝‍♀️', '🧝‍♂️',
      '🧛', '🧛‍♀️', '🧛‍♂️', '🧚', '🧚‍♀️', '🧚‍♂️', '🧞', '🧞‍♀️', '🧞‍♂️',
      '🧟', '🧟‍♀️', '🧟‍♂️', '🦸', '🦸‍♀️', '🦸‍♂️', '🦹', '🦹‍♀️', '🦹‍♂️',
      '🤺', '🥷', '💂', '💂‍♀️', '💂‍♂️', '👷', '👷‍♀️', '👷‍♂️',
      '🕵️', '🕵️‍♀️', '🕵️‍♂️', '👨‍⚕️', '👩‍⚕️', '🧑‍⚕️', '👨‍🌾', '👩‍🌾', '🧑‍🌾',
      '👨‍🍳', '👩‍🍳', '🧑‍🍳', '👨‍🏫', '👩‍🏫', '🧑‍🏫', '👨‍⚖️', '👩‍⚖️', '🧑‍⚖️',
      '🧔', '🧔‍♀️', '🧔‍♂️', '👲', '👳', '👳‍♀️', '👳‍♂️', '🧕',
      '👮', '👮‍♀️', '👮‍♂️', '👴', '👵', '🧓', '👶', '👧', '🧒', '👦',
      '👱', '👱‍♀️', '👱‍♂️', '👩‍🦰', '👨‍🦱', '👩‍🦱', '👤', '👥'
    ]
  },
  lugares: {
    name: 'Lugares',
    emojis: [
      '🏰', '🏯', '🗼', '⛪', '🕌', '🛕', '🕍', '⛩️', '🏛️', '🗿',
      '🏚️', '🏘️', '🏙️', '🌋', '⛰️', '🏔️', '🗻', '🏞️', '🏜️', '🏖️',
      '🏝️', '🌊', '🌅', '🌄', '🌃', '🌌', '🌉', '🏟️',
      '🏗️', '🧱', '🪨', '🪵', '🏕️', '🛖', '⛺', '🌁', '🌆', '🌇',
      '💒', '🏩', '🏨', '🏦', '🏪', '🏬', '🏣', '🏤', '🏥', '🏢',
      '🏭', '🏡', '🏠', '⛲', '🌳', '🌲', '🌴', '🌵', '🌾', '🌿',
      '☘️', '🍀', '🍄', '🌰', '🌍', '🌎', '🌏', '🌐', '🗺️', '🧭',
      '🎡', '🎢'
    ]
  },
  magia: {
    name: 'Magia',
    emojis: [
      '🔮', '🎱', '🧿', '🪬', '💫', '⭐', '🌟',
      '✨', '⚡', '💥', '☄️', '🌠', '🌈', '🎆', '🎇',
      '🎃', '👻', '💀', '☠️', '👹', '👺', '😈', '👿', '🦄',
      '🐉', '🐲', '🪔', '🪄', '🔱', '💎', '💍', '👑',
      '♟️', '🃏', '🀄', '🎴', '🧩', '🪅', '🪆'
    ]
  },
  naturaleza: {
    name: 'Naturaleza',
    emojis: [
      '🐺', '🦅', '🦉', '🦇', '🐗', '🦌', '🦏', '🦛', '🐘', '🦒',
      '🦘', '🦬', '🐃', '🐂', '🐄', '🐎', '🦓', '🦍', '🦧', '🐆',
      '🐅', '🦁', '🐯', '🐈', '🐈‍⬛', '🦝', '🦨', '🦡', '🦫', '🦦',
      '🦥', '🐁', '🐀', '🐿️', '🦔', '🐇', '🐰', '🦎', '🐍', '🐢',
      '🐊', '🦕', '🦖', '🦂', '🕷️', '🕸️', '🐝', '🪲', '🐞', '🦗',
      '🪰', '🪱', '🦟', '🦠', '🐙', '🦑', '🦀', '🦞', '🦐', '🦪',
      '🐚', '🐠', '🐟', '🐡', '🐋', '🦈', '🦭', '🦢', '🦚', '🦜',
      '🦩', '🕊️', '🦃', '🦆'
    ]
  },
  objetos: {
    name: 'Objetos',
    emojis: [
      // Armas y equipamiento
      '⚔️', '🗡️', '🛡️', '🏹', '🪓', '🔨', '⛏️', '🪝',
      '💣', '🧨', '🔥',
      // Tesoros y monedas
      '💰', '💵', '🪙', '💳', '💎', '💍', '👑',
      // Ropa y accesorios
      '🎩', '🎓', '⛑️', '🪖', '📿',
      // Instrumentos musicales
      '🔔', '🎺', '🥁', '🪘', '🪕', '🎻', '🪈', '🎸', '🎹', '🎵', '🎶', '🎼', '🎤', '🎧', '📻',
      // Entretenimiento
      '🎮', '🕹️', '🎰', '🎲', '🎯', '🎳', '🪀', '🪁',
      // Premios y logros
      '🏆', '🏅', '🥇', '🥈', '🥉', '🎖️', '🏵️', '🎗️', '🎫', '🎟️',
      // Llaves y cerraduras
      '🗝️', '🔑', '🔐', '🔒', '🔓', '🔏',
      // Herramientas
      '🧰', '🪛', '🔧', '🔩', '⚙️', '🧲', '🔫',
      // Vasijas y contenedores
      '🏺', '⚱️', '📦',
      // Iluminación
      '🕯️', '💡', '🔦', '🏮',
      // Construcción
      '🪟', '🪜', '🧯', '🛢️',
      // Símbolos sombríos
      '🪦', '⚰️', '🚬',
      // Ciencia y medicina
      '🔬', '🔭', '📡', '💉', '🩸', '💊', '🩹', '🩺', '🧬', '🧪', '🧫', '⚗️',
      // Documentos y escritura
      '📜', '📋', '📊', '📈', '📉', '📚', '📖', '📕', '📗', '📘', '📙', '📓', '📔',
      '📒', '📝', '✏️', '✒️', '🖋️', '🖊️', '🖌️', '🖍️', '📄', '📃', '📑', '🗒️',
      '🗞️', '🗓️', '📅', '📆', '🗂️', '📁', '📂', '🗃️',
      // Arte y cultura
      '🎪', '🎭', '🎨', '🖼️',
      // Otros útiles
      '💡', '🔍', '🧭', '🗺️', '📍', '🍾'
    ]
  }
}

// ============================================================
// ICONOS COMPACTOS POR TIPO DE ENTIDAD (IconSelector)
// ============================================================

/**
 * Subconjuntos optimizados de emojis para cada tipo de entidad
 * Estos son los iconos más relevantes y usados frecuentemente
 */
export const ICON_CATEGORIES = {
  players: {
    name: 'Personajes',
    icons: [
      '⚔️', '🏹', '🛡️', '🗡️', '🏺', '🎭', '👑', '🧙‍♂️', '🧙‍♀️', '🧝‍♂️',
      '🧝‍♀️', '🧔', '👩‍🦰', '👨‍🦱', '👩‍🦱', '🧿', '⭐', '🔮', '📿', '🎯'
    ]
  },
  quests: {
    name: 'Misiones',
    icons: [
      '📜', '🗞️', '📋', '📝', '🎯', '🏆', '💎', '👑', '🗝️', '🏺',
      '⚔️', '🛡️', '🏹', '🗡️', '🔍', '🧭', '🗺️', '📍', '🏰', '🌟'
    ]
  },
  objects: {
    name: 'Objetos',
    icons: [
      '📦', '💎', '👑', '🗝️', '🏺', '⚔️', '🛡️', '🏹', '🗡️', '🔮',
      '📿', '💍', '🧿', '📜', '📋', '🍾', '🧪', '💰', '🪙', '💳'
    ]
  },
  npcs: {
    name: 'NPCs',
    icons: [
      '🧙‍♂️', '🧙‍♀️', '👤', '👥', '🧔', '👩‍🦰', '👨‍🦱', '👩‍🦱', '🧝‍♂️', '🧝‍♀️',
      '👑', '🎭', '🛡️', '⚔️', '🏹', '🗡️', '🔮', '📿', '🧿', '🎯'
    ]
  },
  locations: {
    name: 'Lugares',
    icons: [
      '🏰', '🏛️', '🏞️', '🌲', '🏔️', '🗻', '🏖️', '🏝️', '🌋', '🏜️',
      '🏕️', '🏗️', '🏘️', '🏙️', '🌉', '🗼', '🎡', '🎢', '⛪', '🕌'
    ]
  },
  notes: {
    name: 'Notas',
    icons: [
      '📝', '📋', '📜', '🗞️', '📄', '📃', '📑', '🗒️', '🗓️', '📅',
      '📆', '🗂️', '📁', '📂', '🗃️', '📊', '📈', '📉', '💡', '🔍'
    ]
  },
  general: {
    name: 'General',
    icons: [
      '⚔️', '🛡️', '🏹', '🗡️', '🔮', '📿', '💎', '👑', '🗝️', '🏺',
      '🧙‍♂️', '🧙‍♀️', '🧝‍♂️', '🧝‍♀️', '🏰', '🗺️', '📜', '💰', '🌟', '🎯'
    ]
  }
}

// ============================================================
// EMOJIS POR DEFECTO
// ============================================================

/**
 * Emoji por defecto según el tipo de entidad
 */
export const DEFAULT_EMOJIS = {
  campaign: '🐉',
  player: '⚔️',
  npc: '🧙‍♂️',
  location: '🏰',
  quest: '📜',
  object: '💎',
  note: '📝',
  default: '🐉'
}

/**
 * Obtiene el emoji por defecto para un tipo de entidad
 * @param {string} entityType - Tipo de entidad
 * @returns {string} Emoji por defecto
 */
export const getDefaultEmoji = (entityType) => {
  return DEFAULT_EMOJIS[entityType] || DEFAULT_EMOJIS.default
}
