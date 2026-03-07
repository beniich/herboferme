# 🐳 Configuration Docker & Kubernetes - FootballHub+

## 📋 Table des Matières
1. [Docker Configuration](#docker-configuration)
2. [Docker Compose](#docker-compose)
3. [Kubernetes Deployment](#kubernetes-deployment)
4. [CI/CD Pipeline](#cicd-pipeline)

---

## 🐳 Docker Configuration

### Dockerfile Backend (Multi-stage)

```dockerfile
# docker/Dockerfile.backend

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY apps/ ./apps/
COPY libs/ ./libs/

# Build application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 4000

CMD ["node", "dist/apps/api-gateway/main.js"]
```

### Dockerfile Frontend

```dockerfile
# docker/Dockerfile.frontend

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy built application
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### .dockerignore

```
# .dockerignore

node_modules
npm-debug.log
.next
.git
.gitignore
README.md
.env*
dist
coverage
.vscode
.idea
*.md
```

---

## 🐙 Docker Compose

### docker-compose.yml (Development)

```yaml
version: '3.8'

services:
  # ============ DATABASES ============
  postgres:
    image: postgres:15-alpine
    container_name: footballhub-postgres
    environment:
      POSTGRES_USER: footballhub
      POSTGRES_PASSWORD: footballhub_secret
      POSTGRES_DB: footballhub
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - footballhub-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U footballhub"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: footballhub-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - footballhub-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ============ MESSAGE QUEUE ============
  rabbitmq:
    image: rabbitmq:3-management-alpine
    container_name: footballhub-rabbitmq
    environment:
      RABBITMQ_DEFAULT_USER: footballhub
      RABBITMQ_DEFAULT_PASS: footballhub_secret
    ports:
      - "5672:5672"
      - "15672:15672"
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    networks:
      - footballhub-network
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 30s
      timeout: 10s
      retries: 5

  # ============ BACKEND SERVICES ============
  api-gateway:
    build:
      context: .
      dockerfile: docker/Dockerfile.backend
      target: builder
    container_name: footballhub-api-gateway
    environment:
      DATABASE_URL: postgresql://footballhub:footballhub_secret@postgres:5432/footballhub
      REDIS_HOST: redis
      REDIS_PORT: 6379
      JWT_SECRET: dev-jwt-secret-change-in-production
      NODE_ENV: development
    ports:
      - "4000:4000"
    volumes:
      - ./apps:/app/apps
      - ./libs:/app/libs
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - footballhub-network
    command: npm run start:dev api-gateway

  auth-service:
    build:
      context: .
      dockerfile: docker/Dockerfile.backend
      target: builder
    container_name: footballhub-auth-service
    environment:
      DATABASE_URL: postgresql://footballhub:footballhub_secret@postgres:5432/footballhub
      REDIS_HOST: redis
      JWT_SECRET: dev-jwt-secret-change-in-production
      NODE_ENV: development
    ports:
      - "4001:4001"
    volumes:
      - ./apps:/app/apps
      - ./libs:/app/libs
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - footballhub-network
    command: npm run start:dev auth-service

  ticket-service:
    build:
      context: .
      dockerfile: docker/Dockerfile.backend
      target: builder
    container_name: footballhub-ticket-service
    environment:
      DATABASE_URL: postgresql://footballhub:footballhub_secret@postgres:5432/footballhub
      REDIS_HOST: redis
      NODE_ENV: development
    ports:
      - "4002:4002"
    volumes:
      - ./apps:/app/apps
      - ./libs:/app/libs
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - footballhub-network
    command: npm run start:dev ticket-service

  event-service:
    build:
      context: .
      dockerfile: docker/Dockerfile.backend
      target: builder
    container_name: footballhub-event-service
    environment:
      DATABASE_URL: postgresql://footballhub:footballhub_secret@postgres:5432/footballhub
      NODE_ENV: development
    ports:
      - "4003:4003"
    volumes:
      - ./apps:/app/apps
      - ./libs:/app/libs
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - footballhub-network
    command: npm run start:dev event-service

  shop-service:
    build:
      context: .
      dockerfile: docker/Dockerfile.backend
      target: builder
    container_name: footballhub-shop-service
    environment:
      DATABASE_URL: postgresql://footballhub:footballhub_secret@postgres:5432/footballhub
      NODE_ENV: development
    ports:
      - "4004:4004"
    volumes:
      - ./apps:/app/apps
      - ./libs:/app/libs
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - footballhub-network
    command: npm run start:dev shop-service

  payment-service:
    build:
      context: .
      dockerfile: docker/Dockerfile.backend
      target: builder
    container_name: footballhub-payment-service
    environment:
      DATABASE_URL: postgresql://footballhub:footballhub_secret@postgres:5432/footballhub
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET}
      NODE_ENV: development
    ports:
      - "4005:4005"
    volumes:
      - ./apps:/app/apps
      - ./libs:/app/libs
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - footballhub-network
    command: npm run start:dev payment-service

  # ============ FRONTEND ============
  frontend:
    build:
      context: ./frontend
      dockerfile: ../docker/Dockerfile.frontend
      args:
        NEXT_PUBLIC_API_URL: http://localhost:4000
    container_name: footballhub-frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:4000
    ports:
      - "3000:3000"
    volumes:
      - ./frontend/src:/app/src
      - ./frontend/public:/app/public
      - /app/node_modules
      - /app/.next
    depends_on:
      - api-gateway
    networks:
      - footballhub-network
    command: npm run dev

  # ============ MONITORING ============
  prometheus:
    image: prom/prometheus:latest
    container_name: footballhub-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    networks:
      - footballhub-network

  grafana:
    image: grafana/grafana:latest
    container_name: footballhub-grafana
    ports:
      - "3001:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
    volumes:
      - grafana_data:/var/lib/grafana
    depends_on:
      - prometheus
    networks:
      - footballhub-network

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:
  prometheus_data:
  grafana_data:

networks:
  footballhub-network:
    driver: bridge
```

---

## ☸️ Kubernetes Deployment

### Namespace

```yaml
# k8s/namespace.yaml

apiVersion: v1
kind: Namespace
metadata:
  name: footballhub
  labels:
    name: footballhub
```

### ConfigMap

```yaml
# k8s/configmaps/app-config.yaml

apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: footballhub
data:
  NODE_ENV: "production"
  REDIS_HOST: "redis-service"
  REDIS_PORT: "6379"
  RABBITMQ_HOST: "rabbitmq-service"
  RABBITMQ_PORT: "5672"
```

### Secrets

```yaml
# k8s/secrets/app-secrets.yaml

apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: footballhub
type: Opaque
stringData:
  DATABASE_URL: postgresql://user:password@postgres:5432/footballhub
  JWT_SECRET: your-super-secret-jwt-key
  JWT_REFRESH_SECRET: your-refresh-secret
  STRIPE_SECRET_KEY: sk_live_...
  STRIPE_WEBHOOK_SECRET: whsec_...
  AWS_ACCESS_KEY_ID: your-access-key
  AWS_SECRET_ACCESS_KEY: your-secret-key
```

### PostgreSQL Deployment

```yaml
# k8s/deployments/postgres.yaml

apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: footballhub
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: footballhub
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_DB
          value: footballhub
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: POSTGRES_USER
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: POSTGRES_PASSWORD
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  namespace: footballhub
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
  type: ClusterIP
```

### Redis Deployment

```yaml
# k8s/deployments/redis.yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: footballhub
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        resources:
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: redis-service
  namespace: footballhub
spec:
  selector:
    app: redis
  ports:
  - port: 6379
    targetPort: 6379
  type: ClusterIP
```

### API Gateway Deployment

```yaml
# k8s/deployments/api-gateway.yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: footballhub
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: api-gateway
        image: footballhub/api-gateway:latest
        ports:
        - containerPort: 4000
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: NODE_ENV
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: DATABASE_URL
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: JWT_SECRET
        - name: REDIS_HOST
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: REDIS_HOST
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 4000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 4000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: api-gateway-service
  namespace: footballhub
spec:
  selector:
    app: api-gateway
  ports:
  - port: 80
    targetPort: 4000
  type: LoadBalancer
```

### Ticket Service Deployment

```yaml
# k8s/deployments/ticket-service.yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: ticket-service
  namespace: footballhub
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ticket-service
  template:
    metadata:
      labels:
        app: ticket-service
    spec:
      containers:
      - name: ticket-service
        image: footballhub/ticket-service:latest
        ports:
        - containerPort: 4002
        envFrom:
        - configMapRef:
            name: app-config
        - secretRef:
            name: app-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: ticket-service
  namespace: footballhub
spec:
  selector:
    app: ticket-service
  ports:
  - port: 4002
    targetPort: 4002
  type: ClusterIP
```

### Horizontal Pod Autoscaler

```yaml
# k8s/hpa/api-gateway-hpa.yaml

apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-gateway-hpa
  namespace: footballhub
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-gateway
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Ingress

```yaml
# k8s/ingress/ingress.yaml

apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: footballhub-ingress
  namespace: footballhub
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - api.footballhub.com
    - app.footballhub.com
    secretName: footballhub-tls
  rules:
  - host: api.footballhub.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-gateway-service
            port:
              number: 80
  - host: app.footballhub.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml

name: Deploy FootballHub

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_PREFIX: footballhub

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm run test

      - name: Run e2e tests
        run: npm run test:e2e

  build-and-push:
    name: Build and Push Docker Images
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    strategy:
      matrix:
        service:
          - api-gateway
          - auth-service
          - ticket-service
          - event-service
          - shop-service
          - payment-service
    steps:
      - uses: actions/checkout@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_PREFIX }}/${{ matrix.service }}
          tags: |
            type=ref,event=branch
            type=sha,prefix={{branch}}-

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          file: docker/Dockerfile.backend
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    name: Deploy to Kubernetes
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3

      - name: Configure kubectl
        uses: azure/k8s-set-context@v3
        with:
          method: kubeconfig
          kubeconfig: ${{ secrets.KUBE_CONFIG }}

      - name: Deploy to Kubernetes
        run: |
          kubectl apply -f k8s/namespace.yaml
          kubectl apply -f k8s/configmaps/
          kubectl apply -f k8s/secrets/
          kubectl apply -f k8s/deployments/
          kubectl apply -f k8s/services/
          kubectl apply -f k8s/ingress/
          
      - name: Verify deployment
        run: |
          kubectl rollout status deployment/api-gateway -n footballhub
          kubectl rollout status deployment/ticket-service -n footballhub
          kubectl get pods -n footballhub

  notify:
    name: Notify Deployment
    needs: deploy
    runs-on: ubuntu-latest
    if: always()
    steps:
      - name: Send Slack notification
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: |
            Deployment ${{ job.status }}!
            Commit: ${{ github.event.head_commit.message }}
            Author: ${{ github.event.head_commit.author.name }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 🚀 Commandes Utiles

### Docker Compose

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter tous les services
docker-compose down

# Reconstruire les images
docker-compose up -d --build

# Exécuter les migrations
docker-compose exec api-gateway npx prisma migrate deploy
```

### Kubernetes

```bash
# Appliquer toutes les configurations
kubectl apply -f k8s/

# Voir les pods
kubectl get pods -n footballhub

# Voir les logs d'un pod
kubectl logs -f <pod-name> -n footballhub

# Redémarrer un deployment
kubectl rollout restart deployment/api-gateway -n footballhub

# Scaler un deployment
kubectl scale deployment/api-gateway --replicas=5 -n footballhub

# Port forward
kubectl port-forward svc/api-gateway-service 4000:80 -n footballhub
```

---

## 📊 Monitoring

### Prometheus Configuration

```yaml
# monitoring/prometheus.yml

global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'api-gateway'
    static_configs:
      - targets: ['api-gateway:4000']

  - job_name: 'ticket-service'
    static_configs:
      - targets: ['ticket-service:4002']

  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
```

Voilà ! Vous avez maintenant une configuration complète pour déployer FootballHub+ avec Docker et Kubernetes. 🚀
