import React, { useState, useRef, useEffect } from 'react'
import { Bold, Italic, Underline, List, ListOrdered, Quote, Eye } from 'lucide-react'

/**
 * Editor de texto enriquecido para campos de descripción y contenido
 * Incluye toolbar con opciones de formateo y vista previa
 */
function RichTextEditor({ 
  value = '', 
  onChange, 
  placeholder = 'Escribe aquí...', 
  minHeight = '200px',
  name 
}) {
  const [isToolbarVisible, setIsToolbarVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const textareaRef = useRef(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.max(
        parseInt(minHeight), 
        textareaRef.current.scrollHeight
      ) + 'px'
    }
  }, [value, minHeight])

  const insertText = (before, after = '') => {
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    
    const newText = value.substring(0, start) + 
                   before + selectedText + after + 
                   value.substring(end)
    
    onChange({ target: { name, value: newText } })
    
    // Restaurar posición del cursor
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + before.length, 
        start + before.length + selectedText.length
      )
    }, 0)
  }

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
      action: () => insertText('\n- ', ''),
      shortcut: 'Ctrl+L'
    },
    {
      icon: ListOrdered,
      label: 'Lista numerada',
      action: () => insertText('\n1. ', ''),
      shortcut: 'Ctrl+Shift+L'
    },
    {
      icon: Quote,
      label: 'Cita',
      action: () => insertText('\n> ', ''),
      shortcut: 'Ctrl+Q'
    }
  ]

  // Procesar texto para vista previa
  const formatPreviewText = (text) => {
    if (!text) return ''
    
    let processed = text
      // Primero procesar negritas (doble asterisco)
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #ffffff; font-weight: 700;">$1</strong>')
      // Luego cursivas (asterisco simple, evitando conflicto con negritas ya procesadas)
      .replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em style="color: #e5e7eb; font-style: italic;">$1</em>')
      // Subrayado
      .replace(/<u>(.*?)<\/u>/g, '<u style="color: #ffffff; text-decoration: underline;">$1</u>')
      
    // Procesar listas con mejor formato
    const lines = processed.split('\n')
    const processedLines = []
    let inList = false
    let inOrderedList = false
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // Lista no ordenada
      if (/^\s*[-*+]\s+(.+)$/.test(line)) {
        if (!inList) {
          processedLines.push('<ul style="margin: 1rem 0; padding-left: 1.5rem; color: var(--text-secondary);">')
          inList = true
        }
        const content = line.replace(/^\s*[-*+]\s+/, '')
        processedLines.push(`<li style="margin: 0.5rem 0;">${content}</li>`)
      }
      // Lista ordenada
      else if (/^\s*\d+\.\s+(.+)$/.test(line)) {
        if (!inOrderedList) {
          processedLines.push('<ol style="margin: 1rem 0; padding-left: 1.5rem; color: var(--text-secondary);">')
          inOrderedList = true
        }
        const content = line.replace(/^\s*\d+\.\s+/, '')
        processedLines.push(`<li style="margin: 0.5rem 0;">${content}</li>`)
      }
      // Citas
      else if (/^\s*>\s+(.+)$/.test(line)) {
        const content = line.replace(/^\s*>\s+/, '')
        processedLines.push(`<blockquote style="border-left: 3px solid #8b5cf6; padding-left: 1rem; margin: 1rem 0; color: var(--text-secondary); font-style: italic; background: rgba(139, 92, 246, 0.1); padding: 0.75rem 1rem; border-radius: 0 8px 8px 0;">${content}</blockquote>`)
        inList = false
        inOrderedList = false
      }
      // Línea normal
      else {
        if (inList) {
          processedLines.push('</ul>')
          inList = false
        }
        if (inOrderedList) {
          processedLines.push('</ol>')
          inOrderedList = false
        }
        if (line.trim()) {
          processedLines.push(line)
        } else {
          processedLines.push('<br>')
        }
      }
    }
    
    // Cerrar listas abiertas
    if (inList) processedLines.push('</ul>')
    if (inOrderedList) processedLines.push('</ol>')
    
    return processedLines.join('\n').replace(/\n/g, '<br>')
  }

  const handleKeyDown = (e) => {
    // Atajos de teclado
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
            insertText('\n1. ', '')
          } else {
            insertText('\n- ', '')
          }
          break
        case 'q':
          e.preventDefault()
          insertText('\n> ', '')
          break
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
        </div>

        <div style={{
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          fontWeight: '500'
        }}>
          Vista previa en tiempo real
        </div>
      </div>

      {/* Editor with inline preview */}
      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        height: 'auto',
        minHeight: minHeight
      }}>
        {/* Editor */}
        <div style={{ 
          flex: 1, 
          borderRight: !isMobile ? '1px solid rgba(139, 92, 246, 0.1)' : 'none',
          borderBottom: isMobile ? '1px solid rgba(139, 92, 246, 0.1)' : 'none'
        }}>
          <div style={{
            padding: '0.5rem 1rem',
            background: 'rgba(15, 15, 25, 0.3)',
            fontSize: '0.75rem',
            color: 'var(--text-disabled)',
            borderBottom: '1px solid rgba(139, 92, 246, 0.1)'
          }}>
            ✏️ Editor
          </div>
          <textarea
            ref={textareaRef}
            name={name}
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsToolbarVisible(true)}
            onBlur={() => setIsToolbarVisible(false)}
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
              minHeight: isMobile ? '120px' : `calc(${minHeight} - 2rem)`,
              lineHeight: '1.6'
            }}
          />
        </div>

        {/* Preview */}
        <div style={{ 
          flex: 1,
          minHeight: isMobile ? '120px' : 'auto'
        }}>
          <div style={{
            padding: '0.5rem 1rem',
            background: 'rgba(15, 15, 25, 0.3)',
            fontSize: '0.75rem',
            color: 'var(--text-disabled)',
            borderBottom: '1px solid rgba(139, 92, 246, 0.1)'
          }}>
            👁️ Vista previa
          </div>
          <div
            style={{
              padding: '1rem',
              minHeight: isMobile ? '120px' : `calc(${minHeight} - 2rem)`,
              color: 'var(--text-secondary)',
              lineHeight: '1.6',
              background: 'rgba(15, 15, 25, 0.2)',
              fontSize: '0.95rem',
              overflow: 'auto'
            }}
            dangerouslySetInnerHTML={{ 
              __html: formatPreviewText(value) || '<em style="color: var(--text-disabled);">Vista previa aparecerá aquí...</em>' 
            }}
          />
        </div>
      </div>

      {/* Hints */}
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
          Usa **negrita**, *cursiva*, listas y más. Atajos: Ctrl+B, Ctrl+I, Ctrl+L
        </span>
        <span>
          {value.length} caracteres
        </span>
      </div>
    </div>
  )
}

export default RichTextEditor