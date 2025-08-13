import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    
    // Log del error para debugging
    console.error('ErrorBoundary capturó un error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          background: 'rgba(31, 41, 55, 0.8)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          color: 'white',
          maxWidth: '500px',
          margin: '2rem auto'
        }}>
          <h2 style={{ 
            color: '#ef4444', 
            marginBottom: '1rem',
            fontSize: '1.5rem'
          }}>
            ⚠️ Algo salió mal
          </h2>
          <p style={{ 
            marginBottom: '1.5rem',
            color: '#e5e7eb'
          }}>
            La aplicación encontró un error inesperado. Por favor, recarga la página.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            🔄 Recargar Página
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary