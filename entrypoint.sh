#!/bin/sh
set -e

echo "[entrypoint] Syncing Prisma schema (ephemeral SQLite)..."
cd backend
# db push avoids broken migration issues on ephemeral containers
npx prisma db push --accept-data-loss

echo "[entrypoint] Seeding demo users..."
node prisma/seed.js

echo "[entrypoint] Starting PolySignal server..."
exec node src/index.js
