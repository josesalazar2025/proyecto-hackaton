# Dockerfile — PolySignal
#
# Estructura multicontexto:
#   - backend/  : API Node.js + Express + Socket.io + Prisma
#   - frontend/ : SPA Vanilla JS (servida como estaticos)
#
# Pasos:
#   1. Establecer WORKDIR en /app/backend
#   2. Copiar backend/package.json e instalar dependencias
#   3. Copiar todo el codigo fuente (backend/ + frontend/)
#   4. Generar cliente Prisma para SQLite
#   5. Exponer puerto 7860 (requerido por HuggingFace Spaces)
#   6. Iniciar aplicacion con: node backend/src/index.js
#
# Build local:  docker build -t polysignal .
# Run local:    docker run -p 7860:7860 --env-file .env polysignal

FROM node:22-slim
WORKDIR /app

# Instalar dependencias del backend
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Copiar codigo fuente completo
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Generar cliente Prisma
RUN cd backend && npx prisma generate

# Puerto obligatorio de HuggingFace Spaces
EXPOSE 7860

CMD ["node", "backend/src/index.js"]
