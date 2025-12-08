import React, { useEffect, useMemo } from 'react'
import './BackgroundParticles.css'

/**
 * Componente de partículas de fondo optimizado
 * Usa CSS variables para evitar reflows y mejorar rendimiento
 */
function Particles() {
  // Generar datos de partículas una sola vez
  const particlesData = useMemo(() => {
    return Array.from({ length: 15 }, () => ({
      size: Math.random() * 6 + 2,
      left: Math.random() * 100,
      delay: Math.random() * 25,
      duration: Math.random() * 20 + 15
    }))
  }, [])

  useEffect(() => {
    const particlesContainer = document.getElementById('particles')

    if (!particlesContainer || particlesContainer.children.length > 0) {
      return
    }

    // Crear todas las partículas en un fragment para una sola operación DOM
    const fragment = document.createDocumentFragment()
    const particles = []

    particlesData.forEach(data => {
      const particle = document.createElement('div')
      particle.className = 'particle'

      // Usar CSS variables en lugar de propiedades individuales
      particle.style.cssText = `
        --size: ${data.size}px;
        --x-pos: ${data.left}%;
        --delay: ${data.delay}s;
        --duration: ${data.duration}s;
      `

      particles.push(particle)
      fragment.appendChild(particle)
    })

    // Insertar todas las partículas de una vez (1 solo reflow)
    particlesContainer.appendChild(fragment)

    return () => {
      particles.forEach(p => p.remove())
    }
  }, [particlesData])

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

export default React.memo(Particles)