import React, { useEffect } from 'react'

// Componente de partículas de fondo (extraído de tu app original)
function Particles() {
  useEffect(() => {
    // Crear partículas cuando el componente se monta
    const particlesContainer = document.getElementById('particles')
    
    if (!particlesContainer || particlesContainer.children.length > 0) {
      return // Ya hay partículas o no existe el contenedor
    }

    // Crear 15 partículas para efecto visual
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div')
      particle.className = 'particle'
      
      // Tamaño aleatorio
      const size = Math.random() * 6 + 2
      particle.style.width = `${size}px`
      particle.style.height = `${size}px`
      
      // Posición y timing aleatorios
      particle.style.left = `${Math.random() * 100}%`
      particle.style.animationDelay = `${Math.random() * 25}s`
      particle.style.animationDuration = `${Math.random() * 20 + 15}s`
      
      particlesContainer.appendChild(particle)
    }

    // Limpiar partículas cuando el componente se desmonta
    return () => {
      if (particlesContainer) {
        particlesContainer.innerHTML = ''
      }
    }
  }, [])

  return (
    <div 
      id="particles" 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  )
}

export default Particles