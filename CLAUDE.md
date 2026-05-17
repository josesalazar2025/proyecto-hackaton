# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PolySignal** — a real-time prediction market intelligence dashboard. It fetches market data from Polymarket, enriches it with financial news via Finnhub, runs AI sentiment analysis (ModernFinBERT + Qwen3-8B), and displays signals on an interactive world map. No real trading — pure analysis and virtual simulation. Built for CIFO Barcelona La Violeta Hackathon (May 2026). UI and docs are in **Spanish**, base currency is **Euro (€)**.

## Common Commands

```bash
# Development (backend + frontend simultaneously)
npm run dev:all

# Backend only (with --watch)
npm run dev

# Frontend only (Vite @ :5173)
npm run dev:frontend

# Production build (frontend)
npm run build:frontend

# Database
npm run db:migrate    # Apply Prisma migrations
npm run db:generate   # Regenerate Prisma client
npm run db:studio     # Open Prisma Studio GUI

# Docker
docker-compose up --build   # Full stack on port 7860
```

Node.js **≥24.0.0** is required (enforced in package.json engines).

First-time setup:
```bash
npm install
cp .env.example .env   # then fill in API keys
npm run db:migrate && npm run db:generate
```

## Architecture

Monorepo with two workspaces: `backend/` (Express 5 + Socket.io) and `frontend/` (Vanilla JS + Vite).

### Backend (`backend/src/`)

Follows a strict **Controller → Service → Repository → Client** layered pattern. Each domain lives in its own directory:

| Directory | Responsibility |
|-----------|---------------|
| `markets/` | Polymarket Gamma API client + sync job |
| `signals/` | AI pipeline (aiPipeline.js) + signals service |
| `finnhub/` | Finnhub news client + service |
| `positions/` | Virtual position simulator + Kelly Criterion sizing |
| `watchlist/` | User-saved markets |
| `alerts/` | Telegram Bot notification delivery |
| `auth/` | JWT + bcryptjs login |
| `socket/` | Socket.io broadcaster |
| `middlewares/` | Auth, validation, error handling, rate limiting |
| `utils/` | Pino logger, HTTP client, Prisma singleton |

Entry points: `src/index.js` (HTTP server + Socket.io setup) → `src/app.js` (Express middleware + route mounting) → `src/scheduler.js` (cron jobs).

Environment/config validated at startup via **Zod** in `src/config.js` — the app crashes fast if required env vars are missing.

### Scheduler Jobs

| Job | Frequency | What it does |
|-----|-----------|-------------|
| `syncMarkets` | 30s | Fetches top 100 active Polymarket markets, broadcasts price changes via Socket.io |
| `generateSignals` | 5m | Runs full AI pipeline on top 20 active markets |
| `updatePositionsPnL` | 30s | Recalculates P&L for open virtual positions |
| `processAlerts` | 1m | Checks watchlist thresholds, fires Telegram alerts |

### AI Signal Pipeline (`signals/aiPipeline.js`)

Three-phase flow with automatic fallbacks:

1. **News filtering** — Finnhub headlines → ModernFinBERT (HF Space) → keep only scores ≥ 0.65, drop neutral
2. **Signal generation** — market data + filtered news → Qwen3-8B (HF Space) → `{ signal, confidence, summary, keyRisk }`
3. **Fallback chain**: HF Space → HF direct inference API → OpenRouter (deepseek-chat) → rule-based (price-trend logic)

### Frontend (`frontend/src/`)

Single-page app with no framework. Key modules:

| File | Role |
|------|------|
| `app.js` | SPA routing, DOM rendering, Socket.io listeners |
| `api.js` | REST client wrapper with JWT token management |
| `map.js` | Leaflet world map (bubble size = volume, color = signal) |
| `charts.js` | Chart.js sparklines + 7-day price history |
| `simulator.js` | Virtual buy/sell logic |
| `filters.js` | Market filtering by category, country, continent, trend |

Vite proxies `/api` and `/socket.io` to backend (`localhost:7860`) during development.

### Database (SQLite via Prisma)

Schema at `backend/prisma/schema.prisma`. Key models:
- `Market` — Polymarket data (prices, volume, category, country code)
- `AISignal` — sentiment signals with confidence and risk summary
- `Position` — virtual trades with entry/exit prices and P&L
- `Watchlist` / `Alert` — user market tracking and Telegram history
- `User` — auth + optional Telegram chat ID

### Real-time Communication

REST API at `/api/v1/*` + WebSocket events via Socket.io:
- `market_update` — price/volume changes
- `ai_signal` — new sentiment signals
- `price_alert` — watchlist threshold triggers

## Deployment Target

The app is designed to run on **HuggingFace Spaces** (port 7860). The Dockerfile uses `node:22-slim`, installs backend deps, copies the frontend `dist/`, runs Prisma generate, and starts the server. The frontend is served as static files by Express in production.

## Key Environment Variables

See `.env.example` for the full list. Critical ones:

```
HF_SPACE_MODERNFINBERT_URL   # HuggingFace Space for FinBERT
HF_SPACE_QWEN_URL            # HuggingFace Space for Qwen3-8B
HF_TOKEN                     # HF inference API key (fallback)
OPENROUTER_API_KEY           # LLM fallback if HF is down
FINNHUB_API_KEY              # News source
TELEGRAM_BOT_TOKEN           # Alert delivery
JWT_SECRET                   # Must be ≥32 characters
PORT=7860                    # Required by HF Spaces
DATABASE_URL=file:./backend/prisma/polysignal.db
```
