# Todo App Frontend - React 18

Frontend moderno y profesional para la aplicación TODO construido con las últimas tecnologías de React.

## Tecnologías

- **React 18** - Biblioteca UI moderna
- **Vite** - Build tool ultra rápido
- **React Router 6** - Navegación y rutas
- **TanStack Query** - Manejo de estado del servidor
- **Tailwind CSS** - Framework CSS utility-first
- **Axios** - Cliente HTTP
- **React Hook Form** - Formularios eficientes
- **Zod** - Validación de esquemas
- **Recharts** - Gráficos modernos y responsive
- **Lucide React** - Iconos modernos
- **date-fns** - Manipulación de fechas

## Características

- Autenticación completa (Login/Register)
- Dashboard interactivo con estadísticas
- Gráficos modernos (barras y pie)
- Filtrado avanzado de tareas
- CRUD completo de tareas
- Validación robusta de formularios
- Rutas protegidas
- Diseño responsive
- UI moderna con Tailwind CSS
- Manejo de estado optimizado con React Query
- Experiencia de usuario fluida

## Estructura del Proyecto

```
src/
├── api/                 # Configuración de Axios y servicios API
├── components/
│   ├── auth/           # Componentes de autenticación
│   ├── charts/         # Componentes de gráficos
│   ├── common/         # Componentes reutilizables (Input, Button, Modal, etc)
│   └── tasks/          # Componentes de tareas
├── contexts/           # Context API (AuthContext)
├── hooks/              # Custom hooks (useTasks, etc)
├── pages/              # Páginas principales (Login, Register, Dashboard)
├── schemas/            # Esquemas de validación Zod
└── utils/              # Utilidades
```

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
```

Edita `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

3. Iniciar servidor de desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Scripts Disponibles

```bash
npm run dev        # Iniciar servidor de desarrollo
npm run build      # Build para producción
npm run preview    # Preview del build de producción
npm run lint       # Ejecutar linter
```

## Características Principales

### Autenticación
- Login con validación
- Registro con confirmación de contraseña
- Manejo de sesiones con JWT
- Rutas protegidas
- Redirección automática

### Dashboard
- Estadísticas en tiempo real
- Tarjetas de resumen (Total, Pendientes, En Progreso, Completadas)
- Gráficos interactivos:
  - Gráfico de barras por estado
  - Gráfico circular por prioridad

### Gestión de Tareas
- Crear tareas con título, descripción, estado, prioridad y fecha límite
- Editar tareas existentes
- Eliminar tareas con confirmación
- Filtrar por:
  - Estado (Pendiente, En Progreso, Completada)
  - Prioridad (Baja, Media, Alta)
  - Rango de fechas
- Paginación de resultados
- Vista en tarjetas responsive

### Formularios
- Validación en tiempo real con Zod
- Mensajes de error claros
- UX optimizada con React Hook Form
- Manejo de estados de carga

### UI/UX
- Diseño moderno y limpio
- Totalmente responsive
- Animaciones suaves
- Componentes reutilizables
- Paleta de colores consistente
- Iconos modernos con Lucide

## Arquitectura

### Manejo de Estado
- **React Query** para estado del servidor (cache, sincronización, mutaciones)
- **Context API** para autenticación global
- **React Hook Form** para estado de formularios local

### Optimizaciones
- Code splitting automático con Vite
- Cache inteligente con React Query
- Lazy loading de componentes
- Memoización donde necesario
- Debouncing en filtros (puede implementarse)

### Seguridad
- Rutas protegidas con autenticación
- Tokens JWT almacenados de forma segura
- Interceptores de Axios para manejo de tokens
- Validación de datos en el cliente y servidor
- Sanitización de inputs

## Integración con Backend

El frontend se comunica con el backend mediante Axios:

### Endpoints Utilizados
- `POST /auth/register` - Registro
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `GET /auth/me` - Usuario actual
- `GET /tasks` - Listar tareas con filtros
- `POST /tasks` - Crear tarea
- `GET /tasks/:id` - Obtener tarea
- `PATCH /tasks/:id` - Actualizar tarea
- `DELETE /tasks/:id` - Eliminar tarea
- `GET /tasks/stats` - Estadísticas

## Personalización

### Colores
Edita `tailwind.config.js` para cambiar la paleta de colores:
```js
theme: {
  extend: {
    colors: {
      primary: { ... }
    }
  }
}
```

### Componentes
Todos los componentes son modulares y reutilizables. Edita o extiende según necesites.

## Próximas Mejoras

- [ ] Sistema de notificaciones toast
- [ ] Tema oscuro
- [ ] Búsqueda por texto
- [ ] Ordenamiento personalizado
- [ ] Drag & drop para cambiar estado
- [ ] Etiquetas/categorías para tareas
- [ ] Compartir tareas entre usuarios
- [ ] Notificaciones en tiempo real
- [ ] PWA (Progressive Web App)
- [ ] Tests unitarios y de integración

## Build para Producción

```bash
npm run build
```

Los archivos optimizados estarán en la carpeta `dist/`.

Para preview del build:
```bash
npm run preview
```

## Despliegue

Puedes desplegar en:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Cualquier hosting estático

Asegúrate de configurar las variables de entorno en tu plataforma de hosting.

## Licencia

ISC
