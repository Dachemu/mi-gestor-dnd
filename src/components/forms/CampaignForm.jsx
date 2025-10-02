import React, { useState } from 'react'
import { generateId } from '../../services/storage'
import { BaseModal } from '../ui/base'
import EmojiSelector from '../ui/EmojiSelector'
import { getDefaultEmoji } from '../../constants/emojiLibrary'
import { COMMON_STYLES } from '../../utils/cssHelpers'

/**
 * Formulario unificado para crear y editar campañas
 * @param {Object} campaign - Campaña existente (null para crear nueva)
 * @param {Function} onClose - Callback al cerrar
 * @param {Function} onSave - Callback al guardar (recibe campaña completa)
 */
function CampaignForm({ campaign = null, onClose, onSave }) {
  const isEditing = !!campaign

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: campaign?.name || '',
    description: campaign?.description || '',
    emoji: campaign?.emoji || getDefaultEmoji('campaign')
  })

  // Estado para errores
  const [errors, setErrors] = useState({})

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Validar formulario
  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio'
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Preparar datos según el modo
    const campaignData = isEditing
      ? {
          ...campaign,
          ...formData,
          lastModified: new Date().toISOString().split('T')[0]
        }
      : {
          ...formData,
          id: generateId(),
          createdAt: new Date().toISOString().split('T')[0],
          lastModified: new Date().toISOString().split('T')[0],
          locations: [],
          players: [],
          npcs: [],
          quests: [],
          objects: [],
          notes: []
        }

    onSave(campaignData)
    onClose()
  }

  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      title={isEditing ? 'Editar Campaña' : 'Nueva Campaña'}
      size="medium"
    >
      <form onSubmit={handleSubmit}>
        {/* Campo Emoji */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="emoji" style={COMMON_STYLES.formLabel}>
            Icono
          </label>
          <EmojiSelector
            value={formData.emoji}
            onChange={(emoji) => setFormData(prev => ({ ...prev, emoji }))}
          />
        </div>

        {/* Campo Nombre */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="name" style={COMMON_STYLES.formLabel}>
            Nombre de la Campaña *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ej: La Torre del Mago Oscuro"
            autoFocus
            style={{
              ...COMMON_STYLES.input,
              ...(errors.name ? COMMON_STYLES.borderError : {}),
              ...COMMON_STYLES.transition
            }}
          />
          {errors.name && (
            <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              {errors.name}
            </p>
          )}
        </div>

        {/* Campo Descripción */}
        <div style={{ marginBottom: '2rem' }}>
          <label htmlFor="description" style={COMMON_STYLES.formLabel}>
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe brevemente tu campaña..."
            rows={4}
            style={{
              ...COMMON_STYLES.input,
              ...COMMON_STYLES.transition,
              resize: 'vertical',
              minHeight: '100px'
            }}
          />
        </div>

        {/* Botones de acción */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.7)',
              background: 'rgba(107, 114, 128, 0.2)',
              border: '1px solid rgba(107, 114, 128, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              color: 'white',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            {isEditing ? 'Guardar Cambios' : 'Crear Campaña'}
          </button>
        </div>
      </form>
    </BaseModal>
  )
}

export default CampaignForm
