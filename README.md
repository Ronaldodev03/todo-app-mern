# Todo App - MERN Stack

Aplicación completa de gestión de tareas construida con MongoDB, Express, React y Node.js.

## 🚀 Demo en Producción

- **Frontend**: [Desplegado en Vercel]
- **Backend**: [Desplegado en Render]
- **Base de datos**: MongoDB Atlas

## 📁 Estructura del Proyecto

```
todo-app/
├── backend/          # API REST con Node.js y Express
├── frontend/         # Aplicación React con Vite
├── .gitignore
├── README.md
├── DOCUMENTACION_PROYECTO.md          # Documentación completa
└── GUIA_DESPLIEGUE_PRODUCCION.md     # Guía de deploy
```

## 🛠️ Tecnologías

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Bcrypt
- Express Validator

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Query (TanStack)
- React Hook Form + Zod
- Recharts
- Axios

## 🚀 Instalación Local

### 1. Clonar repositorio
```bash
git clone https://github.com/tu-usuario/todo-app.git
cd todo-app
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus valores
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Editar .env con la URL del backend
npm run dev
```

## 📚 Documentación

- [Documentación Completa del Proyecto](DOCUMENTACION_PROYECTO.md)
- [Guía de Despliegue a Producción](GUIA_DESPLIEGUE_PRODUCCION.md)

## ✨ Características

- ✅ Autenticación con JWT
- ✅ CRUD completo de tareas
- ✅ Filtrado avanzado (estado, prioridad, fechas)
- ✅ Dashboard con estadísticas y gráficos
- ✅ Tema claro/oscuro
- ✅ Diseño responsive
- ✅ Validación robusta

## 🔐 Variables de Entorno

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/todo-app
JWT_SECRET=tu-clave-secreta
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📝 Scripts

### Backend
```bash
npm start      # Producción
npm run dev    # Desarrollo con watch mode
```

### Frontend
```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build para producción
npm run preview  # Preview del build
```

## 🌐 Despliegue

Este proyecto está optimizado para despliegue en:
- **Backend**: Render / Railway
- **Frontend**: Vercel / Netlify
- **Base de datos**: MongoDB Atlas

Ver [GUIA_DESPLIEGUE_PRODUCCION.md](GUIA_DESPLIEGUE_PRODUCCION.md) para instrucciones detalladas.

## 📄 Licencia

ISC

---

**Desarrollado con ❤️ usando MERN Stack**
