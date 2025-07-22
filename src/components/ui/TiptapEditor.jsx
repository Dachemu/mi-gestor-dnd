import React, { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Bold, Italic, Underline, List, ListOrdered, Quote, Palette } from 'lucide-react'

/**
 * Editor de texto enriquecido unificado basado en Tiptap
 * Proporciona edición WYSIWYG en tiempo real sin modo preview separado
 */
function TiptapEditor({ 
  value = '', 
  onChange, 
  placeholder = 'Escribe aquí...', 
  minHeight = '200px',
  maxHeight = '400px',
  name 
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content',
        style: `min-height: calc(${minHeight} - 2rem); max-height: calc(${maxHeight} - 2rem); overflow-y: auto;`,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange?.({ target: { name, value: html } })
    },
    onFocus: () => {
      // Opcional: manejar focus
    },
    onBlur: () => {
      // Opcional: manejar blur
    },
  })

  // Sincronizar valor externo con el editor
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '')
    }
  }, [editor, value])

  // Colores disponibles
  const colors = [
    { name: 'Rojo', value: '#ef4444' },
    { name: 'Naranja', value: '#f97316' },
    { name: 'Amarillo', value: '#eab308' },
    { name: 'Verde', value: '#22c55e' },
    { name: 'Azul', value: '#3b82f6' },
    { name: 'Púrpura', value: '#8b5cf6' },
    { name: 'Rosa', value: '#ec4899' },
    { name: 'Gris', value: '#6b7280' },
  ]

  const [showColorPicker, setShowColorPicker] = React.useState(false)
  const colorPickerRef = React.useRef(null)

  // Cerrar color picker al hacer clic fuera
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        setShowColorPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!editor) {
    return null
  }

  // Aplicar color al texto seleccionado
  const applyColor = (color) => {
    editor.chain().focus().setColor(color).run()
    setShowColorPicker(false)
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
        borderBottom: '1px solid rgba(139, 92, 246, 0.1)',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Negrita */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'active' : ''}
            title="Negrita (Ctrl+B)"
            style={{
              background: editor.isActive('bold') ? 'rgba(139, 92, 246, 0.3)' : 'transparent',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '6px',
              color: editor.isActive('bold') ? 'white' : 'var(--text-secondary)',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!editor.isActive('bold')) {
                e.target.style.background = 'rgba(139, 92, 246, 0.2)'
                e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)'
                e.target.style.color = 'white'
              }
            }}
            onMouseLeave={(e) => {
              if (!editor.isActive('bold')) {
                e.target.style.background = 'transparent'
                e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)'
                e.target.style.color = 'var(--text-secondary)'
              }
            }}
          >
            <Bold size={16} />
          </button>

          {/* Cursiva */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'active' : ''}
            title="Cursiva (Ctrl+I)"
            style={{
              background: editor.isActive('italic') ? 'rgba(139, 92, 246, 0.3)' : 'transparent',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '6px',
              color: editor.isActive('italic') ? 'white' : 'var(--text-secondary)',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!editor.isActive('italic')) {
                e.target.style.background = 'rgba(139, 92, 246, 0.2)'
                e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)'
                e.target.style.color = 'white'
              }
            }}
            onMouseLeave={(e) => {
              if (!editor.isActive('italic')) {
                e.target.style.background = 'transparent'
                e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)'
                e.target.style.color = 'var(--text-secondary)'
              }
            }}
          >
            <Italic size={16} />
          </button>

          {/* Subrayado */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? 'active' : ''}
            title="Tachado"
            style={{
              background: editor.isActive('strike') ? 'rgba(139, 92, 246, 0.3)' : 'transparent',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '6px',
              color: editor.isActive('strike') ? 'white' : 'var(--text-secondary)',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!editor.isActive('strike')) {
                e.target.style.background = 'rgba(139, 92, 246, 0.2)'
                e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)'
                e.target.style.color = 'white'
              }
            }}
            onMouseLeave={(e) => {
              if (!editor.isActive('strike')) {
                e.target.style.background = 'transparent'
                e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)'
                e.target.style.color = 'var(--text-secondary)'
              }
            }}
          >
            <Underline size={16} />
          </button>

          {/* Lista con viñetas */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'active' : ''}
            title="Lista con viñetas"
            style={{
              background: editor.isActive('bulletList') ? 'rgba(139, 92, 246, 0.3)' : 'transparent',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '6px',
              color: editor.isActive('bulletList') ? 'white' : 'var(--text-secondary)',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!editor.isActive('bulletList')) {
                e.target.style.background = 'rgba(139, 92, 246, 0.2)'
                e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)'
                e.target.style.color = 'white'
              }
            }}
            onMouseLeave={(e) => {
              if (!editor.isActive('bulletList')) {
                e.target.style.background = 'transparent'
                e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)'
                e.target.style.color = 'var(--text-secondary)'
              }
            }}
          >
            <List size={16} />
          </button>

          {/* Lista numerada */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'active' : ''}
            title="Lista numerada"
            style={{
              background: editor.isActive('orderedList') ? 'rgba(139, 92, 246, 0.3)' : 'transparent',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '6px',
              color: editor.isActive('orderedList') ? 'white' : 'var(--text-secondary)',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!editor.isActive('orderedList')) {
                e.target.style.background = 'rgba(139, 92, 246, 0.2)'
                e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)'
                e.target.style.color = 'white'
              }
            }}
            onMouseLeave={(e) => {
              if (!editor.isActive('orderedList')) {
                e.target.style.background = 'transparent'
                e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)'
                e.target.style.color = 'var(--text-secondary)'
              }
            }}
          >
            <ListOrdered size={16} />
          </button>

          {/* Cita */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? 'active' : ''}
            title="Cita"
            style={{
              background: editor.isActive('blockquote') ? 'rgba(139, 92, 246, 0.3)' : 'transparent',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '6px',
              color: editor.isActive('blockquote') ? 'white' : 'var(--text-secondary)',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!editor.isActive('blockquote')) {
                e.target.style.background = 'rgba(139, 92, 246, 0.2)'
                e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)'
                e.target.style.color = 'white'
              }
            }}
            onMouseLeave={(e) => {
              if (!editor.isActive('blockquote')) {
                e.target.style.background = 'transparent'
                e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)'
                e.target.style.color = 'var(--text-secondary)'
              }
            }}
          >
            <Quote size={16} />
          </button>

          {/* Color picker */}
          <div style={{ position: 'relative' }} ref={colorPickerRef}>
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Color de texto"
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
                    onClick={() => applyColor(color.value)}
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
      </div>

      {/* Editor content */}
      <div style={{
        minHeight: minHeight,
        maxHeight: maxHeight,
        overflowY: 'auto'
      }}>
        <EditorContent 
          editor={editor}
          style={{
            padding: '1rem',
            fontSize: '0.95rem',
            lineHeight: '1.6',
            color: 'white'
          }}
        />
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
          Editor WYSIWYG unificado. Atajos: Ctrl+B, Ctrl+I, Ctrl+Shift+X
        </span>
        <span>
          {editor.storage.characterCount?.characters() || value.length} caracteres
        </span>
      </div>

      {/* Estilos CSS específicos para el editor */}
      <style jsx global>{`
        .tiptap-editor-content {
          outline: none !important;
          padding: 1rem;
          font-size: 0.95rem;
          line-height: 1.6;
          color: white;
        }
        
        .tiptap-editor-content p {
          margin: 0.5rem 0;
        }
        
        .tiptap-editor-content p:first-child {
          margin-top: 0;
        }
        
        .tiptap-editor-content p:last-child {
          margin-bottom: 0;
        }
        
        .tiptap-editor-content h1, 
        .tiptap-editor-content h2, 
        .tiptap-editor-content h3 {
          margin: 1rem 0 0.5rem 0;
          font-weight: bold;
          color: var(--primary-light, #a78bfa);
        }
        
        .tiptap-editor-content h1 { font-size: 1.5rem; }
        .tiptap-editor-content h2 { font-size: 1.25rem; }
        .tiptap-editor-content h3 { font-size: 1.125rem; }
        
        .tiptap-editor-content ul, 
        .tiptap-editor-content ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        
        .tiptap-editor-content ul li, 
        .tiptap-editor-content ol li {
          margin: 0.25rem 0;
        }
        
        .tiptap-editor-content blockquote {
          margin: 1rem 0;
          padding-left: 1rem;
          border-left: 3px solid var(--primary, #8b5cf6);
          color: var(--text-secondary, #e5e7eb);
          font-style: italic;
        }
        
        .tiptap-editor-content [data-placeholder]::before {
          content: attr(data-placeholder);
          color: var(--text-disabled, #6b7280);
          pointer-events: none;
          height: 0;
          float: left;
        }
        
        .tiptap-editor-content strong {
          font-weight: bold;
        }
        
        .tiptap-editor-content em {
          font-style: italic;
        }
        
        .tiptap-editor-content s {
          text-decoration: line-through;
        }
      `}</style>
    </div>
  )
}

export default TiptapEditor