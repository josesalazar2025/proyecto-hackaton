# Dockerfile — PolySignal
#
# Estructura multicontexto:
#   - backend/  : API Node.js + Express + Socket.io + Prisma
#   - frontend/ : SPA Vanilla JS (servida como estaticos)
#
# Pasos:
#   1. Establecer WORKDIR en /app
#   2. Copiar e instalar dependencias del backend
#   3. Copiar e instalar dependencias del frontend y construir (vite build)
#   4. Copiar todo el codigo fuente del backend
#   5. Generar cliente Prisma para SQLite
#   6. Exponer puerto 7860 (requerido por HuggingFace Spaces)
#   7. Iniciar aplicacion con: node backend/src/index.js
#
# Build local:  docker build -t polysignal .
# Run local:    docker run -p 7860:7860 --env-file .env polysignal

FROM node:24-slim
RUN apt-get update -y && apt-get install -y openssl
WORKDIR /app

# Instalar dependencias del backend
COPY backend/package*.json ./backend/
RUN cd backend && npm install --only=production

# Instalar dependencias del frontend y construir
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Copiar codigo fuente del backend
COPY backend/ ./backend/

# Generar cliente Prisma
RUN cd backend && npx prisma generate

# Copiar entrypoint
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Puerto obligatorio de HuggingFace Spaces
EXPOSE 7860

CMD ["./entrypoint.sh"]
