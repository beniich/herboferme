╔════════════════════════════════════════════════════════════════════════════════╗
║      ⚡ HERBOFERME QUICK START - PRODUCTION DEPLOY (1 HOUR)                   ║
╚════════════════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Node.js 20+
✅ MongoDB connected
✅ Redis running
✅ JWT keys generated (openssl genrsa -out private.key 2048)
✅ Environment variables configured


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️  TIMELINE (60 MINUTES)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

0-5 min:   Setup environment
5-15 min:  Copy backend files
15-25 min: Copy frontend files
25-35 min: Install & build
35-50 min: Test
50-60 min: Deploy


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1: Environment Setup (5 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1.1 Create .env file
────────────────────

# backend/.env
NODE_ENV=production
PORT=2065

MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/herboferme
REDIS_HOST=localhost
REDIS_PORT=6379

JWT_PRIVATE_KEY_PATH=/etc/secrets/jwt.private.key
JWT_PUBLIC_KEY_PATH=/etc/secrets/jwt.public.key
JWT_EXPIRY=24h

ALLOWED_ORIGINS=https://herboferme.com,https://app.herboferme.com
BCRYPT_ROUNDS=12

SENTRY_DSN=https://your-sentry-dsn
LOG_LEVEL=warn


1.2 Create frontend .env.local
──────────────────────────────

# frontend/.env.local
NEXT_PUBLIC_API_URL=https://api.herboferme.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id


1.3 Verify Redis
────────────────

# Terminal 1
docker run -d -p 6379:6379 redis:7-alpine

# Terminal 2
redis-cli ping
# Output: PONG ✓


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2: Backend Setup (10 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2.1 Copy security files
──────────────────────

File: 01-BACKEND-SECURITY-PRODUCTION.ts

1. Copy all 12 sections to their respective files:
   ✓ config/env.ts
   ✓ config/jwt.ts
   ✓ utils/password.ts
   ✓ utils/logger.ts
   ✓ middleware/cors.ts
   ✓ middleware/https.ts
   ✓ middleware/rateLimiter.ts
   ✓ middleware/auth.ts
   ✓ middleware/authorize.ts
   ✓ validators/index.ts
   ✓ middleware/errorHandler.ts
   ✓ server.ts


2.2 Install dependencies
────────────────────────

cd backend/
npm install bcryptjs jsonwebtoken helmet cors express-rate-limit rate-limit-redis redis express-validator winston


2.3 Generate JWT keys (if not exists)
─────────────────────────────────────

openssl genrsa -out /etc/secrets/jwt.private.key 2048
openssl rsa -in /etc/secrets/jwt.private.key -pubout -out /etc/secrets/jwt.public.key


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3: Frontend Setup (10 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3.1 Copy hook files
───────────────────

File: 02-FRONTEND-HOOKS-PRODUCTION.ts

Copy sections to:
  ✓ lib/api-client.ts
  ✓ types/index.ts
  ✓ hooks/useFetch.ts
  ✓ hooks/useDomainData.ts
  ✓ hooks/useDashboardData.ts
  ✓ hooks/useMutation.ts
  ✓ hooks/useAuth.ts


3.2 Copy page files
───────────────────

File: 03-FRONTEND-PAGES-PRODUCTION.tsx

Copy sections to:
  ✓ components/shared/StatCard.tsx
  ✓ components/shared/Skeleton.tsx
  ✓ components/shared/ErrorFallback.tsx
  ✓ app/dashboard/page.tsx
  ✓ app/animals/page.tsx


3.3 Install dependencies
────────────────────────

cd frontend/
npm install swr axios react-hot-toast


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 4: Build & Test (15 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4.1 Backend type check
──────────────────────

cd backend/
npm run type-check

Expected output: No errors


4.2 Frontend type check
──────────────────────

cd frontend/
npm run type-check

Expected output: No errors


4.3 Build backend
─────────────────

cd backend/
npm run build

Expected output: ✓ Build successful


4.4 Build frontend
──────────────────

cd frontend/
npm run build

Expected output: ✓ Build successful


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 5: Local Testing (10 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5.1 Start backend
─────────────────

# Terminal 1
cd backend/
npm start

Expected output:
✅ Database connected
✅ Server running on port 2065


5.2 Start frontend
──────────────────

# Terminal 2
cd frontend/
npm start

Expected output:
✓ Ready in 2.5s
✓ http://localhost:3000


5.3 Test authentication flow
─────────────────────────────

1. Open http://localhost:3000/login
2. Create test user (or use seeded user)
3. Login with email: test@herboferme.com, password: Test@123456
4. Should redirect to /dashboard
5. Verify: Dashboard loads with data


5.4 Test API security
──────────────────────

# Test 1: Missing authorization
curl -X GET http://localhost:2065/api/animals
# Expected: 401 Unauthorized

# Test 2: Invalid token
curl -H "Authorization: Bearer invalid" http://localhost:2065/api/animals
# Expected: 401 Unauthorized

# Test 3: Rate limiting
for i in {1..101}; do curl http://localhost:2065/api/; done
# Expected: 429 Too Many Requests after 100 requests

# Test 4: CORS violation
curl -H "Origin: https://evil.com" http://localhost:2065/api/animals
# Expected: CORS error


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 6: Deploy to Production (15 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

6.1 Docker Setup
────────────────

# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/
EXPOSE 2065

ENV NODE_ENV=production
CMD ["npm", "start"]


6.2 Docker Compose
──────────────────

# docker-compose.prod.yml
version: '3.8'

services:
  api:
    build: ./backend
    ports:
      - "2065:2065"
    environment:
      NODE_ENV: production
      MONGO_URI: ${MONGO_URI}
      REDIS_HOST: redis
      JWT_PRIVATE_KEY_PATH: /run/secrets/jwt_private
      JWT_PUBLIC_KEY_PATH: /run/secrets/jwt_public
    depends_on:
      - redis
      - mongo
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped

  mongo:
    image: mongo:7
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    restart: unless-stopped


6.3 Deploy
──────────

# Option 1: Docker
docker-compose -f docker-compose.prod.yml up -d

# Option 2: Kubernetes
kubectl apply -f k8s/api-deployment.yaml

# Option 3: Cloud (Vercel, Railway, Heroku)
# Follow platform-specific deployment guides


6.4 Verify Deployment
──────────────────────

curl -I https://api.herboferme.com/health
# Expected: 200 OK

curl -I https://herboferme.com
# Expected: 200 OK + HSTS header


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ VERIFICATION CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Backend:
  ☐ Type check: PASS
  ☐ Build: SUCCESS
  ☐ Server starts: ✓
  ☐ Health endpoint responds: ✓
  ☐ JWT auth working: ✓
  ☐ Rate limiting active: ✓
  ☐ CORS configured: ✓
  ☐ Logging structured: ✓
  ☐ Error handling safe: ✓

Frontend:
  ☐ Type check: PASS
  ☐ Build: SUCCESS
  ☐ SWR hooks working: ✓
  ☐ Authentication flow: ✓
  ☐ Dashboard loads: ✓
  ☐ Pages optimized: ✓

Security:
  ☐ HTTPS enforced: ✓
  ☐ HSTS header: ✓
  ☐ CSP configured: ✓
  ☐ Passwords hashed: ✓
  ☐ Permissions backend: ✓
  ☐ Input validated: ✓
  ☐ Errors safe: ✓

Performance:
  ☐ TTI < 2s: ✓
  ☐ LCP < 1.2s: ✓
  ☐ Cache working: ✓
  ☐ DB pooling: ✓
  ☐ Redis running: ✓


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 TROUBLESHOOTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"ECONNREFUSED" on MongoDB
→ Check MONGO_URI is correct
→ Verify MongoDB is running

"ECONNREFUSED" on Redis
→ Check Redis port 6379
→ docker ps to verify container

"401 Unauthorized" on API
→ Token missing? Check Authorization header
→ Token invalid? Check JWT keys exist
→ Token expired? Generate new one

"Cannot find module"
→ npm install [missing-package]

"Port already in use"
→ lsof -i :2065 (find process)
→ kill -9 [PID] (stop process)

Build fails with TypeScript errors
→ Check types are correct
→ npm run type-check to see details


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 PERFORMANCE METRICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Expected:
  TTI: 1.8s ✓
  LCP: 1.1s ✓
  API cache hit: 80%+ ✓
  DB queries: < 50ms ✓
  Lighthouse: > 90 ✓


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 SUCCESS!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your Herboferme application is now:
✅ Production-ready
✅ Secure (HTTPS, JWT, Rate limiting, Permissions)
✅ Optimized (SWR, Memoization, Caching)
✅ Observable (Logging, Error tracking)
✅ Scalable (API Gateway, DB pooling, Redis)

Time taken: ~60 minutes
Status: READY FOR PRODUCTION ✓

Next steps:
1. Setup monitoring (Sentry, DataDog)
2. Configure CI/CD (GitHub Actions, GitLab CI)
3. Setup alerts & logging aggregation
4. Start scaling based on traffic
