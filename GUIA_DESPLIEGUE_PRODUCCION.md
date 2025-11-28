# Guía de Despliegue a Producción - Todo App

## Índice
1. [Preparación del Proyecto](#1-preparación-del-proyecto)
2. [Configuración de MongoDB Atlas](#2-configuración-de-mongodb-atlas)
3. [Despliegue del Backend](#3-despliegue-del-backend)
4. [Despliegue del Frontend](#4-despliegue-del-frontend)
5. [Configuración Final](#5-configuración-final)
6. [Verificación y Pruebas](#6-verificación-y-pruebas)
7. [Dominio Personalizado (Opcional)](#7-dominio-personalizado-opcional)
8. [Seguridad Adicional](#8-seguridad-adicional)
9. [Monitoreo y Mantenimiento](#9-monitoreo-y-mantenimiento)

---

## 1. Preparación del Proyecto

### 1.1 Verificar que todo funciona localmente

```bash
# Backend
cd backend
npm install
npm start

# Frontend (en otra terminal)
cd frontend
npm install
npm run dev
```

Asegúrate de que:
- ✅ El backend responde en http://localhost:5000/api/health
- ✅ El frontend carga en http://localhost:5173
- ✅ Puedes registrarte y crear tareas

### 1.2 Preparar archivos de configuración

#### Backend: Verificar variables de entorno
Asegúrate de tener `.env.example` con todas las variables necesarias:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7
CORS_ORIGIN=
```

#### Frontend: Verificar variables de entorno
```env
VITE_API_URL=
```

### 1.3 Inicializar Git (si no lo has hecho)

```bash
# En la raíz del proyecto
git init
git add .
git commit -m "Initial commit - Todo App MERN"
```

### 1.4 Crear repositorio en GitHub

```bash
# Ir a github.com y crear un nuevo repositorio
# Luego conectar tu proyecto local:

git remote add origin https://github.com/tu-usuario/todo-app.git
git branch -M main
git push -u origin main
```

---

## 2. Configuración de MongoDB Atlas

### 2.1 Crear cuenta en MongoDB Atlas

1. Ir a [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Crear cuenta gratuita
3. Verificar email

### 2.2 Crear un Cluster

1. Hacer clic en **"Build a Database"**
2. Seleccionar **FREE** (M0 Sandbox - 512MB)
3. Elegir proveedor y región:
   - **Provider**: AWS (recomendado)
   - **Region**: Elegir la más cercana a tus usuarios
4. Cluster Name: `todo-app-cluster` (o el que prefieras)
5. Hacer clic en **"Create"**

### 2.3 Configurar Seguridad

#### Crear usuario de base de datos:
1. En "Security" → "Database Access"
2. Clic en **"Add New Database User"**
3. Autenticación: **Password**
   - Username: `todoadmin` (o el que prefieras)
   - Password: Generar una contraseña segura (guárdala)
   - Database User Privileges: **Atlas admin** o **Read and write to any database**
4. Guardar

#### Configurar acceso de red:
1. En "Security" → "Network Access"
2. Clic en **"Add IP Address"**
3. Seleccionar **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Nota: En producción real, limita a IPs específicas
4. Confirmar

### 2.4 Obtener Connection String

1. En "Database" → Clic en **"Connect"** en tu cluster
2. Seleccionar **"Connect your application"**
3. Driver: **Node.js**
4. Copiar el string de conexión:

```
mongodb+srv://todoadmin:<password>@todo-app-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

5. Reemplazar `<password>` con tu contraseña
6. Agregar el nombre de la base de datos:

```
mongodb+srv://todoadmin:tu-password@todo-app-cluster.xxxxx.mongodb.net/todo-app?retryWrites=true&w=majority
```

**Guarda este string**, lo necesitarás para el backend.

---

## 3. Despliegue del Backend

### Opción A: Render (Recomendado - Gratis)

#### 3.1 Crear cuenta en Render
1. Ir a [https://render.com](https://render.com)
2. Registrarse con GitHub

#### 3.2 Crear Web Service

1. Dashboard → **"New +"** → **"Web Service"**
2. Conectar tu repositorio de GitHub
3. Seleccionar el repositorio `todo-app`
4. Configuración:
   - **Name**: `todo-app-backend`
   - **Region**: Elegir la más cercana
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

#### 3.3 Configurar Variables de Entorno

En la sección **"Environment"**, agregar:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://todoadmin:tu-password@todo-app-cluster.xxxxx.mongodb.net/todo-app?retryWrites=true&w=majority
JWT_SECRET=tu-clave-super-secreta-de-produccion-cambiar-esto-123456789
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7
CORS_ORIGIN=https://tu-frontend.vercel.app
FRONTEND_URL=https://tu-frontend.vercel.app
```

**Importante**:
- Cambiar `JWT_SECRET` por una clave única y segura (usa un generador de contraseñas)
- `CORS_ORIGIN` y `FRONTEND_URL` los configurarás después con la URL del frontend (pueden ser iguales)
- `FRONTEND_URL` se usa en el middleware CSRF para validar el origen de las peticiones
- El `PORT` en Render debe ser `10000` (o usar `process.env.PORT`)

#### 3.4 Deploy

1. Hacer clic en **"Create Web Service"**
2. Esperar que compile (2-5 minutos)
3. Una vez deployado, verás una URL: `https://todo-app-backend.onrender.com`

#### 3.5 Verificar

```bash
# Abrir en el navegador:
https://todo-app-backend.onrender.com/api/health

# Deberías ver:
{
  "status": "success",
  "message": "Server is running",
  "timestamp": "..."
}
```

---

### Opción B: Railway (Alternativa)

#### 3.1 Crear cuenta en Railway
1. Ir a [https://railway.app](https://railway.app)
2. Registrarse con GitHub

#### 3.2 Crear Proyecto

1. Dashboard → **"New Project"**
2. Seleccionar **"Deploy from GitHub repo"**
3. Elegir tu repositorio `todo-app`
4. Railway detectará automáticamente Node.js

#### 3.3 Configurar

1. En Settings:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`

2. En Variables:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7
CORS_ORIGIN=https://tu-frontend.vercel.app
FRONTEND_URL=https://tu-frontend.vercel.app
```

3. Deploy automático

#### 3.4 Obtener URL
Railway te dará una URL como: `https://todo-app-backend.up.railway.app`

---

## 4. Despliegue del Frontend

### Opción A: Vercel (Recomendado - Gratis)

#### 4.1 Crear cuenta en Vercel
1. Ir a [https://vercel.com](https://vercel.com)
2. Registrarse con GitHub

#### 4.2 Importar Proyecto

1. Dashboard → **"Add New"** → **"Project"**
2. Importar repositorio `todo-app`
3. Configuración:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

#### 4.3 Configurar Variables de Entorno

En "Environment Variables":

```
VITE_API_URL=https://todo-app-backend.onrender.com/api
```

**Reemplaza** con la URL real de tu backend.

#### 4.4 Deploy

1. Clic en **"Deploy"**
2. Esperar 1-2 minutos
3. Vercel te dará una URL: `https://todo-app-frontend.vercel.app`

---

### Opción B: Netlify (Alternativa)

#### 4.1 Crear cuenta en Netlify
1. Ir a [https://netlify.com](https://netlify.com)
2. Registrarse con GitHub

#### 4.2 Crear Site

1. **"Add new site"** → **"Import an existing project"**
2. Conectar con GitHub
3. Seleccionar repositorio
4. Configuración:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

#### 4.3 Variables de Entorno

En "Site settings" → "Environment variables":

```
VITE_API_URL=https://todo-app-backend.onrender.com/api
```

#### 4.4 Deploy

Deploy automático. URL: `https://todo-app-frontend.netlify.app`

---

## 5. Configuración Final

### 5.1 Actualizar CORS en Backend

1. Ir a tu servicio de backend (Render/Railway)
2. Actualizar variable de entorno:

```
CORS_ORIGIN=https://todo-app-frontend.vercel.app
```

(Reemplazar con tu URL real de Vercel/Netlify)

3. Re-deployar si es necesario

### 5.2 Verificar Conexión

1. Abrir frontend: `https://todo-app-frontend.vercel.app`
2. Intentar registrarte
3. Si funciona: ✅ Todo está conectado correctamente

---

## 6. Verificación y Pruebas

### 6.1 Checklist de Verificación

- [ ] Backend responde en `/api/health`
- [ ] Frontend carga correctamente
- [ ] Registro de usuario funciona
- [ ] Login funciona
- [ ] Crear tarea funciona
- [ ] Editar tarea funciona
- [ ] Eliminar tarea funciona
- [ ] Filtros funcionan
- [ ] Estadísticas se muestran
- [ ] Tema oscuro/claro funciona
- [ ] Logout funciona

### 6.2 Probar en Diferentes Dispositivos

- Desktop
- Tablet
- Móvil

### 6.3 Probar en Diferentes Navegadores

- Chrome
- Firefox
- Safari
- Edge

---

## 7. Dominio Personalizado (Opcional)

### 7.1 Comprar Dominio

Opciones:
- Namecheap (~$10/año)
- GoDaddy
- Google Domains

### 7.2 Configurar en Vercel/Netlify

#### Vercel:
1. Project Settings → **Domains**
2. Agregar dominio: `tuapp.com`
3. Configurar DNS en tu proveedor:
   - **Type**: A
   - **Name**: @
   - **Value**: (IP que Vercel te da)
   - **Type**: CNAME
   - **Name**: www
   - **Value**: cname.vercel-dns.com

#### Netlify:
Similar, seguir instrucciones de Netlify.

### 7.3 Configurar Subdominio para Backend

1. En tu proveedor DNS:
   - **Type**: CNAME
   - **Name**: api
   - **Value**: todo-app-backend.onrender.com

2. En Render → Settings → Custom Domain:
   - Agregar: `api.tuapp.com`

3. Actualizar variables de entorno:
   - Frontend: `VITE_API_URL=https://api.tuapp.com/api`
   - Backend: `CORS_ORIGIN=https://tuapp.com`

---

## 8. Seguridad Adicional

### 8.1 Agregar Helmet al Backend

```bash
cd backend
npm install helmet
```

```javascript
// En server.js
import helmet from 'helmet';

app.use(helmet());
```

### 8.2 Agregar Rate Limiting

```bash
npm install express-rate-limit
```

```javascript
// En server.js
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 peticiones por IP
  message: 'Demasiadas peticiones desde esta IP'
});

app.use('/api/', limiter);
```

### 8.3 Configurar HTTPS

Vercel y Render lo hacen automáticamente. ✅

### 8.4 Variables de Entorno Seguras

- ✅ Nunca subir `.env` a GitHub
- ✅ Usar secretos fuertes para `JWT_SECRET`
- ✅ Cambiar credenciales de MongoDB periódicamente

### 8.5 Cookies HttpOnly Seguras

Esta aplicación usa **cookies HttpOnly** en lugar de localStorage para mayor seguridad:

- ✅ Las cookies HttpOnly no son accesibles por JavaScript (protección XSS)
- ✅ `sameSite: strict` previene ataques CSRF
- ✅ `secure: true` en producción (solo HTTPS)
- ✅ El token NO se almacena en localStorage

**Configuración requerida:**
```javascript
// Backend - CORS debe permitir cookies
cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true  // CRÍTICO
})

// Frontend - axios debe enviar cookies
axios.create({
  withCredentials: true  // CRÍTICO
})
```

---

## 9. Monitoreo y Mantenimiento

### 9.1 Configurar Alertas

#### Render:
- Settings → Notifications
- Configurar email para notificaciones de deploy

#### Vercel:
- Similar en Project Settings

### 9.2 Logs

#### Ver logs del Backend:
- Render: Deploy → Logs
- Railway: Deployments → View logs

#### Ver logs del Frontend:
- Vercel: Deployments → Function Logs

### 9.3 Monitoreo de Base de Datos

1. MongoDB Atlas → Metrics
2. Ver:
   - Conexiones activas
   - Uso de almacenamiento
   - Operaciones por segundo

### 9.4 Backups

#### MongoDB Atlas:
- Automático en planes pagos
- Plan gratuito: exportar manualmente

```bash
# Exportar base de datos
mongodump --uri="mongodb+srv://..." --out=backup-$(date +%Y%m%d)
```

---

## 10. CI/CD Automático

### 10.1 Deploy Automático con GitHub

Render, Vercel y Netlify ya tienen CI/CD integrado:

- Cada `git push` a `main` → Deploy automático
- Pull Requests → Preview deploys

### 10.2 Configurar Ambientes

**Producción** (main branch):
- Backend: `https://api.tuapp.com`
- Frontend: `https://tuapp.com`

**Staging** (develop branch):
- Backend: `https://api-staging.tuapp.com`
- Frontend: `https://staging.tuapp.com`

---

## 11. Checklist Final de Producción

### Backend
- [x] Deployado en Render/Railway
- [x] Variables de entorno configuradas
- [x] MongoDB Atlas conectado
- [x] CORS configurado correctamente
- [x] `/api/health` responde
- [ ] Helmet instalado (recomendado)
- [ ] Rate limiting (recomendado)
- [ ] Logs configurados

### Frontend
- [x] Deployado en Vercel/Netlify
- [x] `VITE_API_URL` configurada
- [x] Build exitoso
- [x] Responsive en móviles
- [x] HTTPS habilitado

### Base de Datos
- [x] MongoDB Atlas configurado
- [x] Usuario creado
- [x] Network access configurado
- [ ] Backups configurados (opcional)

### Seguridad
- [x] JWT_SECRET único y seguro
- [x] HTTPS en frontend y backend
- [x] Variables de entorno no expuestas
- [ ] Rate limiting activo
- [ ] Helmet configurado

---

## 12. Costos Estimados

### Gratis (Plan recomendado para empezar):
- MongoDB Atlas: **Gratis** (512MB)
- Render Backend: **Gratis** (750 hrs/mes)
- Vercel Frontend: **Gratis** (100GB bandwidth)
- **Total: $0/mes**

### Escalado (cuando crezcas):
- MongoDB Atlas (Shared): **$9-$25/mes**
- Render (Starter): **$7/mes**
- Vercel (Pro): **$20/mes**
- Dominio: **$10-$15/año**
- **Total: ~$40-$60/mes**

---

## 13. Solución de Problemas Comunes

### Error: "CORS policy" o "Las cookies no se envían"
**Solución**:
1. Verificar que `CORS_ORIGIN` en backend coincida exactamente con la URL del frontend
2. Asegurarse de que el backend tenga `credentials: true` en la configuración de CORS
3. Verificar que el frontend tenga `withCredentials: true` en axios
4. Las cookies HttpOnly requieren que ambos (frontend y backend) tengan configurado `credentials: true`
5. **En producción**: Verificar que `sameSite: 'none'` y `secure: true` estén configurados en las cookies

### Error: "Forbidden - Invalid origin" (403)
**Solución**:
Este error indica que el middleware CSRF está bloqueando la petición. Verifica:
1. Que `CORS_ORIGIN` y `FRONTEND_URL` en backend coincidan con la URL exacta del frontend
2. Que ambas variables incluyan el protocolo (https://) y NO tengan barra al final
   - ✅ Correcto: `https://tu-app.vercel.app`
   - ❌ Incorrecto: `https://tu-app.vercel.app/`
3. Si el error persiste, verifica los logs del backend para ver qué origen está siendo bloqueado
4. El middleware CSRF solo se activa en producción (`NODE_ENV=production`)

### Error: "Cannot connect to MongoDB"
**Solución**:
1. Verificar connection string
2. Verificar que IP esté permitida en Network Access
3. Verificar credenciales de usuario

### Error: "JWT malformed" o "Token inválido"
**Solución**:
1. Limpiar las cookies del navegador (F12 → Application → Cookies → Eliminar cookie 'token')
2. Volver a hacer login
3. Verificar que el backend esté configurado con `cookie-parser`
4. Verificar que `CORS_ORIGIN` coincida con la URL del frontend

### Frontend muestra página en blanco
**Solución**:
1. Verificar consola del navegador (F12)
2. Verificar que `VITE_API_URL` esté correcta
3. Hacer rebuild: `npm run build`

### Backend no responde
**Solución**:
1. Verificar logs en Render
2. Verificar que MongoDB esté corriendo
3. Verificar variables de entorno

---

## 14. Siguientes Pasos

Después de tener tu app en producción:

1. **Monitorear usuarios**: Usar Google Analytics o Mixpanel
2. **Agregar tests**: Implementar tests automatizados
3. **Optimizar performance**: Usar caché, CDN
4. **Agregar features**: Según feedback de usuarios
5. **Escalar**: Cuando sea necesario, migrar a planes pagos

---

## 🎉 ¡Felicidades!

Tu aplicación TODO ahora está en producción y disponible para el mundo entero.

**URLs Finales:**
- Frontend: `https://tu-app.vercel.app`
- Backend: `https://tu-backend.onrender.com`
- Base de datos: MongoDB Atlas (Cloud)

**Comparte tu app y comienza a recibir feedback.**

---

## Recursos Adicionales

- [Documentación Render](https://render.com/docs)
- [Documentación Vercel](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Vite Production Build](https://vitejs.dev/guide/build.html)
- [Express Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

---

**Última actualización**: 2025-11-26
