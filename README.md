# 🐉 Mi Gestor D&D

Un gestor de campañas moderno y completo para Dungeons & Dragons, construido con React y Vite.

## 📖 Tabla de Contenidos

- [Características](#-características)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Arquitectura](#-arquitectura)
- [Testing](#-testing)
- [Desarrollo](#-desarrollo)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

## ✨ Características

### 🎯 Gestión Completa de Campañas
- **Jugadores**: Gestiona personajes con estadísticas, clases, razas y trasfondos
- **NPCs**: Organiza personajes no jugadores con roles y actitudes
- **Lugares**: Administra ubicaciones con importancia y descripciones detalladas
- **Objetos**: Cataloga armas, armaduras, objetos mágicos y tesoros
- **Misiones**: Rastrea objetivos, estados y recompensas
- **Notas**: Sistema de apuntes organizados por categorías

### 🔗 Sistema de Conexiones
- Vincula entidades entre sí (jugadores con lugares, NPCs con objetos, etc.)
- Visualización intuitiva de relaciones
- Navegación rápida entre elementos conectados

### 🔍 Búsqueda Global
- Busca instantáneamente en todos los tipos de entidades
- Resultados en tiempo real con destacado
- Filtros por tipo de entidad

### ☁️ Sincronización con Google Drive
- Sincronización automática con tu Google Drive personal
- Tus campañas se guardan de forma segura en la nube
- Accede a tus datos desde cualquier dispositivo
- Sistema de resolución de conflictos inteligente
- [Ver guía de configuración](GOOGLE_DRIVE_SETUP.md)

### 💾 Persistencia Local
- Guarda automáticamente todos los cambios en localStorage
- Funciona completamente offline
- Exportación e importación de campañas en formato JSON

### 🎨 Interfaz Moderna
- Diseño responsivo y atractivo
- Animaciones suaves y efectos visuales
- Modo oscuro integrado
- Componentes reutilizables

## 🚀 Instalación

### Prerrequisitos
- Node.js 16+ 
- npm o yarn

### Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/mi-gestor-dnd.git
cd mi-gestor-dnd

# Instalar dependencias
npm install

# Configurar Google Drive (OPCIONAL - ver GOOGLE_DRIVE_SETUP.md)
# Copia .env.example a .env y agrega tus credenciales
cp .env.example .env
# Edita .env con tus credenciales de Google Cloud Console

# Iniciar servidor de desarrollo
npm run dev
```

El servidor se iniciará en `http://127.0.0.1:4000`

**Nota:** La aplicación funciona perfectamente sin Google Drive. La sincronización en la nube es completamente opcional.

### Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo

# Producción
npm run build        # Construir para producción

# Testing
npm run test         # Ejecutar tests
npm run test:watch   # Tests en modo watch
npm run test:coverage # Tests con coverage
```

## 📝 Uso

### Crear una Nueva Campaña

1. **Inicio**: Al abrir la aplicación, verás el selector de campañas
2. **Nueva Campaña**: Haz clic en "Nueva Campaña"
3. **Configurar**: Completa nombre, descripción y configuración inicial
4. **¡A jugar!**: Accede al dashboard de tu campaña

### Gestionar Entidades

#### Jugadores
```
Información básica: nombre, jugador, clase, raza, nivel
Estadísticas: HP, CA, velocidad
Historia: trasfondo detallado y conexiones
```

#### NPCs
```
Identidad: nombre, rol, ubicación habitual
Comportamiento: actitud hacia los jugadores
Detalles: motivaciones, secretos, conexiones
```

#### Objetos
```
Propiedades: nombre, tipo, rareza
Ubicación: propietario actual, dónde se encuentra
Descripción: historia, propiedades mágicas
```

### Conectar Entidades

1. Selecciona cualquier entidad
2. Haz clic en "🔗 Gestionar Conexiones"
3. Selecciona las entidades a conectar
4. Las conexiones aparecerán en los detalles

### Búsqueda y Navegación

- Usa la barra de búsqueda global en la parte superior
- Filtra por tipo de entidad en cada sección
- Navega usando las conexiones entre entidades

## 🏗️ Arquitectura

### Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── features/       # Componentes de funcionalidad
│   ├── layout/         # Componentes de diseño
│   └── ui/            # Componentes de interfaz
│       └── base/      # Componentes base reutilizables
├── config/            # Configuración de entidades
├── hooks/             # Hooks personalizados
├── pages/             # Páginas principales
├── services/          # Servicios (storage, etc.)
├── utils/             # Utilidades
└── styles/           # Estilos globales
```

### Patrones de Diseño

#### Sistema de Entidades Dinámico
```javascript
// Configuración centralizada
export const ENTITY_CONFIGS = {
  players: {
    name: 'Jugador',
    icon: '👥',
    schema: { /* esquema de campos */ },
    displayFields: { /* campos a mostrar */ }
  }
  // ... más entidades
}
```

#### Hook CRUD Universal
```javascript
// Reutilizable para todas las entidades
const {
  items, handleSave, handleDelete,
  showForm, openCreateForm, selectItem
} = useCRUD(initialData, 'jugador', config)
```

#### Componentes Base
- **BaseButton**: Botones consistentes con múltiples variantes
- **BaseCard**: Tarjetas reutilizables
- **BaseInput**: Inputs con validación integrada
- **BaseModal**: Modales responsivos

### Tecnologías

- **React 19**: Framework principal
- **Vite**: Build tool y servidor de desarrollo
- **CSS Modules**: Estilos encapsulados
- **Lucide React**: Librería de iconos
- **Jest + RTL**: Testing

## 🧪 Testing

### Cobertura de Tests

- ✅ **Hooks personalizados**: useCRUD, useSearch, useDebounce
- ✅ **Utilidades**: funciones de debounce, helpers
- ✅ **Componentes base**: BaseButton, BaseInput, etc.
- ✅ **Integración**: flujos completos de usuario

### Ejecutar Tests

```bash
# Tests unitarios
npm run test

# Tests en modo watch (desarrollo)
npm run test:watch

# Coverage completo
npm run test:coverage
```

### Estructura de Tests

```
src/
├── hooks/__tests__/
├── utils/__tests__/
├── components/__tests__/
└── setupTests.js
```

## 🛠️ Desarrollo

### Agregar Nueva Entidad

1. **Configuración**: Añadir en `config/entityTypes.js`
```javascript
export const ENTITY_CONFIGS = {
  // ... entidades existentes
  newEntity: {
    key: 'newEntity',
    name: 'Nueva Entidad',
    schema: { /* campos del formulario */ },
    displayFields: { /* campos a mostrar */ }
  }
}
```

2. **Integración**: La entidad aparecerá automáticamente en el dashboard

### Crear Componente Base

```javascript
// components/ui/base/NewBase.jsx
import React from 'react'
import styles from './NewBase.module.css'

export function NewBase({ variant = 'default', ...props }) {
  return (
    <div className={`${styles.base} ${styles[variant]}`} {...props}>
      {props.children}
    </div>
  )
}
```

### Debugging

```javascript
import { debug, error } from '../utils/logger'

// En desarrollo, mostrará logs
debug('Información de debug')
error('Error importante')
```

## 🤝 Contribuir

### Proceso de Contribución

1. **Fork** del proyecto
2. **Crear rama** para tu feature: `git checkout -b feature/nueva-funcionalidad`
3. **Commit** tus cambios: `git commit -m 'Add: nueva funcionalidad'`
4. **Push** a la rama: `git push origin feature/nueva-funcionalidad`
5. **Pull Request**

### Convenciones

#### Commits
```
feat: nueva funcionalidad
fix: corrección de bug
refactor: refactorización
docs: documentación
test: tests
style: estilos
```

#### Código
- Usar hooks personalizados para lógica compartida
- Componentes base para UI consistente
- CSS Modules para estilos encapsulados
- Tests para nueva funcionalidad

### Issues y Bugs

- Usa los templates de issues
- Incluye pasos para reproducir bugs
- Proporciona capturas de pantalla si es relevante

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 🙋‍♂️ Soporte

¿Tienes preguntas o problemas?

- 📧 **Email**: tu-email@ejemplo.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/tu-usuario/mi-gestor-dnd/issues)
- 💬 **Discusiones**: [GitHub Discussions](https://github.com/tu-usuario/mi-gestor-dnd/discussions)

---

**¡Que tengas aventuras épicas! 🎲⚔️**