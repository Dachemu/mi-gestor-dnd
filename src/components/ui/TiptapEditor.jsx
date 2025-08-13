import React, { Suspense, lazy } from 'react'

const TiptapEditorLazy = lazy(() => import('./TiptapEditorLazy'))

function TiptapEditor(props) {
  return (
    <Suspense fallback={
      <div style={{
        border: '1px solid #e0e7ff',
        borderRadius: '8px',
        minHeight: props.minHeight || '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9ca3af'
      }}>
        Cargando editor...
      </div>
    }>
      <TiptapEditorLazy {...props} />
    </Suspense>
  )
}

export default TiptapEditor