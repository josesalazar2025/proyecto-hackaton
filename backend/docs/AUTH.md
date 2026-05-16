# Auth — Guía de uso

Login con email + password. El backend emite un JWT (HS256, default 1h) que viaja en `Authorization: Bearer <token>`. No hay registro público en esta fase: los usuarios se crean vía el seeder. **No hay roles** — `requireAuth` solo valida que el usuario esté logueado y activo, para que pueda mantener sus preferencias.

## 1. Variables de entorno

Copiar `backend/.env.example` a `backend/.env` y rellenar:

| Variable | Default | Notas |
|---|---|---|
| `NODE_ENV` | `development` | `development` \| `test` \| `production` |
| `PORT` | `7860` | Puerto del backend (HF Spaces requiere 7860) |
| `DATABASE_URL` | `file:./polysignal.db` | Path SQLite **relativo a `prisma/schema.prisma`** |
| `JWT_SECRET` | — (obligatorio) | Mínimo 32 chars. Generar con `openssl rand -hex 48` |
| `JWT_EXPIRES_IN` | `1h` | Formato `jsonwebtoken` (`1h`, `15m`, `7d`, ...) |
| `BCRYPT_ROUNDS` | `10` | Entre 4 y 15 |
| `CORS_ORIGIN` | `http://localhost:5173` | Origen del frontend en dev |
| `LOG_LEVEL` | `info` | `trace`/`debug`/`info`/`warn`/`error`/`fatal` |

> Si el `.env` falta una variable obligatoria o un valor es inválido, el backend imprime el error y aborta el arranque (validación con Zod en `src/config.js`).

## 2. Primer arranque

Desde `backend/`:

```bash
npm install                                  # instala deps
npm run db:migrate -- --name init_auth       # solo la primera vez (ya hecho)
npm run db:seed                              # crea los 2 usuarios de prueba
npm run dev                                  # arranca en http://localhost:7860
```

Para inspeccionar la DB en una UI:

```bash
npm run db:studio
```

## 3. Usuarios de prueba

Sembrados por `prisma/seed.js` (idempotente, se puede re-ejecutar):

| Email | Password |
|---|---|
| `admin@polysignal.test` | `Admin123!` |
| `user@polysignal.test`  | `User123!`  |

## 4. Endpoints

### `GET /api/v1/health`

Sanity check. Respuesta:

```json
{ "ok": true, "data": { "status": "up" } }
```

### `POST /api/v1/auth/login`

Body:

```json
{ "email": "admin@polysignal.test", "password": "Admin123!" }
```

Respuesta `200`:

```json
{
  "ok": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "user": { "id": 1, "email": "admin@polysignal.test" }
  }
}
```

Errores:

| HTTP | code | cuándo |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Email inválido o password < 8 chars |
| `401` | `INVALID_CREDENTIALS` | Email no existe, usuario desactivado, o password incorrecta |
| `429` | `TOO_MANY_REQUESTS` | Más de 5 intentos en 15 min desde la misma IP |

### `GET /api/v1/auth/me`

Requiere header `Authorization: Bearer <token>`. Respuesta `200`:

```json
{
  "ok": true,
  "data": {
    "user": {
      "id": 1,
      "email": "admin@polysignal.test",
      "isActive": true,
      "createdAt": "2026-05-16T07:11:43.000Z"
    }
  }
}
```

Errores:

| HTTP | code | cuándo |
|---|---|---|
| `401` | `UNAUTHORIZED` | Sin header, token mal formado, expirado, manipulado, o usuario desactivado |

## 5. Ejemplos con `curl`

```bash
# 1) Login y guardar token en variable
TOKEN=$(curl -s -X POST http://localhost:7860/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@polysignal.test","password":"Admin123!"}' \
  | jq -r '.data.token')

# 2) Llamar a /me con el token
curl -s http://localhost:7860/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq
```

## 6. Login desde el frontend (referencia)

El JWT es opaco para el front: basta con guardarlo (sessionStorage o estado en memoria) y enviarlo en cada request protegido.

```js
const res = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
const json = await res.json();
if (!json.ok) throw new Error(json.error.code);
const { token, user } = json.data;
// guardar token y user

// requests autenticados
fetch('/api/v1/auth/me', { headers: { Authorization: `Bearer ${token}` } });
```

> En dev, Vite proxea `/api/*` al backend (`localhost:7860`); no hace falta CORS si va por el proxy, pero ya está configurado por si el front llama directo.

## 7. Cómo proteger nuevos endpoints

```js
import { requireAuth } from '../middlewares/requireAuth.js';

router.get('/positions', requireAuth, controller.list);
```

Dentro del controller, `req.user` ya está disponible con `{ id, email, isActive, createdAt }` — suficiente para filtrar datos del usuario logueado (ej. sus preferencias, posiciones, watchlist).

## 8. Rotar `JWT_SECRET`

Genera uno nuevo y reemplaza el valor de `JWT_SECRET` en `backend/.env`:

```bash
openssl rand -hex 48
```

Al cambiar el secreto, todos los tokens emitidos previamente quedan invalidados (los clientes deben volver a hacer login).

## 9. Notas técnicas

- **Hashing:** `bcryptjs` (puro JS, sin compilación nativa — más portable a HF Spaces) con coste `BCRYPT_ROUNDS` (default 10).
- **JWT:** algoritmo `HS256`, claim `sub = user.id`, `email`, `iat`, `exp`.
- **Rate limit en `/auth/login`:** `express-rate-limit`, 5 intentos / 15 min / IP.
- **Validación de body:** zod schema en `src/auth/auth.validators.js`.
- **Errores formateados:** todas las respuestas siguen `{ ok, data }` o `{ ok:false, error:{ code, message, details? } }` vía `src/utils/apiResponse.js` y el middleware `errorHandler`.
- **Prisma:** singleton en `src/utils/prisma.js` para no abrir conexiones de más con `node --watch`.
