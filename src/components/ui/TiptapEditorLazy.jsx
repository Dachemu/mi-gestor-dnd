import React, { useEffect, useState, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Bold, Italic, Underline, List, ListOrdered, Quote, Palette } from './LazyIcons'

const TiptapEditor = React.memo(function TiptapEditor({ 
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
    },
    onBlur: () => {
    },
  })

  const [showColorPicker, setShowColorPicker] = useState(false)
  const colorPickerRef = useRef(null)

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
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

  return (
    <div style={{
      border: '1px solid #e0e7ff',
      borderRadius: '8px',
      backgroundColor: '#ffffff',
      position: 'relative'
    }}>
      <div style={{
        borderBottom: '1px solid #e0e7ff',
        padding: '8px 12px',
        display: 'flex',
        gap: '4px',
        flexWrap: 'wrap',
        backgroundColor: '#f8fafc'
      }}>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          style={{
            padding: '6px 8px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: editor.isActive('bold') ? '#3b82f6' : 'transparent',
            color: editor.isActive('bold') ? 'white' : '#374151',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px'
          }}
        >
          <Bold size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          style={{
            padding: '6px 8px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: editor.isActive('italic') ? '#3b82f6' : 'transparent',
            color: editor.isActive('italic') ? 'white' : '#374151',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px'
          }}
        >
          <Italic size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          style={{
            padding: '6px 8px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: editor.isActive('bulletList') ? '#3b82f6' : 'transparent',
            color: editor.isActive('bulletList') ? 'white' : '#374151',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px'
          }}
        >
          <List size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          style={{
            padding: '6px 8px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: editor.isActive('orderedList') ? '#3b82f6' : 'transparent',
            color: editor.isActive('orderedList') ? 'white' : '#374151',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px'
          }}
        >
          <ListOrdered size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          style={{
            padding: '6px 8px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: editor.isActive('blockquote') ? '#3b82f6' : 'transparent',
            color: editor.isActive('blockquote') ? 'white' : '#374151',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px'
          }}
        >
          <Quote size={16} />
        </button>

        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            style={{
              padding: '6px 8px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: showColorPicker ? '#3b82f6' : 'transparent',
              color: showColorPicker ? 'white' : '#374151',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              fontSize: '14px'
            }}
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
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '4px',
                minWidth: '120px'
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
                    width: '20px',
                    height: '20px',
                    backgroundColor: color,
                    border: '1px solid #e5e7eb',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '12px' }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
})

export default TiptapEditor