# ════════════════════════════════════════════════
#  Herbute Backend — Multi-stage Dockerfile
#  Stage 1: deps     → install production deps
#  Stage 2: builder  → compile TypeScript
#  Stage 3: production → image minimale
# ════════════════════════════════════════════════

# ── Stage 1: Dépendances ──────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Cache npm efficace : copier d'abord les manifestes
COPY package.json package-lock.json* ./
RUN npm ci --only=production && \
    cp -R node_modules /prod_node_modules && \
    npm ci

# ── Stage 2: Build TypeScript ─────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ── Stage 3: Production ───────────────────────
FROM node:20-alpine AS production
WORKDIR /app

# Sécurité : installation de wget pour le healthcheck et création utilisateur
RUN apk add --no-cache wget && \
    addgroup -g 1001 -S herbute && \
    adduser  -u 1001 -S herbute -G herbute

# Copier les fichiers de build et dépendances prod
COPY --from=deps     --chown=herbute:herbute /prod_node_modules ./node_modules
COPY --from=builder  --chown=herbute:herbute /app/dist          ./dist
COPY --from=builder  --chown=herbute:herbute /app/package.json  ./

# IMPORTANT : Copier les clés pour RS256 (doivent être générées/présentes)
# En production, il est recommandé de monter ce dossier via un volume secret ou Kubernetes Secrets
COPY --chown=herbute:herbute keys/ ./keys/

# Dossiers pour les données et logs
RUN mkdir -p uploads logs && \
    chown -R herbute:herbute uploads logs

USER herbute

ENV NODE_ENV=production
ENV PORT=2065

EXPOSE 2065

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget -qO- http://localhost:2065/health || exit 1

CMD ["node", "dist/server.js"]
