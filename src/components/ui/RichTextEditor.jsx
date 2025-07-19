import React, { useState, useRef, useEffect } from 'react'
import { Bold, Italic, Underline, List, ListOrdered, Quote, Eye, Palette } from 'lucide-react'
import { formatMarkdownToHtml } from '../../utils/textFormatter'

/**
 * Editor de texto enriquecido completamente reescrito
 * Soluciona todos los problemas de cursor, formato y funcionalidad
 */
function RichTextEditor({ 
  value = '', 
  onChange, 
  placeholder = 'Escribe aquí...', 
  minHeight = '200px',
  maxHeight = '400px',
  name 
}) {
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const textareaRef = useRef(null)
  const colorPickerRef = useRef(null)

  // Detectar móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Cerrar color picker al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        setShowColorPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto-resize del textarea con límite máximo
  useEffect(() => {
    if (textareaRef.current && !isPreviewMode) {
      const textarea = textareaRef.current
      textarea.style.height = 'auto'
      const newHeight = Math.min(
        Math.max(parseInt(minHeight), textarea.scrollHeight),
        parseInt(maxHeight)
      )
      textarea.style.height = newHeight + 'px'
      
      // Habilitar scroll si excede la altura máxima
      if (textarea.scrollHeight > parseInt(maxHeight)) {
        textarea.style.overflowY = 'auto'
      } else {
        textarea.style.overflowY = 'hidden'
      }
    }
  }, [value, minHeight, maxHeight, isPreviewMode])

  // Función mejorada para insertar texto
  const insertText = (before, after = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    
    let newText
    let newCursorPos

    // Lógica especial para listas
    if (before === '- ' || before === '1. ') {
      const lines = value.split('\n')
      const currentLineIndex = value.substring(0, start).split('\n').length - 1
      const currentLine = lines[currentLineIndex]
      
      // Si estamos al final de una línea existente, agregar nueva línea
      if (currentLine && start === value.substring(0, start).lastIndexOf('\n') + currentLine.length + 1) {
        if (before === '- ') {
          newText = value.substring(0, start) + '\n- ' + value.substring(start)
          newCursorPos = start + 3
        } else {
          const match = currentLine.match(/^\s*(\d+)\.\s/)
          const nextNumber = match ? parseInt(match[1]) + 1 : 1
          const listItem = `\n${nextNumber}. `
          newText = value.substring(0, start) + listItem + value.substring(start)
          newCursorPos = start + listItem.length
        }
      } else {
        // Insertar al principio de la línea actual
        const lineStart = value.lastIndexOf('\n', start - 1) + 1
        newText = value.substring(0, lineStart) + before + value.substring(lineStart)
        newCursorPos = lineStart + before.length
      }
    } else {
      // Formateo normal
      newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
      newCursorPos = start + before.length + selectedText.length + after.length
    }
    
    // Actualizar valor
    onChange({ target: { name, value: newText } })
    
    // Restaurar posición del cursor
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  // Insertar color
  const insertColor = (color) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    
    if (selectedText) {
      const coloredText = `<span style="color: ${color}">${selectedText}</span>`
      const newText = value.substring(0, start) + coloredText + value.substring(end)
      onChange({ target: { name, value: newText } })
      
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + coloredText.length, start + coloredText.length)
      }, 0)
    }
    
    setShowColorPicker(false)
  }

  // Acciones de formato
  const formatActions = [
    {
      icon: Bold,
      label: 'Negrita',
      action: () => insertText('**', '**'),
      shortcut: 'Ctrl+B'
    },
    {
      icon: Italic,
      label: 'Cursiva',
      action: () => insertText('*', '*'),
      shortcut: 'Ctrl+I'
    },
    {
      icon: Underline,
      label: 'Subrayado',
      action: () => insertText('<u>', '</u>'),
      shortcut: 'Ctrl+U'
    },
    {
      icon: List,
      label: 'Lista',
      action: () => insertText('- '),
      shortcut: 'Ctrl+L'
    },
    {
      icon: ListOrdered,
      label: 'Lista numerada',
      action: () => insertText('1. '),
      shortcut: 'Ctrl+Shift+L'
    },
    {
      icon: Quote,
      label: 'Cita',
      action: () => insertText('> '),
      shortcut: 'Ctrl+Q'
    }
  ]

  // Colores disponibles
  const colors = [
    { name: 'Rojo', value: '#ef4444' },
    { name: 'Naranja', value: '#f97316' },
    { name: 'Amarillo', value: '#eab308' },
    { name: 'Verde', value: '#22c55e' },
    { name: 'Azul', value: '#3b82f6' },
    { name: 'Púrpura', value: '#8b5cf6' },
    { name: 'Rosa', value: '#ec4899' },
    { name: 'Gris', value: '#6b7280' }
  ]

  // Formatear texto para vista previa usando utilidad compartida
  const formatPreviewText = formatMarkdownToHtml

  // Manejar atajos de teclado
  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          insertText('**', '**')
          break
        case 'i':
          e.preventDefault()
          insertText('*', '*')
          break
        case 'u':
          e.preventDefault()
          insertText('<u>', '</u>')
          break
        case 'l':
          e.preventDefault()
          if (e.shiftKey) {
            insertText('1. ')
          } else {
            insertText('- ')
          }
          break
        case 'q':
          e.preventDefault()
          insertText('> ')
          break
      }
    }
    
    // Continuar lista al presionar Enter
    if (e.key === 'Enter') {
      const textarea = textareaRef.current
      const start = textarea.selectionStart
      const lines = value.split('\n')
      const currentLineIndex = value.substring(0, start).split('\n').length - 1
      const currentLine = lines[currentLineIndex]
      
      // Lista no ordenada
      if (/^-\s/.test(currentLine)) {
        e.preventDefault()
        insertText('\n- ')
        return
      }
      
      // Lista ordenada
      if (/^\d+\.\s/.test(currentLine)) {
        e.preventDefault()
        const match = currentLine.match(/^(\d+)\.\s/)
        const nextNumber = match ? parseInt(match[1]) + 1 : 1
        insertText(`\n${nextNumber}. `)
        return
      }
    }
  }

  return (
    <div style={{
      border: '1px solid rgba(139, 92, 246, 0.2)',
      borderRadius: '12px',
      background: 'rgba(31, 41, 55, 0.6)',
      overflow: 'hidden'
    }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        background: 'rgba(31, 41, 55, 0.8)',
        borderBottom: '1px solid rgba(139, 92, 246, 0.1)'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {formatActions.map((action, index) => {
            const IconComponent = action.icon
            return (
              <button
                key={index}
                type="button"
                onClick={action.action}
                title={`${action.label} (${action.shortcut})`}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '6px',
                  color: 'var(--text-secondary)',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(139, 92, 246, 0.2)'
                  e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)'
                  e.target.style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent'
                  e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)'
                  e.target.style.color = 'var(--text-secondary)'
                }}
              >
                <IconComponent size={16} />
              </button>
            )
          })}
          
          {/* Color picker */}
          <div style={{ position: 'relative' }} ref={colorPickerRef}>
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Resaltar texto"
              style={{
                background: 'transparent',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '6px',
                color: 'var(--text-secondary)',
                padding: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(139, 92, 246, 0.2)'
                e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)'
                e.target.style.color = 'white'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent'
                e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)'
                e.target.style.color = 'var(--text-secondary)'
              }}
            >
              <Palette size={16} />
            </button>
            
            {showColorPicker && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '0.5rem',
                background: 'rgba(15, 15, 25, 0.98)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '8px',
                padding: '0.75rem',
                zIndex: 1000,
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.5rem',
                backdropFilter: 'blur(20px)'
              }}>
                {colors.map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => insertColor(color.value)}
                    title={color.name}
                    style={{
                      width: '24px',
                      height: '24px',
                      background: color.value,
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.1)'
                      e.target.style.borderColor = 'white'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)'
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Preview toggle */}
        <button
          type="button"
          onClick={() => setIsPreviewMode(!isPreviewMode)}
          title={isPreviewMode ? 'Modo edición' : 'Vista previa'}
          style={{
            background: isPreviewMode ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '6px',
            color: isPreviewMode ? 'white' : 'var(--text-secondary)',
            padding: '0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
        >
          <Eye size={16} />
        </button>
      </div>

      {/* Content area */}
      <div style={{ 
        minHeight: minHeight,
        maxHeight: maxHeight,
        overflowY: 'auto'
      }}>
        {isPreviewMode ? (
          // Vista previa
          <div
            style={{
              padding: '1rem',
              fontSize: '0.95rem',
              lineHeight: '1.6',
              color: 'white',
              minHeight: `calc(${minHeight} - 2rem)`,
              maxHeight: `calc(${maxHeight} - 2rem)`,
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word'
            }}
            dangerouslySetInnerHTML={{ 
              __html: value ? formatPreviewText(value) : `<span style="color: #6b7280; font-style: italic;">${placeholder}</span>`
            }}
          />
        ) : (
          // Modo edición
          <textarea
            ref={textareaRef}
            name={name}
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '0.95rem',
              fontFamily: 'inherit',
              padding: '1rem',
              resize: 'none',
              outline: 'none',
              minHeight: `calc(${minHeight} - 2rem)`,
              maxHeight: `calc(${maxHeight} - 2rem)`,
              lineHeight: '1.6'
            }}
          />
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '0.5rem 1rem',
        background: 'rgba(15, 15, 25, 0.5)',
        borderTop: '1px solid rgba(139, 92, 246, 0.1)',
        fontSize: '0.75rem',
        color: 'var(--text-disabled)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>
          Usa **negrita**, *cursiva*, listas con - o 1., citas con &gt;. Atajos: Ctrl+B, Ctrl+I, Ctrl+L
        </span>
        <span>
          {value.length} caracteres
        </span>
      </div>
    </div>
  )
}

export default RichTextEditor