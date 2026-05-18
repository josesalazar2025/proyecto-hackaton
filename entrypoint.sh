#!/bin/sh
set -e

echo "[entrypoint] Running Prisma migrate deploy..."
cd backend
npx prisma migrate deploy

echo "[entrypoint] Starting PolySignal server..."
exec node src/index.js
