# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir a Mi Gestor D&D! Esta guía te ayudará a empezar.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo Contribuir?](#¿cómo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Convenciones de Código](#convenciones-de-código)
- [Process de Pull Request](#proceso-de-pull-request)
- [Reporting Issues](#reporting-issues)
- [Desarrollo de Features](#desarrollo-de-features)

## 📜 Código de Conducta

Este proyecto se adhiere al [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/). Al participar, se espera que mantengas este código.

### Nuestros Estándares

**Comportamientos que contribuyen a crear un ambiente positivo:**
- Usar lenguaje inclusivo y acogedor
- Ser respetuoso con diferentes puntos de vista
- Aceptar crítica constructiva de manera profesional
- Enfocarse en lo que es mejor para la comunidad
- Mostrar empatía hacia otros miembros

**Comportamientos inaceptables:**
- Uso de lenguaje o imágenes sexualizadas
- Trolling, comentarios insultantes o ataques personales
- Acoso público o privado
- Publicar información privada sin permiso

## 🚀 ¿Cómo Contribuir?

### Tipos de Contribuciones

1. **🐛 Reportar Bugs**
   - Usa los templates de issues
   - Incluye pasos detallados para reproducir
   - Añade capturas de pantalla si es útil

2. **💡 Sugerir Features**
   - Describe claramente el problema que resuelve
   - Explica por qué sería útil para otros usuarios
   - Considera la compatibilidad con la arquitectura actual

3. **📚 Mejorar Documentación**
   - Corregir typos o errores
   - Añadir ejemplos o clarificaciones
   - Traducir documentación

4. **💻 Contribuir Código**
   - Fixes de bugs
   - Nuevas funcionalidades
   - Mejoras de performance
   - Refactoring

## ⚙️ Configuración del Entorno

### Prerrequisitos

```bash
# Versiones requeridas
Node.js: 16.0.0+
npm: 8.0.0+
git: 2.0.0+
```

### Setup Local

```bash
# 1. Fork el repositorio en GitHub

# 2. Clonar tu fork
git clone https://github.com/TU-USERNAME/mi-gestor-dnd.git
cd mi-gestor-dnd

# 3. Agregar el repositorio original como upstream
git remote add upstream https://github.com/ORIGINAL-OWNER/mi-gestor-dnd.git

# 4. Instalar dependencias
npm install

# 5. Verificar que todo funciona
npm run dev
npm run test
npm run build
```

### Estructura de Branches

```
main                 # Rama principal estable
├── feature/xxx      # Nuevas funcionalidades
├── fix/xxx         # Correcciones de bugs
├── docs/xxx        # Mejoras de documentación
└── refactor/xxx    # Refactoring de código
```

## 📝 Convenciones de Código

### Estilo de Código

#### JavaScript/React
```javascript
// ✅ Bueno
import React, { useState, useEffect } from 'react'
import { generateId } from '../services/storage'

const MyComponent = ({ prop1, prop2 }) => {
  const [state, setState] = useState(null)
  
  useEffect(() => {
    // Effect logic
  }, [dependency])

  const handleAction = (data) => {
    // Handler logic
  }

  return (
    <div className={styles.container}>
      <h1>{prop1}</h1>
    </div>
  )
}

export { MyComponent }
```

#### CSS Modules
```css
/* ✅ Bueno - MyComponent.module.css */
.container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* Use kebab-case for class names */
.primary-button {
  background: var(--color-primary);
  border-radius: 0.5rem;
}
```

### Convenciones de Naming

#### Archivos y Directorios
```
PascalCase    → Componentes React (MyComponent.jsx)
camelCase     → Hooks y utilidades (useMyHook.js)
kebab-case    → CSS modules (my-component.module.css)
UPPER_CASE    → Constantes (ENTITY_CONFIGS.js)
lowercase     → Directorios (components, hooks, utils)
```

#### Variables y Funciones
```javascript
// ✅ Bueno
const userName = 'john'                    // camelCase
const API_ENDPOINT = 'https://api.com'     // UPPER_CASE constants
const handleSubmit = () => {}              // camelCase functions
const isLoggedIn = true                    // boolean prefixes: is, has, can

// ❌ Malo
const user_name = 'john'                   // snake_case
const apiEndpoint = 'https://api.com'      // constants should be UPPER_CASE
const submitHandler = () => {}             // use handle prefix
```

### Convenciones de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Formato
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Tipos de Commit
```bash
feat:     # Nueva funcionalidad
fix:      # Corrección de bug
docs:     # Cambios en documentación
style:    # Cambios de formato (sin afectar funcionalidad)
refactor: # Refactoring de código
test:     # Añadir o modificar tests
chore:    # Tareas de mantenimiento
perf:     # Mejoras de performance
ci:       # Cambios en CI/CD
```

#### Ejemplos de Commits
```bash
# ✅ Buenos commits
feat(entities): add support for custom entity types
fix(search): resolve case sensitivity issue in global search
docs(readme): update installation instructions
refactor(hooks): extract common CRUD logic to reusable hook
test(useCRUD): add comprehensive test coverage
style(components): apply consistent spacing and formatting

# ❌ Commits malos
fixed bug                           # No especifica qué bug
Added new feature                   # No especifica qué feature
Update code                         # Muy vago
feat: a lot of changes              # Demasiado amplio
```

### Documentación de Código

#### JSDoc para Funciones
```javascript
/**
 * Crea una nueva entidad con los datos proporcionados
 * @param {Object} entityData - Datos de la entidad
 * @param {string} entityData.name - Nombre de la entidad
 * @param {string} entityData.type - Tipo de entidad
 * @param {Object} options - Opciones adicionales
 * @param {boolean} options.validate - Si validar los datos
 * @returns {Object} La entidad creada con ID generado
 * @throws {Error} Si los datos son inválidos
 */
const createEntity = (entityData, options = {}) => {
  // Implementation
}
```

#### Comentarios en Componentes
```javascript
/**
 * EntityManager - Componente universal para gestionar entidades
 * 
 * Características:
 * - CRUD operations para cualquier tipo de entidad
 * - Sistema de búsqueda integrado
 * - Conexiones entre entidades
 * 
 * @param {string} entityType - Tipo de entidad ('players', 'npcs', etc.)
 * @param {Array} items - Array de elementos de la entidad
 * @param {Function} onItemsChange - Callback cuando cambian los items
 * @param {Object} campaign - Datos completos de la campaña
 */
const EntityManager = ({ entityType, items, onItemsChange, campaign }) => {
  // Component implementation
}
```

## 🔄 Proceso de Pull Request

### Antes de Crear el PR

1. **Sync con upstream**:
```bash
git fetch upstream
git checkout main
git merge upstream/main
```

2. **Crear feature branch**:
```bash
git checkout -b feature/mi-nueva-funcionalidad
```

3. **Desarrollar y testear**:
```bash
# Hacer cambios
npm run test          # Asegurar tests pasan
npm run build         # Verificar build
npm run dev           # Probar manualmente
```

4. **Commit cambios**:
```bash
git add .
git commit -m "feat(scope): descripción clara"
```

### Crear el Pull Request

1. **Push a tu fork**:
```bash
git push origin feature/mi-nueva-funcionalidad
```

2. **Crear PR en GitHub** con:
   - **Título claro**: Resumen de los cambios
   - **Descripción detallada**:
     ```markdown
     ## 📝 Descripción
     Breve descripción de los cambios

     ## 🎯 Motivación
     Por qué son necesarios estos cambios

     ## 🧪 Testing
     - [ ] Tests unitarios pasan
     - [ ] Tests de integración pasan
     - [ ] Probado manualmente

     ## 📸 Screenshots
     Si aplica, añadir capturas de pantalla

     ## ✅ Checklist
     - [ ] Código sigue las convenciones del proyecto
     - [ ] Tests añadidos/actualizados
     - [ ] Documentación actualizada
     - [ ] Sin breaking changes o están documentados
     ```

### Review Process

1. **Automated Checks**: CI/CD ejecutará tests automáticamente
2. **Code Review**: Mantainers revisarán el código
3. **Feedback**: Responde a comentarios y haz cambios si es necesario
4. **Approval**: Una vez aprobado, será merged

### Después del Merge

```bash
# Limpiar branches locales
git checkout main
git pull upstream main
git branch -d feature/mi-nueva-funcionalidad

# Actualizar tu fork
git push origin main
```

## 🐛 Reporting Issues

### Bug Reports

Usa el template de bug report con:

```markdown
## 🐛 Descripción del Bug
Descripción clara del problema

## 🔄 Pasos para Reproducir
1. Ir a '...'
2. Hacer click en '...'
3. Scrollear hasta '...'
4. Ver error

## ✅ Comportamiento Esperado
Qué debería pasar

## ❌ Comportamiento Actual
Qué está pasando

## 📱 Entorno
- OS: [e.g. iOS]
- Browser: [e.g. chrome, safari]
- Version: [e.g. 22]

## 📸 Screenshots
Si aplica, añadir capturas

## 📋 Información Adicional
Cualquier contexto adicional
```

### Feature Requests

```markdown
## 💡 Feature Request

## 🎯 Problema a Resolver
Descripción del problema que la feature resolvería

## 💭 Solución Propuesta
Descripción clara de la funcionalidad deseada

## 🔄 Alternativas Consideradas
Otras soluciones evaluadas

## 📋 Información Adicional
Contexto adicional, mockups, ejemplos
```

## 🛠️ Desarrollo de Features

### Arquitectura del Proyecto

Antes de empezar, familiarízate con:

1. **[Sistema de Entidades](src/docs/ENTITY_SYSTEM.md)**: Arquitectura core
2. **Hooks Personalizados**: Lógica compartida
3. **Componentes Base**: UI consistente
4. **Configuración Centralizada**: entityTypes.js

### Agregar Nueva Entidad

```javascript
// 1. Definir esquema en config/entityTypes.js
export const ENTITY_SCHEMAS = {
  myEntity: {
    name: { type: 'text', required: true, label: 'Nombre' },
    category: { 
      type: 'select', 
      options: ['Cat1', 'Cat2'],
      defaultValue: 'Cat1' 
    }
  }
}

// 2. Configurar entidad
export const ENTITY_CONFIGS = {
  myEntity: {
    key: 'myEntity',
    name: 'Mi Entidad',
    pluralName: 'Mis Entidades',
    icon: '⭐',
    schema: ENTITY_SCHEMAS.myEntity,
    displayFields: {
      primary: 'name',
      secondary: ['category']
    }
  }
}

// 3. ¡Listo! El dashboard lo detectará automáticamente
```

### Crear Componente Base

```javascript
// components/ui/base/MyBase.jsx
import React from 'react'
import styles from './MyBase.module.css'

/**
 * MyBase - Componente base reutilizable
 * @param {string} variant - Variante visual
 * @param {string} size - Tamaño del componente
 * @param {boolean} disabled - Estado deshabilitado
 */
export const MyBase = ({ 
  variant = 'default',
  size = 'md',
  disabled = false,
  children,
  ...props 
}) => {
  const className = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled
  ].filter(Boolean).join(' ')

  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}
```

### Testing Guidelines

```javascript
// __tests__/MyComponent.test.js
import { render, screen, fireEvent } from '@testing-library/react'
import { MyComponent } from '../MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('should handle user interactions', () => {
    const mockHandler = jest.fn()
    render(<MyComponent onAction={mockHandler} />)
    
    fireEvent.click(screen.getByRole('button'))
    expect(mockHandler).toHaveBeenCalledTimes(1)
  })

  it('should handle edge cases', () => {
    render(<MyComponent items={[]} />)
    expect(screen.getByText('No items found')).toBeInTheDocument()
  })
})
```

## 🏆 Reconocimiento

### Contributors

Todos los contributors serán reconocidos en:
- README.md del proyecto
- Releases notes
- Contributors page

### Tipos de Contribución

Reconocemos todos los tipos de contribución:
- 💻 Código
- 📖 Documentación  
- 🐛 Bug reports
- 💡 Ideas
- 🎨 Diseño
- ⚠️ Tests
- 🌍 Traducción

### Proceso de Review

1. **Respeto mutuo**: Todos los feedback son constructivos
2. **Paciencia**: Reviews pueden tomar tiempo
3. **Aprendizaje**: Oportunidad de mejorar para todos
4. **Colaboración**: Trabajamos juntos hacia el mejor resultado

## 🤔 ¿Preguntas?

- 💬 **Discusiones**: [GitHub Discussions](https://github.com/usuario/mi-gestor-dnd/discussions)
- 📧 **Email directo**: tu-email@ejemplo.com
- 🐛 **Issues**: Para bugs y feature requests

¡Gracias por contribuir a hacer Mi Gestor D&D mejor para toda la comunidad! 🎲⚔️