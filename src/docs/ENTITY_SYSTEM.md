# 🏗️ Sistema de Entidades - Arquitectura

## Descripción General

El sistema de entidades de Mi Gestor D&D es un framework flexible y extensible que permite gestionar diferentes tipos de elementos de una campaña (jugadores, NPCs, objetos, etc.) de manera uniforme y escalable.

## 🎯 Principios de Diseño

### 1. **Configuración Centralizada**
Todas las entidades se definen en un archivo central de configuración que especifica:
- Esquemas de formulario
- Campos de visualización  
- Secciones de detalles
- Colores y estilos
- Validaciones

### 2. **Componentes Universales**
Un conjunto de componentes genéricos que pueden manejar cualquier tipo de entidad:
- `EntityManager`: Gestor universal de entidades
- `UniversalDetails`: Vista de detalles universal
- `DynamicForm`: Formulario dinámico basado en esquemas

### 3. **Hooks Reutilizables**
Lógica compartida encapsulada en hooks personalizados:
- `useCRUD`: Operaciones CRUD uniformes
- `useSearch`: Búsqueda global
- `useConnections`: Sistema de conexiones

## 📋 Configuración de Entidades

### Estructura Base

```javascript
export const ENTITY_CONFIGS = {
  entityKey: {
    // Metadatos básicos
    key: 'entityKey',
    name: 'Nombre Singular',
    pluralName: 'Nombre Plural',
    icon: '🎯',
    description: 'Descripción de la entidad',
    
    // Esquema de campos
    schema: ENTITY_SCHEMAS.entityKey,
    
    // Configuración de visualización
    displayFields: {
      primary: 'fieldName',      // Campo principal (título)
      secondary: ['field1', 'field2'], // Campos secundarios
      status: 'statusField',     // Campo de estado/badge
      description: 'descField'   // Campo de descripción
    },
    
    // Secciones en vista de detalles
    detailSections: [
      {
        title: 'Información básica',
        fields: ['field1', 'field2'],
        render: 'default' // 'default', 'stats', 'html'
      }
    ],
    
    // Configuración de colores
    colors: {
      statusField: {
        'value1': '#color1',
        'value2': '#color2'
      }
    }
  }
}
```

### Tipos de Esquemas

#### Campo de Texto
```javascript
fieldName: {
  type: 'text',
  required: true,
  label: 'Etiqueta del Campo',
  placeholder: 'Texto de ejemplo'
}
```

#### Campo de Selección
```javascript
fieldName: {
  type: 'select',
  label: 'Seleccionar Opción',
  options: ['Opción 1', 'Opción 2', 'Opción 3'],
  defaultValue: 'Opción 1'
}
```

#### Campo Numérico
```javascript
fieldName: {
  type: 'number',
  label: 'Número',
  min: 1,
  max: 20,
  defaultValue: '1'
}
```

#### Campo de Texto Enriquecido
```javascript
fieldName: {
  type: 'richtext',
  label: 'Descripción Detallada',
  placeholder: 'Contenido HTML...',
  minHeight: '300px'
}
```

#### Campo de Área de Texto
```javascript
fieldName: {
  type: 'textarea',
  label: 'Descripción',
  placeholder: 'Descripción larga...'
}
```

## 🔄 Flujo de Datos

### 1. Inicialización
```
CampaignDashboard
  ↓
EntityManager (con entityType)
  ↓
useCRUD (con config de entidad)
  ↓
Componentes UI universales
```

### 2. Operaciones CRUD

#### Crear Nueva Entidad
```
1. Usuario → openCreateForm()
2. DynamicForm → renderiza según schema
3. Usuario → completa formulario
4. handleSave() → valida y crea
5. Actualiza estado local
6. Notificación de éxito
```

#### Editar Entidad Existente
```
1. Usuario → selecciona entidad
2. UniversalDetails → muestra detalles
3. Usuario → click "Editar"
4. DynamicForm → pre-populate con datos
5. handleSave() → actualiza entidad
6. Sincroniza vista de detalles
```

#### Eliminar Entidad
```
1. Usuario → click "Eliminar"
2. Confirmación → window.confirm()
3. handleDelete() → remueve del estado
4. Actualiza UI automáticamente
```

### 3. Sistema de Conexiones

```
ConnectionModal
  ↓
useConnections hook
  ↓
Almacena en linkedItems: {
    locations: ['id1', 'id2'],
    players: ['id3'],
    npcs: [],
    quests: ['id4'],
    objects: ['id5', 'id6'],
    notes: []
  }
```

## 🧩 Componentes del Sistema

### EntityManager
**Propósito**: Componente gestor universal para cualquier tipo de entidad

**Props**:
```javascript
{
  entityType: 'players',    // Tipo de entidad
  items: [],               // Array de elementos
  onItemsChange: fn,       // Callback para cambios
  campaign: {},            // Datos completos de campaña
  onNavigate: fn          // Navegación entre entidades
}
```

**Responsabilidades**:
- Renderizar lista de entidades
- Manejar formularios de creación/edición
- Gestionar selección y detalles
- Integrar sistema de conexiones

### UniversalDetails
**Propósito**: Vista de detalles universal basada en configuración

**Características**:
- Renderizado dinámico según `detailSections`
- Soporte para diferentes tipos de render:
  - `default`: Campos simples
  - `stats`: Vista de estadísticas
  - `html`: Contenido HTML enriquecido
- Integración con sistema de conexiones

### DynamicForm
**Propósito**: Formulario dinámico generado desde esquemas

**Características**:
- Renderizado automático de campos
- Validación integrada
- Soporte para todos los tipos de campo
- Agrupación en secciones
- Manejo de iconos personalizados

## 🔍 Hook useCRUD

### Estado Gestionado
```javascript
{
  items: [],              // Lista de entidades
  showForm: false,        // Estado del formulario
  editingItem: null,      // Entidad en edición
  selectedItem: null,     // Entidad seleccionada
  isEmpty: boolean        // Lista vacía
}
```

### Métodos Principales
```javascript
{
  // CRUD Operations
  handleSave: (data) => {},     // Crear/Actualizar
  handleDelete: (id, name) => {}, // Eliminar
  
  // UI State
  selectItem: (item) => {},     // Seleccionar para detalles
  openCreateForm: () => {},     // Abrir formulario nuevo
  openEditForm: (item) => {},   // Abrir formulario edición
  closeForm: () => {},          // Cerrar formulario
  closeDetails: () => {},       // Cerrar detalles
  
  // Utilities
  showNotification: (msg) => {}, // Mostrar notificación
  NotificationComponent: </>     // Componente de notificación
}
```

### Características Avanzadas

#### Sincronización Automática
```javascript
// Sincroniza con datos externos
useEffect(() => {
  setItems(initialData || [])
}, [initialData])

// Actualiza selectedItem si cambia
useEffect(() => {
  if (selectedItem && initialData) {
    const updated = initialData.find(item => item.id === selectedItem.id)
    if (updated) setSelectedItem(updated)
  }
}, [initialData, selectedItem?.id])
```

#### Inicialización de linkedItems
```javascript
const ensureLinkedItems = (item) => {
  if (!item.linkedItems) {
    return {
      ...item,
      linkedItems: {
        locations: [], players: [], npcs: [],
        quests: [], objects: [], notes: []
      }
    }
  }
  return item
}
```

## 🎨 Sistema de Estilos

### Colores Dinámicos
Las entidades pueden definir funciones de color para campos específicos:

```javascript
colors: {
  level: (level) => {
    const levelNum = parseInt(level)
    if (levelNum >= 15) return '#ff6b35'    // Legendario
    if (levelNum >= 10) return '#8b5cf6'    // Épico
    if (levelNum >= 5) return '#3b82f6'     // Raro
    return '#10b981'                        // Común
  },
  
  status: {
    'Completada': '#10b981',   // Verde
    'En progreso': '#f59e0b',  // Amarillo
    'Pendiente': '#6b7280',    // Gris
    'Fallida': '#ef4444'       // Rojo
  }
}
```

## 🔧 Extensibilidad

### Agregar Nueva Entidad

1. **Definir Esquema**:
```javascript
// En ENTITY_SCHEMAS
newEntity: {
  name: { type: 'text', required: true, label: 'Nombre' },
  category: { 
    type: 'select', 
    options: ['Cat1', 'Cat2'],
    label: 'Categoría' 
  }
}
```

2. **Configurar Entidad**:
```javascript
// En ENTITY_CONFIGS
newEntity: {
  key: 'newEntity',
  name: 'Nueva Entidad',
  pluralName: 'Nuevas Entidades',
  icon: '⭐',
  schema: ENTITY_SCHEMAS.newEntity,
  displayFields: {
    primary: 'name',
    secondary: ['category']
  }
}
```

3. **Integrar en Dashboard**:
```javascript
// CampaignDashboard automáticamente detecta la nueva entidad
// No requiere cambios adicionales
```

### Personalizar Renderizado

#### Custom Field Renderer
```javascript
// En DynamicForm, agregar nuevo tipo
if (field.type === 'custom') {
  return <CustomFieldComponent key={fieldName} {...field} />
}
```

#### Custom Detail Section
```javascript
// En UniversalDetails
if (section.render === 'custom') {
  return <CustomSectionComponent data={item} fields={section.fields} />
}
```

## 🧪 Testing del Sistema

### Tests de Configuración
```javascript
describe('Entity Configuration', () => {
  it('should have valid config for all entities', () => {
    Object.values(ENTITY_CONFIGS).forEach(config => {
      expect(config.key).toBeDefined()
      expect(config.schema).toBeDefined()
      expect(config.displayFields).toBeDefined()
    })
  })
})
```

### Tests de useCRUD
```javascript
describe('useCRUD Hook', () => {
  it('should create entity with linkedItems', () => {
    const { result } = renderHook(() => useCRUD([], 'test'))
    
    act(() => {
      result.current.handleSave({ name: 'Test Entity' })
    })
    
    expect(result.current.items[0].linkedItems).toBeDefined()
  })
})
```

### Tests de Componentes
```javascript
describe('EntityManager', () => {
  it('should render entity list', () => {
    render(
      <EntityManager 
        entityType="players" 
        items={mockPlayers}
        onItemsChange={jest.fn()}
      />
    )
    
    expect(screen.getByText('Jugadores')).toBeInTheDocument()
  })
})
```

## 📈 Performance

### Optimizaciones Implementadas

1. **Memoización de Búsqueda**:
   - `useMemo` para resultados de búsqueda
   - Debounce de 300ms para input

2. **Renderizado Condicional**:
   - Solo renderiza detalles cuando hay selección
   - Lazy loading de formularios

3. **Estado Optimizado**:
   - Evita re-renders innecesarios
   - Sincronización selectiva de datos

### Consideraciones de Escalabilidad

- **Límite de Resultados**: Búsqueda limitada a 10 resultados
- **Paginación Virtual**: Para listas muy largas (futuro)
- **Lazy Loading**: Cargar entidades bajo demanda (futuro)

## 🚀 Roadmap

### Futuras Mejoras

1. **Validación Avanzada**:
   - Reglas de validación custom
   - Validación async
   - Mensajes de error personalizados

2. **Campos Especializados**:
   - Campo de imagen/avatar
   - Campo de fecha/hora avanzado
   - Campo de ubicación con mapa

3. **Relaciones Complejas**:
   - Relaciones many-to-many
   - Dependencias entre campos
   - Validación de integridad referencial

4. **Performance**:
   - Virtualización de listas
   - Carga incremental
   - Cache inteligente

Este sistema de entidades proporciona una base sólida y extensible para gestionar cualquier tipo de elemento en una campaña de D&D, manteniendo consistencia en la UI y simplificando el desarrollo de nuevas funcionalidades.