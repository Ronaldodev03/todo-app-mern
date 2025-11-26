# Todo App Backend - MERN Stack

Backend profesional para una aplicación de gestión de tareas con autenticación JWT, filtrado avanzado y arquitectura escalable.

## Características

- Autenticación con JWT y cookies seguras
- Sistema de tareas con 3 estados (pending, in-progress, completed)
- 3 niveles de prioridad (low, medium, high)
- Filtrado por fecha de creación, estado y prioridad
- Paginación de resultados
- Validación robusta de datos
- Manejo profesional de errores
- Arquitectura escalable
- Módulos ES6
- Índices optimizados en MongoDB

## Tecnologías

- Node.js con ES6 Modules
- Express.js
- MongoDB con Mongoose
- JWT para autenticación
- Bcrypt para hash de contraseñas
- Express Validator para validación

## Estructura del Proyecto

```
src/
├── config/
│   └── database.js          # Configuración de MongoDB
├── controllers/
│   ├── auth.controller.js   # Lógica de autenticación
│   └── task.controller.js   # Lógica de tareas
├── middlewares/
│   ├── auth.js              # Middleware de autenticación
│   └── errorHandler.js      # Manejo centralizado de errores
├── models/
│   ├── User.js              # Modelo de usuario
│   └── Task.js              # Modelo de tarea
├── routes/
│   ├── auth.routes.js       # Rutas de autenticación
│   └── task.routes.js       # Rutas de tareas
├── utils/
│   ├── asyncHandler.js      # Wrapper para async/await
│   └── jwt.js               # Utilidades JWT
├── validators/
│   ├── auth.validator.js    # Validación de auth
│   └── task.validator.js    # Validación de tareas
└── server.js                # Punto de entrada
```

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

4. Editar `.env` con tus valores:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/todo-app
JWT_SECRET=tu-clave-secreta-muy-segura
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7
CORS_ORIGIN=http://localhost:3000
```

5. Iniciar servidor:
```bash
npm start         # Producción
npm run dev       # Desarrollo con watch mode
```

## API Endpoints

### Autenticación

#### Registro
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "usuario",
  "email": "usuario@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "password123"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

#### Obtener usuario actual
```http
GET /api/auth/me
Authorization: Bearer {token}
```

### Tareas

Todas las rutas de tareas requieren autenticación.

#### Obtener todas las tareas (con filtros)
```http
GET /api/tasks?status=pending&priority=high&sortBy=createdAt&order=desc&page=1&limit=10&startDate=2025-01-01&endDate=2025-12-31
Authorization: Bearer {token}
```

Parámetros de query:
- `status`: pending | in-progress | completed
- `priority`: low | medium | high
- `sortBy`: createdAt | updatedAt | priority | status | dueDate
- `order`: asc | desc
- `page`: número de página (default: 1)
- `limit`: resultados por página (default: 10, max: 100)
- `startDate`: fecha inicio (ISO 8601)
- `endDate`: fecha fin (ISO 8601)

#### Obtener una tarea
```http
GET /api/tasks/:id
Authorization: Bearer {token}
```

#### Crear tarea
```http
POST /api/tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Completar proyecto",
  "description": "Descripción de la tarea",
  "status": "pending",
  "priority": "high",
  "dueDate": "2025-12-31"
}
```

#### Actualizar tarea
```http
PATCH /api/tasks/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "completed",
  "priority": "medium"
}
```

#### Eliminar tarea
```http
DELETE /api/tasks/:id
Authorization: Bearer {token}
```

#### Obtener estadísticas
```http
GET /api/tasks/stats
Authorization: Bearer {token}
```

Respuesta:
```json
{
  "status": "success",
  "data": {
    "stats": {
      "total": 10,
      "pending": 3,
      "inProgress": 2,
      "completed": 5,
      "lowPriority": 2,
      "mediumPriority": 5,
      "highPriority": 3
    }
  }
}
```

## Modelos de Datos

### User
- `username`: string (único, 3-30 caracteres)
- `email`: string (único, validado)
- `password`: string (hasheado, mínimo 6 caracteres)
- `isActive`: boolean
- `createdAt`: timestamp
- `updatedAt`: timestamp

### Task
- `title`: string (1-200 caracteres)
- `description`: string (max 1000 caracteres)
- `status`: enum ['pending', 'in-progress', 'completed']
- `priority`: enum ['low', 'medium', 'high']
- `user`: ObjectId (referencia a User)
- `dueDate`: date (opcional)
- `completedAt`: date (auto-generado)
- `createdAt`: timestamp
- `updatedAt`: timestamp

## Seguridad

- Contraseñas hasheadas con bcrypt (salt rounds: 12)
- JWT con expiración configurable
- Cookies httpOnly y secure en producción
- Validación de datos en todas las entradas
- Protección contra inyección NoSQL
- Rate limiting recomendado para producción
- Manejo seguro de errores (no expone detalles en producción)

## Buenas Prácticas Implementadas

- Arquitectura MVC escalable
- Separación de concerns
- Código DRY (Don't Repeat Yourself)
- Manejo centralizado de errores
- Validación robusta de datos
- Middleware reutilizable
- Índices optimizados en base de datos
- Async/await con manejo de errores
- Variables de entorno para configuración
- Logs informativos
- Graceful shutdown

## Próximos Pasos para Producción

1. Implementar rate limiting (express-rate-limit)
2. Agregar helmet para headers de seguridad
3. Implementar tests (Jest, Supertest)
4. Configurar CI/CD
5. Agregar documentación Swagger/OpenAPI
6. Implementar logging profesional (Winston, Morgan)
7. Configurar monitoreo (PM2, New Relic)
8. Agregar backup automático de base de datos
9. Implementar cache (Redis)
10. Configurar load balancing

## Licencia

ISC
