# PolySignal

Dashboard web de inteligencia de mercados de prediccion en tiempo real.

## Que es

PolySignal analiza mercados de Polymarket cruzando noticias de Finnhub con modelos de IA (ModernFinBERT + Qwen3-8B) para generar senales de trading (alcista, bajista, neutral). Incluye simulador de posiciones con capital virtual, lista de seguimiento y alertas por Telegram.

**No ejecuta ordenes reales.** Es una herramienta de analisis e inteligencia.

**Idioma:** Espanol.  
**Moneda base:** Euro (€).

## Stack

- **Backend:** Node.js 26 + Express.js 5 + Socket.io + node-cron
- **ORM:** Prisma 7 + SQLite
- **Frontend:** Vanilla JS + Vite 8 + Leaflet.js + Chart.js + Socket.io client
- **IA:** HuggingFace Inference API (ModernFinBERT, Qwen3-8B) + OpenRouter fallback
- **Datos:** Polymarket Gamma API + Finnhub REST
- **Deploy:** HuggingFace Spaces (Docker, puerto 7860)

## Estado del proyecto

> **Nota importante:** El backend actualmente contiene solo stubs/documentacion JSDoc. El frontend funciona de forma independiente con **datos mock** realistas para la demo. Puedes ejecutar y visualizar todo el dashboard sin necesidad de configurar claves de API ni base de datos.

## Estructura

```
polysignal/
├── backend/                 # API REST + Servicios + Scheduler (stubs)
│   ├── package.json
│   ├── prisma/
│   │   └── schema.prisma    # Schema SQLite (Prisma)
│   └── src/
│       ├── index.js         # Entry point Express
│       ├── config.js        # Variables de entorno
│       ├── scheduler.js     # Jobs periodicos (cron)
│       ├── routes/          # Endpoints REST (/api/v1)
│       ├── services/        # Logica de negocio + integraciones
│       └── socket/          # Eventos Socket.io
│
├── frontend/                # SPA Vanilla JS con Vite
│   ├── index.html             # Punto de entrada HTML
│   ├── package.json           # Dependencias del frontend
│   ├── vite.config.js         # Configuracion de Vite (proxy + build)
│   └── src/
│       ├── main.js            # Entry point de Vite
│       ├── app.js             # Logica principal SPA + Socket.io
│       ├── api.js             # Cliente REST
│       ├── charts.js          # Chart.js (historial + sparklines)
│       ├── map.js             # Leaflet (mapa mundial interactivo)
│       ├── simulator.js       # Simulador de posiciones virtuales
│       └── style.css          # Estilos dark terminal / fintech
│
├── package.json             # Root con workspaces + scripts conjuntos
├── docker-compose.yml       # Orquestacion local
├── Dockerfile               # Build para HuggingFace Spaces
├── .env.example             # Variables de entorno de ejemplo
└── README.md
```

## Requisitos

- **Node.js >= 26.0.0**
- **npm >= 10** (workspaces)

## Instalacion rapida

```bash
# 1. Instalar dependencias (root + todos los workspaces)
npm install

# 2. (Opcional) Configurar variables de entorno para backend
#    Si solo vas a probar el frontend, este paso NO es necesario.
cp .env.example .env
# Editar .env con tus claves

# 3. (Opcional) Generar base de datos y cliente Prisma
#    Solo necesario si vas a desarrollar el backend.
npm run db:migrate
npm run db:generate

# 4. Iniciar en desarrollo
npm run dev:all      # Backend + Frontend Vite simultaneamente
```

## Desarrollo solo frontend

Si solo quieres visualizar el dashboard (funciona con datos mock):

```bash
cd frontend
npm install
npm run dev
# Abrir http://localhost:5173
```

El frontend consume datos mock localmente cuando el backend no responde, por lo que el dashboard es totalmente funcional para la demo sin configuracion adicional.

## Arquitectura del Frontend

El frontend es una SPA (Single Page Application) construida con **Vite 8** como bundler y dev server. Las librerias (Chart.js, Leaflet, Socket.io client) se gestionan como dependencias npm en lugar de CDN, lo que permite tree-shaking y un build optimizado para produccion.

### Caracteristicas visuales

- **Estetica dark terminal / fintech:** paleta `#0a0c10`, tipografias `Syne` + `DM Mono`.
- **Layout ajustable:** sidebar colapsable, paneles del dashboard colapsables individualmente.
- **Mapa global interactivo:** Leaflet con burbujas por pais (tamano = volumen, color = senal IA).
- **Panel de senales IA:** mercados top con badges alcista/bajista/neutral y barras de probabilidad.
- **Detalle de mercado:** sparklines, historial de precios 7d, analisis IA y simulador de posiciones.
- **Vistas adicionales:** Posiciones abiertas, Lista de seguimiento, Historial de alertas.

### Flujo de desarrollo

| Servicio | Comando | URL local |
|----------|---------|-----------|
| Backend (Express + Socket.io) | `npm run dev` | `http://localhost:7860` |
| Frontend (Vite + HMR) | `npm run dev:frontend` | `http://localhost:5173` |
| **Ambos a la vez** | **`npm run dev:all`** | — |

Vite esta configurado con un proxy que redirige automaticamente las peticiones a `/api` y `/socket.io` hacia el backend en el puerto `7860`, eliminando problemas de CORS durante el desarrollo local.

### Scripts disponibles

```bash
# Levantar solo el backend
npm run dev

# Levantar solo el frontend (Vite con hot reload)
npm run dev:frontend

# Levantar backend y frontend simultaneamente en una sola terminal
npm run dev:all

# Build de produccion del frontend (genera frontend/dist/)
npm run build:frontend

# Preview del build de produccion
npm run preview:frontend
```

### Build de produccion

```bash
npm run build:frontend
```

Esto genera los assets optimizados en `frontend/dist/`. En produccion (HuggingFace Spaces), el backend Express sirve directamente esa carpeta como archivos estaticos.

## Deploy en HuggingFace Spaces

1. Crear Space tipo "Docker"
2. Subir codigo (`git push`)
3. Configurar Secrets en la interfaz de HF con las variables de `.env`
4. El contenedor expone el puerto 7860 automaticamente

### Docker local (opcional)

```bash
# Build y run con docker-compose
docker-compose up --build

# O solo docker build
docker build -t polysignal .
docker run -p 7860:7860 --env-file .env polysignal
```

## Equipo

Hackathon CIFO Barcelona La Violeta — 13-18 mayo 2026

## Licencia

MIT
