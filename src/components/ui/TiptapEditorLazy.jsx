import React, { useEffect, useState, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Bold, Italic, List, ListOrdered, Quote, Palette } from './LazyIcons'

const TiptapEditor = React.memo(function TiptapEditor({
  value = '',
  onChange,
  _placeholder = 'Escribe aquí...',
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
    },
    onBlur: () => {
    },
  })

  const [showColorPicker, setShowColorPicker] = useState(false)
  const colorPickerRef = useRef(null)

  useEffect(() => {
    if (!editor) return
    
    const currentContent = editor.getHTML()
    if (value !== currentContent) {
      // Prevenir loops infinitos y problemas de sincronización
      try {
        editor.commands.setContent(value || '')
      } catch (error) {
        console.warn('Error al actualizar contenido del editor:', error)
      }
    }
  }, [value, editor])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        setShowColorPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!editor) {
    return (
      <div style={{
        border: '1px solid #e0e7ff',
        borderRadius: '8px',
        minHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9ca3af'
      }}>
        Cargando editor...
      </div>
    )
  }

  const colors = [
    '#000000', '#991b1b', '#b45309', '#a16207', '#365314', 
    '#1e40af', '#7c2d12', '#7c3aed', '#ec4899', '#64748b'
  ]

  // Estilo común para botones de toolbar
  const getButtonStyle = (isActive) => ({
    padding: '8px 10px',
    border: '1px solid rgba(79, 70, 229, 0.3)',
    borderRadius: '6px',
    backgroundColor: isActive ? 'rgba(79, 70, 229, 0.3)' : 'transparent',
    color: isActive ? 'white' : 'rgba(255, 255, 255, 0.8)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    transition: 'all 0.2s ease'
  })

  const handleButtonHover = (e, isActive) => {
    if (!isActive) {
      e.target.style.backgroundColor = 'rgba(79, 70, 229, 0.2)'
      e.target.style.borderColor = 'rgba(79, 70, 229, 0.5)'
      e.target.style.color = 'white'
    }
  }

  const handleButtonLeave = (e, isActive) => {
    if (!isActive) {
      e.target.style.backgroundColor = 'transparent'
      e.target.style.borderColor = 'rgba(79, 70, 229, 0.3)'
      e.target.style.color = 'rgba(255, 255, 255, 0.8)'
    }
  }

  return (
    <div style={{
      border: '1px solid rgba(79, 70, 229, 0.2)',
      borderRadius: '12px',
      backgroundColor: 'rgba(31, 41, 55, 0.6)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        borderBottom: '1px solid rgba(79, 70, 229, 0.1)',
        padding: '12px 16px',
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        backgroundColor: 'rgba(31, 41, 55, 0.8)'
      }}>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          style={getButtonStyle(editor.isActive('bold'))}
          onMouseEnter={(e) => handleButtonHover(e, editor.isActive('bold'))}
          onMouseLeave={(e) => handleButtonLeave(e, editor.isActive('bold'))}
        >
          <Bold size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          style={getButtonStyle(editor.isActive('italic'))}
          onMouseEnter={(e) => handleButtonHover(e, editor.isActive('italic'))}
          onMouseLeave={(e) => handleButtonLeave(e, editor.isActive('italic'))}
        >
          <Italic size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          style={getButtonStyle(editor.isActive('bulletList'))}
          onMouseEnter={(e) => handleButtonHover(e, editor.isActive('bulletList'))}
          onMouseLeave={(e) => handleButtonLeave(e, editor.isActive('bulletList'))}
        >
          <List size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          style={getButtonStyle(editor.isActive('orderedList'))}
          onMouseEnter={(e) => handleButtonHover(e, editor.isActive('orderedList'))}
          onMouseLeave={(e) => handleButtonLeave(e, editor.isActive('orderedList'))}
        >
          <ListOrdered size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          style={getButtonStyle(editor.isActive('blockquote'))}
          onMouseEnter={(e) => handleButtonHover(e, editor.isActive('blockquote'))}
          onMouseLeave={(e) => handleButtonLeave(e, editor.isActive('blockquote'))}
        >
          <Quote size={16} />
        </button>

        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            style={getButtonStyle(showColorPicker)}
            onMouseEnter={(e) => handleButtonHover(e, showColorPicker)}
            onMouseLeave={(e) => handleButtonLeave(e, showColorPicker)}
          >
            <Palette size={16} />
          </button>

          {showColorPicker && (
            <div
              ref={colorPickerRef}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                zIndex: 1000,
                backgroundColor: 'rgba(15, 15, 25, 0.98)',
                border: '1px solid rgba(79, 70, 229, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(20px)',
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '6px',
                minWidth: '150px'
              }}
            >
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    editor.chain().focus().setColor(color).run()
                    setShowColorPicker(false)
                  }}
                  style={{
                    width: '24px',
                    height: '24px',
                    backgroundColor: color,
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

      <div style={{ 
        padding: '16px',
        minHeight: minHeight,
        maxHeight: maxHeight,
        overflowY: 'auto',
        backgroundColor: 'rgba(31, 41, 55, 0.4)'
      }}>
        <EditorContent 
          editor={editor}
          style={{
            color: 'white',
            fontSize: '14px',
            lineHeight: '1.6'
          }}
        />
      </div>
      
      {/* Estilos CSS globales para el contenido del editor */}
      <style jsx global>{`
        .tiptap-editor-content {
          outline: none !important;
          color: white !important;
          background: transparent !important;
        }
        
        .tiptap-editor-content p {
          margin: 0.5rem 0;
          color: white;
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
          color: #a78bfa;
        }
        
        .tiptap-editor-content ul, 
        .tiptap-editor-content ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
          color: white;
        }
        
        .tiptap-editor-content li {
          margin: 0.25rem 0;
          color: white;
        }
        
        .tiptap-editor-content blockquote {
          margin: 1rem 0;
          padding-left: 1rem;
          border-left: 3px solid #6366f1;
          color: #e5e7eb;
          font-style: italic;
        }
        
        .tiptap-editor-content strong {
          font-weight: bold;
          color: white;
        }
        
        .tiptap-editor-content em {
          font-style: italic;
          color: white;
        }
        
        .tiptap-editor-content [data-placeholder]::before {
          content: attr(data-placeholder);
          color: rgba(255, 255, 255, 0.5);
          pointer-events: none;
          height: 0;
          float: left;
        }
      `}</style>
    </div>
  )
})

export default TiptapEditor