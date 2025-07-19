import React from 'react'
import BaseSelector from './BaseSelector'

const DND_EMOJIS = {
  players: ['⚔️', '🛡️', '🏹', '🗡️', '⚡', '🔥', '❄️', '🌟', '👑', '💎', '🧙‍♂️', '🧙‍♀️', '🤺', '🏃‍♂️', '🏃‍♀️'],
  npcs: ['👤', '🧙', '👑', '🛡️', '⚔️', '🏹', '💰', '📚', '🔮', '🧪', '🗝️', '👸', '🤴', '🧝‍♂️', '🧝‍♀️', '🧙‍♂️', '🧙‍♀️', '👮‍♂️', '👮‍♀️', '🛒'],
  objects: ['📦', '⚔️', '🛡️', '🏹', '💎', '💰', '🗝️', '📜', '🔮', '🧪', '💍', '👑', '🏺', '📚', '🗡️', '🪓', '🔨', '🏆', '💀', '🌟'],
  quests: ['📜', '🗡️', '🏰', '🐉', '👑', '💎', '🗝️', '🏆', '⚔️', '🛡️', '🌟', '🔥', '💀', '⚡', '🌊', '🌋', '🏔️', '🌲', '🕳️', '🗻'],
  locations: ['📍', '🏰', '🏛️', '🏕️', '🏪', '🏠', '🌲', '🏔️', '🌊', '🏞️', '🕳️', '⛰️', '🗻', '🌋', '🏝️', '🏖️', '🌴', '🏴‍☠️', '🗼', '🏯'],
  notes: ['📝', '📚', '📖', '📔', '📒', '📃', '📄', '🗒️', '📋', '📊', '📈', '📉', '🗂️', '📁', '🔖', '💡', '⭐', '🔥', '❗', '❓']
}

function EmojiSelector({ value, onChange, entityType, name }) {
  const emojis = DND_EMOJIS[entityType] || DND_EMOJIS.objects

  return (
    <BaseSelector
      value={value}
      onChange={onChange}
      name={name}
      options={emojis}
      placeholder="Seleccionar icono"
      selectedText={value ? 'Cambiar icono' : 'Seleccionar icono'}
    />
  )
}

export default EmojiSelector