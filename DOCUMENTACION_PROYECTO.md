# Todo App - Aplicación de Gestión de Tareas (MERN Stack)

## Índice

1. [Descripción General](#descripción-general)
2. [Tecnologías Utilizadas](#tecnologías-utilizadas)
3. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
4. [Backend](#backend)
5. [Frontend](#frontend)
6. [Instalación y Configuración](#instalación-y-configuración)
7. [Características Principales](#características-principales)
8. [API Endpoints](#api-endpoints)
9. [Estructura de Datos](#estructura-de-datos)
10. [Flujo de Autenticación](#flujo-de-autenticación)
11. [Gestión de Estado](#gestión-de-estado)
12. [Despliegue](#despliegue)

---

## Descripción General

Todo App es una aplicación web completa de gestión de tareas construida con el stack MERN (MongoDB, Express, React, Node.js). Proporciona un sistema robusto de autenticación JWT, CRUD completo de tareas, filtrado avanzado, estadísticas en tiempo real y una interfaz moderna y responsive.

### Características Destacadas

- Sistema de autenticación seguro con JWT
- Dashboard interactivo con estadísticas y gráficos
- Gestión completa de tareas (CRUD)
- Filtrado avanzado por estado, prioridad y fechas
- Tema claro/oscuro
- Diseño responsive y moderno
- Validación robusta en frontend y backend
- Arquitectura escalable y profesional

---

## Tecnologías Utilizadas

### Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | Latest | Runtime de JavaScript |
| Express | 5.1.0 | Framework web |
| MongoDB | Latest | Base de datos NoSQL |
| Mongoose | 9.0.0 | ODM para MongoDB |
| JWT | 9.0.2 | Autenticación con tokens |
| Bcryptjs | 3.0.3 | Hash de contraseñas |
| Express Validator | 7.3.1 | Validación de datos |
| CORS | 2.8.5 | Políticas CORS |
| Cookie Parser | 1.4.7 | Manejo de cookies |
| Dotenv | 17.2.3 | Variables de entorno |

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 18.3.1 | Biblioteca UI |
| Vite | 7.2.4 | Build tool |
| React Router DOM | 7.9.6 | Enrutamiento |
| TanStack React Query | 5.90.10 | Estado del servidor |
| Axios | 1.13.2 | Cliente HTTP |
| Tailwind CSS | 3.4.18 | Framework CSS |
| React Hook Form | 7.66.1 | Manejo de formularios |
| Zod | 4.1.13 | Validación de esquemas |
| Recharts | 3.5.0 | Gráficos y visualizaciones |
| Lucide React | 0.554.0 | Iconos modernos |
| DnD Kit | 6.3.1 | Drag and drop |
| React Hot Toast | 2.6.0 | Notificaciones |
| date-fns | 4.1.0 | Manejo de fechas |

---

## Arquitectura del Proyecto

```
todo-app/
├── backend/                 # Servidor Node.js
│   ├── src/
│   │   ├── config/         # Configuraciones (DB)
│   │   ├── controllers/    # Lógica de negocio
│   │   ├── middlewares/    # Middlewares (auth, errors)
│   │   ├── models/         # Modelos Mongoose
│   │   ├── routes/         # Definición de rutas
│   │   ├── utils/          # Utilidades (JWT, async handler)
│   │   ├── validators/     # Validadores de datos
│   │   └── server.js       # Punto de entrada
│   ├── .env.example        # Variables de entorno ejemplo
│   ├── package.json
│   └── README.md
│
└── frontend/               # Aplicación React
    ├── src/
    │   ├── api/           # Servicios API y Axios config
    │   ├── components/    # Componentes React
    │   │   ├── auth/     # Rutas protegidas/públicas
    │   │   ├── charts/   # Gráficos
    │   │   ├── common/   # Componentes reutilizables
    │   │   └── tasks/    # Componentes de tareas
    │   ├── contexts/      # Context API (Theme)
    │   ├── hooks/         # Custom hooks
    │   ├── pages/         # Páginas principales
    │   ├── schemas/       # Esquemas de validación Zod
    │   ├── utils/         # Utilidades
    │   ├── App.jsx        # Componente raíz
    │   └── main.jsx       # Punto de entrada
    ├── .env.example
    ├── package.json
    ├── tailwind.config.js
    ├── vite.config.js
    └── README.md
```

---

## Backend

### Arquitectura

El backend sigue el patrón **MVC (Model-View-Controller)** con una arquitectura modular y escalable.

#### Componentes Principales

**1. Models (Modelos)**
- `User.js`: Esquema de usuario con validaciones y métodos
- `Task.js`: Esquema de tarea con estados y prioridades

**2. Controllers (Controladores)**
- `auth.controller.js`: Lógica de registro, login, logout y perfil
- `task.controller.js`: CRUD de tareas, filtrado y estadísticas

**3. Routes (Rutas)**
- `auth.routes.js`: Rutas de autenticación
- `task.routes.js`: Rutas de tareas (protegidas)

**4. Middlewares**
- `auth.js`: Verificación de JWT y protección de rutas
- `errorHandler.js`: Manejo centralizado de errores

**5. Validators**
- `auth.validator.js`: Validación de registro y login
- `task.validator.js`: Validación de creación/actualización de tareas

**6. Utils**
- `jwt.js`: Generación y verificación de tokens
- `asyncHandler.js`: Wrapper para funciones asíncronas

### Características del Backend

#### Autenticación JWT
```javascript
// Generación de token
const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

// Cookie segura
res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
});
```

#### Protección de Rutas
```javascript
// Middleware de autenticación
export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new Error('No autorizado');

  const decoded = jwt.verify(token, JWT_SECRET);
  req.user = await User.findById(decoded.userId);
  next();
};
```

#### Filtrado Avanzado de Tareas
- Por estado: `pending`, `in-progress`, `completed`
- Por prioridad: `low`, `medium`, `high`
- Por rango de fechas
- Ordenamiento personalizable
- Paginación (página y límite)

#### Estadísticas
```javascript
GET /api/tasks/stats
// Retorna: total, pending, inProgress, completed, lowPriority, mediumPriority, highPriority
```

### Base de Datos

#### Modelo User
```javascript
{
  username: String,      // 3-30 caracteres, único
  email: String,         // Validado, único
  password: String,      // Hasheado con bcrypt (12 salt rounds)
  isActive: Boolean,     // Default: true
  createdAt: Date,
  updatedAt: Date
}
```

#### Modelo Task
```javascript
{
  title: String,         // 1-200 caracteres, requerido
  description: String,   // Max 1000 caracteres
  status: Enum,          // ['pending', 'in-progress', 'completed']
  priority: Enum,        // ['low', 'medium', 'high']
  user: ObjectId,        // Referencia a User
  dueDate: Date,         // Opcional
  completedAt: Date,     // Auto-generado cuando status = 'completed'
  createdAt: Date,
  updatedAt: Date
}
```

#### Índices Optimizados
```javascript
// En Task model
schema.index({ user: 1, status: 1 });
schema.index({ user: 1, createdAt: -1 });
schema.index({ user: 1, priority: 1 });
```

---

## Frontend

### Arquitectura

El frontend utiliza **arquitectura basada en componentes** con React 18 y hooks modernos.

#### Estructura de Componentes

**1. Pages (Páginas)**
- `Home.jsx`: Página de bienvenida
- `Login.jsx`: Página de inicio de sesión
- `Register.jsx`: Página de registro
- `Dashboard.jsx`: Panel principal con tareas y estadísticas

**2. Components**

**Auth Components**
- `ProtectedRoute.jsx`: Envuelve rutas que requieren autenticación
- `PublicRoute.jsx`: Redirecciona si ya está autenticado

**Common Components**
- `Button.jsx`: Botón reutilizable con variantes
- `Input.jsx`: Input con validación integrada
- `Select.jsx`: Select personalizado
- `Modal.jsx`: Modal reutilizable
- `ConfirmDialog.jsx`: Diálogo de confirmación
- `Loader.jsx`: Indicador de carga

**Task Components**
- `TaskList.jsx`: Lista de tareas con grid responsive
- `TaskCard.jsx`: Tarjeta individual de tarea
- `TaskForm.jsx`: Formulario de crear/editar tarea
- `TaskFilters.jsx`: Panel de filtros avanzados

**Chart Components**
- `StatsCards.jsx`: Tarjetas de estadísticas
- `TasksChart.jsx`: Gráficos de barras y pie

**3. Hooks Personalizados**

```javascript
// useAuth.js
export const useAuth = () => {
  // Retorna: user, login, register, logout, isAuthenticated, loading
};

// useTasks.js
export const useTasks = (filters) => {
  // Retorna: data, isLoading, error
};

export const useCreateTask = () => { /* ... */ };
export const useUpdateTask = () => { /* ... */ };
export const useDeleteTask = () => { /* ... */ };
export const useTaskStats = () => { /* ... */ };
```

**4. Contexts**

```javascript
// ThemeContext.jsx
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

**5. API Layer**

```javascript
// axios.js - Instancia configurada
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

// Interceptor para tokens
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// auth.api.js
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me')
};

// tasks.api.js
export const tasksApi = {
  getTasks: (params) => api.get('/tasks', { params }),
  getTask: (id) => api.get(`/tasks/${id}`),
  createTask: (data) => api.post('/tasks', data),
  updateTask: ({ id, data }) => api.patch(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  getStats: () => api.get('/tasks/stats')
};
```

**6. Validación con Zod**

```javascript
// auth.schema.js
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres')
});

// task.schema.js
export const taskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  status: z.enum(['pending', 'in-progress', 'completed']),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.date().optional()
});
```

### Características del Frontend

#### Sistema de Temas
- Tema claro y oscuro
- Persistencia en localStorage
- Cambio dinámico sin recarga
- Aplicado con Tailwind CSS (clase `dark`)

#### Manejo de Estado
- **TanStack Query** para estado del servidor (cache, sincronización)
- **Context API** para tema y autenticación global
- **React Hook Form** para estado de formularios

#### Optimizaciones
- Code splitting automático (Vite)
- Cache inteligente (React Query, 5 min staleTime)
- Retry automático en peticiones fallidas
- Invalidación de queries tras mutaciones

#### Responsive Design
```javascript
// Grid adaptativo
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Tarjetas de tareas */}
</div>
```

---

## Instalación y Configuración

### Prerequisitos

- Node.js >= 18.x
- MongoDB >= 6.x
- npm o yarn

### Instalación del Backend

```bash
# 1. Navegar a la carpeta backend
cd backend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env

# Editar .env con tus valores:
# NODE_ENV=development
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/todo-app
# JWT_SECRET=tu-clave-secreta-muy-segura
# JWT_EXPIRES_IN=7d
# JWT_COOKIE_EXPIRES_IN=7
# CORS_ORIGIN=http://localhost:3000

# 4. Iniciar servidor
npm run dev      # Desarrollo (watch mode)
npm start        # Producción
```

### Instalación del Frontend

```bash
# 1. Navegar a la carpeta frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env

# Editar .env:
# VITE_API_URL=http://localhost:5000/api

# 4. Iniciar servidor de desarrollo
npm run dev      # Desarrollo (http://localhost:5173)
npm run build    # Build para producción
npm run preview  # Preview del build
```

### Iniciar MongoDB

```bash
# Con Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# O instalación local
mongod --dbpath /ruta/a/datos
```

---

## Características Principales

### 1. Autenticación

#### Registro
- Validación de email único
- Username único (3-30 caracteres)
- Contraseña hasheada con bcrypt (12 salt rounds)
- Generación automática de JWT

#### Login
- Validación de credenciales
- Token JWT con expiración (7 días)
- Cookie httpOnly segura
- Almacenamiento en localStorage (frontend)

#### Logout
- Invalidación de token
- Limpieza de cache en frontend
- Redirección automática

#### Protección de Rutas
- Middleware de autenticación en backend
- Componentes `ProtectedRoute` y `PublicRoute` en frontend
- Verificación automática de sesión

### 2. Gestión de Tareas

#### CRUD Completo
- **Create**: Formulario con validación Zod y React Hook Form
- **Read**: Lista paginada con filtros
- **Update**: Edición inline o modal
- **Delete**: Con confirmación

#### Filtrado Avanzado
```javascript
// Ejemplo de filtros
{
  status: 'pending',
  priority: 'high',
  sortBy: 'createdAt',
  order: 'desc',
  page: 1,
  limit: 10,
  startDate: '2025-01-01',
  endDate: '2025-12-31'
}
```

#### Estados de Tarea
- `pending`: Pendiente (azul)
- `in-progress`: En progreso (amarillo)
- `completed`: Completada (verde)

#### Prioridades
- `low`: Baja (gris)
- `medium`: Media (naranja)
- `high`: Alta (rojo)

### 3. Dashboard

#### Estadísticas en Tiempo Real
- Total de tareas
- Tareas pendientes
- Tareas en progreso
- Tareas completadas
- Por prioridad (baja, media, alta)

#### Visualizaciones
- **Gráfico de Barras**: Tareas por estado
- **Gráfico Circular**: Distribución por prioridad
- **Tarjetas de Resumen**: Métricas clave con iconos

### 4. Interfaz de Usuario

#### Diseño
- Paleta de colores consistente
- Diseño limpio y moderno
- Animaciones suaves (transitions)
- Iconos Lucide React

#### Responsive
- Mobile first
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Grid adaptativo
- Menú responsive

#### Tema Oscuro/Claro
- Toggle en navbar
- Persistencia en localStorage
- Clase `dark` en documentElement
- Soporte completo en todos los componentes

---

## API Endpoints

### Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registrar usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| POST | `/api/auth/logout` | Cerrar sesión | Sí |
| GET | `/api/auth/me` | Obtener usuario actual | Sí |

### Tareas

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/tasks` | Listar tareas (con filtros) | Sí |
| GET | `/api/tasks/:id` | Obtener una tarea | Sí |
| POST | `/api/tasks` | Crear tarea | Sí |
| PATCH | `/api/tasks/:id` | Actualizar tarea | Sí |
| DELETE | `/api/tasks/:id` | Eliminar tarea | Sí |
| GET | `/api/tasks/stats` | Obtener estadísticas | Sí |

### Health Check

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/health` | Estado del servidor | No |

### Ejemplos de Peticiones

#### Registro
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}

// Respuesta
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com"
    }
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Crear Tarea
```http
POST /api/tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Completar proyecto",
  "description": "Finalizar la aplicación TODO",
  "status": "pending",
  "priority": "high",
  "dueDate": "2025-12-31"
}
```

#### Listar Tareas con Filtros
```http
GET /api/tasks?status=pending&priority=high&sortBy=createdAt&order=desc&page=1&limit=10
Authorization: Bearer {token}
```

---

## Estructura de Datos

### Respuestas API

#### Formato de Éxito
```json
{
  "status": "success",
  "data": { /* datos */ },
  "message": "Operación exitosa"
}
```

#### Formato de Error
```json
{
  "status": "error",
  "message": "Descripción del error"
}
```

### Modelo de Usuario (Frontend)
```typescript
interface User {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Modelo de Tarea (Frontend)
```typescript
interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  user: string;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Estadísticas
```typescript
interface Stats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  lowPriority: number;
  mediumPriority: number;
  highPriority: number;
}
```

---

## Flujo de Autenticación

### Flujo de Registro/Login

```mermaid
sequenceDiagram
    participant Usuario
    participant Frontend
    participant Backend
    participant MongoDB

    Usuario->>Frontend: Ingresa credenciales
    Frontend->>Frontend: Validación con Zod
    Frontend->>Backend: POST /auth/register o /login
    Backend->>Backend: Validación con Express Validator
    Backend->>MongoDB: Verificar usuario existente
    alt Usuario nuevo
        Backend->>Backend: Hash de contraseña (bcrypt)
        Backend->>MongoDB: Guardar usuario
        Backend->>Backend: Generar JWT
        Backend->>Frontend: Token + datos de usuario
        Frontend->>Frontend: Guardar token en localStorage
        Frontend->>Frontend: Actualizar estado React Query
        Frontend->>Usuario: Redirección a /dashboard
    else Usuario existente
        Backend->>Backend: Comparar contraseña
        Backend->>Backend: Generar JWT
        Backend->>Frontend: Token + datos de usuario
        Frontend->>Frontend: Guardar token
        Frontend->>Usuario: Redirección a /dashboard
    end
```

### Flujo de Petición Protegida

```
1. Usuario hace petición
2. Interceptor Axios añade header Authorization
3. Backend verifica token en middleware
4. Si válido: continúa | Si inválido: 401 Unauthorized
5. Frontend maneja respuesta
```

---

## Gestión de Estado

### Backend - Estado de Sesión
- JWT almacenado en cookie httpOnly
- Token en header Authorization
- Sesión válida por 7 días

### Frontend - Estado Global

#### React Query (TanStack Query)
```javascript
// Configuración global
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000 // 5 minutos
    }
  }
});

// Cache keys
['auth', 'me']          // Usuario actual
['tasks', filters]      // Lista de tareas
['task', id]           // Tarea individual
['stats']              // Estadísticas
```

#### Context API
- `ThemeContext`: Estado global de tema (light/dark)

#### Local State
- React Hook Form para formularios
- useState para UI local (modals, dialogs)

---

## Despliegue

### Backend

#### Variables de Entorno Producción
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=clave-secreta-super-segura-de-produccion
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7
CORS_ORIGIN=https://tu-dominio.com
```

#### Opciones de Hosting
- **Render** (recomendado para apps Node.js)
- **Railway**
- **Heroku**
- **AWS EC2** + PM2
- **DigitalOcean Droplet**
- **Google Cloud Run**

#### Base de Datos
- **MongoDB Atlas** (cloud, gratis hasta 512MB)
- MongoDB local con backups

### Frontend

#### Build para Producción
```bash
npm run build
# Genera carpeta dist/ con archivos optimizados
```

#### Variables de Entorno
```env
VITE_API_URL=https://tu-api.com/api
```

#### Opciones de Hosting
- **Vercel** (recomendado para React)
- **Netlify**
- **GitHub Pages**
- **AWS S3** + CloudFront
- **Firebase Hosting**

### Configuración Nginx (ejemplo)
```nginx
server {
  listen 80;
  server_name tu-dominio.com;

  location / {
    root /var/www/frontend/dist;
    try_files $uri $uri/ /index.html;
  }

  location /api {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

---

## Seguridad

### Backend

- Hash de contraseñas con bcrypt (12 salt rounds)
- JWT con expiración configurable
- Cookies httpOnly y secure en producción
- Validación de datos (Express Validator)
- Protección contra inyección NoSQL (Mongoose)
- CORS configurado
- Manejo seguro de errores (sin exponer stack traces)
- Rate limiting recomendado (express-rate-limit)

### Frontend

- Validación de datos con Zod
- Sanitización de inputs
- Tokens en localStorage (considerar httpOnly cookies para mayor seguridad)
- Rutas protegidas
- Interceptores para manejo de errores
- CSP headers recomendados

---

## Mejoras Futuras

### Backend
- [ ] Rate limiting con express-rate-limit
- [ ] Helmet para headers de seguridad
- [ ] Tests (Jest, Supertest)
- [ ] Swagger/OpenAPI documentation
- [ ] Logging profesional (Winston, Morgan)
- [ ] Cache con Redis
- [ ] WebSockets para actualizaciones en tiempo real
- [ ] Sistema de notificaciones

### Frontend
- [ ] Tests unitarios (Vitest) y E2E (Playwright)
- [ ] PWA (Progressive Web App)
- [ ] Búsqueda por texto
- [ ] Drag & drop para reordenar (implementado con DnD Kit)
- [ ] Etiquetas/categorías
- [ ] Compartir tareas entre usuarios
- [ ] Modo offline
- [ ] i18n (internacionalización)

---

## Scripts Útiles

### Backend
```bash
npm start          # Iniciar en producción
npm run dev        # Desarrollo con watch mode
npm test           # Ejecutar tests (si implementado)
```

### Frontend
```bash
npm run dev        # Servidor de desarrollo (http://localhost:5173)
npm run build      # Build optimizado
npm run preview    # Preview del build
npm run lint       # Linter ESLint
```

---

## Licencia

ISC

---

## Contacto y Contribuciones

Este proyecto fue creado como una aplicación full-stack MERN profesional.

Si encuentras algún bug o tienes sugerencias, no dudes en abrir un issue o pull request.

---

**Desarrollado con ❤️ usando MERN Stack**
