import React, { useState } from 'react'
import { generateId } from './services/storage'

function NewCampaignForm({ onClose, onCreateCampaign }) {
  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    description: ''
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

    // Crear objeto de nueva campaña
    const newCampaign = {
      id: generateId(),
      name: formData.name.trim(),
      description: formData.description.trim() || 'Una nueva aventura épica te espera...',
      createdAt: new Date().toISOString().split('T')[0], // Solo la fecha
      lastModified: new Date().toISOString().split('T')[0],
      locations: 0,
      players: 0,
      npcs: 0,
      objects: 0,
      quests: 0,
      notes: 0
    }

    // Llamar a la función para crear la campaña
    onCreateCampaign(newCampaign)
    
    // Cerrar el modal
    onClose()
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '20px',
        padding: '2rem',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header del modal */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h3 style={{ 
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            ✨ Nueva Campaña
          </h3>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#ef4444',
              padding: '0.5rem',
              cursor: 'pointer',
              fontSize: '1.2rem'
            }}
          >
            ✕
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          {/* Campo nombre */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: 'var(--primary-light)',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Nombre de la campaña *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Las Crónicas de Eldoria"
              style={{
                width: '100%',
                background: 'rgba(31, 41, 55, 0.5)',
                border: `1px solid ${errors.name ? '#ef4444' : 'rgba(139, 92, 246, 0.2)'}`,
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                color: 'white',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              autoFocus
            />
            {errors.name && (
              <p style={{ 
                color: '#ef4444', 
                fontSize: '0.85rem', 
                marginTop: '0.5rem',
                fontWeight: '500'
              }}>
                {errors.name}
              </p>
            )}
            <p style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginTop: '0.25rem',
              fontStyle: 'italic'
            }}>
              Un nombre épico para tu aventura
            </p>
          </div>

          {/* Campo descripción */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: 'var(--primary-light)',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe tu mundo de aventuras..."
              rows={4}
              style={{
                width: '100%',
                background: 'rgba(31, 41, 55, 0.5)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                color: 'white',
                fontSize: '1rem',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                lineHeight: '1.5'
              }}
            />
            <p style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginTop: '0.25rem',
              fontStyle: 'italic'
            }}>
              Una breve sinopsis de la campaña (opcional)
            </p>
          </div>

          {/* Botones */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                color: 'var(--text-secondary)',
                padding: '0.75rem 1.5rem',
                borderRadius: '10px',
                fontWeight: '500',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!formData.name.trim()}
              style={{
                opacity: !formData.name.trim() ? 0.5 : 1,
                cursor: !formData.name.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              🎲 Crear Campaña
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewCampaignForm