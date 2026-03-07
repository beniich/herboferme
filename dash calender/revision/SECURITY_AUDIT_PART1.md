# 🔒 FootballHub+ - AUDIT DE SÉCURITÉ COMPLET & CORRECTIFS

## 🚨 VULNÉRABILITÉS IDENTIFIÉES

### ❌ Backend (Critique)

1. **Headers HTTP non protégés**
   - Pas de `helmet` pour XSS, Clickjacking, MIME sniffing
   - Risque: Injection de scripts malveillants, vol de session

2. **Rate Limiting absent**
   - Aucune protection contre force brute
   - Aucune protection contre DDoS
   - Risque: Attaques par dictionnaire sur /login, surcharge serveur

3. **CORS trop permissif**
   - `app.use(cors())` autorise TOUT
   - Risque: Requêtes cross-origin malveillantes

4. **Sanitization manquante**
   - Pas de protection NoSQL injection
   - Pas de nettoyage XSS
   - Risque: Injection de code dans MongoDB, vol de données

5. **JWT sans expiration courte**
   - Token valide 30 jours
   - Risque: Vol de token = accès permanent

6. **Pas de logging des tentatives échouées**
   - Impossible de détecter attaques
   - Pas d'alertes

7. **Passwords en texte clair dans logs**
   - Risque: Exposition en cas de compromission

8. **Pas de HTTPS forcé**
   - Trafic non chiffré possible
   - Risque: Man-in-the-middle

9. **Variables d'environnement exposées**
   - `.env` peut être committé
   - Risque: Exposition des secrets

10. **Pas de validation stricte des inputs**
    - Joi présent mais pas utilisé partout
    - Risque: Injection SQL/NoSQL

---

## 🛡️ CORRECTIFS IMMÉDIATS

### ÉTAPE 1 : Installation des Packages de Sécurité

```bash
cd server

# Packages de sécurité essentiels
npm install helmet express-rate-limit express-mongo-sanitize xss-clean hpp express-validator compression

# Logging sécurisé
npm install winston winston-daily-rotate-file

# Monitoring
npm install express-status-monitor

# HTTPS/SSL
npm install express-enforce-ssl
```

---

### ÉTAPE 2 : Nouveau src/index.js SÉCURISÉ

```javascript
// src/index.js - VERSION SÉCURISÉE
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const morgan = require('morgan');
const logger = require('./utils/logger'); // Winston logger

const app = express();

// ============================================================================
// 1. TRUST PROXY (pour rate limiting derrière reverse proxy)
// ============================================================================
app.set('trust proxy', 1);

// ============================================================================
// 2. HELMET - Protection Headers HTTP
// ============================================================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
}));

// ============================================================================
// 3. CORS - Configuration Stricte
// ============================================================================
const whitelist = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://footballhub.ma',
  'https://www.footballhub.ma',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// ============================================================================
// 4. RATE LIMITING - Protection Force Brute & DDoS
// ============================================================================

// Global rate limit
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per 15min
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later',
    });
  },
});

// Strict rate limit for authentication
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Max 5 login attempts per 15min
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes',
  },
});

// Apply limiters
app.use('/api/', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ============================================================================
// 5. DATA SANITIZATION
// ============================================================================

// NoSQL Injection Protection
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    logger.warn(`NoSQL injection attempt detected: ${key} from ${req.ip}`);
  },
}));

// XSS Protection
app.use(xss());

// HTTP Parameter Pollution Protection
app.use(hpp({
  whitelist: ['sort', 'fields', 'page', 'limit'], // Allow these params multiple times
}));

// ============================================================================
// 6. BODY PARSER avec Limites
// ============================================================================
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      logger.error('Invalid JSON received');
      throw new Error('Invalid JSON');
    }
  },
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 1000, // Max 1000 params
}));

// ============================================================================
// 7. COMPRESSION
// ============================================================================
app.use(compression());

// ============================================================================
// 8. LOGGING SÉCURISÉ
// ============================================================================
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
  skip: (req) => req.url === '/api/health', // Skip health checks
}));

// ============================================================================
// 9. MONGODB CONNECTION avec Options Sécurisées
// ============================================================================
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  maxPoolSize: 10,
  minPoolSize: 2,
  retryWrites: true,
  retryReads: true,
};

mongoose
  .connect(process.env.MONGODB_URI, mongoOptions)
  .then(() => {
    logger.info('✅ MongoDB connected successfully');
  })
  .catch((err) => {
    logger.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Mongoose connection events
mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

// ============================================================================
// 10. ROUTES
// ============================================================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/members', require('./routes/members'));
app.use('/api/events', require('./routes/events'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/leagues', require('./routes/leagues'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/news', require('./routes/news'));
app.use('/api/standings', require('./routes/standings'));
app.use('/api/favorites', require('./routes/favorites'));

// ============================================================================
// 11. HEALTH CHECK (sans rate limit)
// ============================================================================
app.get('/api/health', (req, res) => {
  const healthcheck = {
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    memory: process.memoryUsage(),
  };
  res.status(200).json(healthcheck);
});

// ============================================================================
// 12. ERROR HANDLING
// ============================================================================

// 404 Handler
app.use((req, res) => {
  logger.warn(`404 Not Found: ${req.method} ${req.url} from ${req.ip}`);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    body: req.body,
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(err.status || 500).json({
    success: false,
    message: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { 
      stack: err.stack,
      error: err,
    }),
  });
});

// ============================================================================
// 13. GRACEFUL SHUTDOWN
// ============================================================================
const gracefulShutdown = async () => {
  logger.info('⏸️  Shutting down gracefully...');

  try {
    await mongoose.connection.close();
    logger.info('👋 MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    logger.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  gracefulShutdown();
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  gracefulShutdown();
});

// ============================================================================
// 14. START SERVER
// ============================================================================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info('\n🚀 =====================================');
  logger.info(`   FootballHub+ API Server (SECURED)`);
  logger.info('   =====================================');
  logger.info(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`   Port: ${PORT}`);
  logger.info(`   URL: http://localhost:${PORT}`);
  logger.info(`   Health: http://localhost:${PORT}/api/health`);
  logger.info('   🔒 Security: ENABLED');
  logger.info('   =====================================\n');
});

// Handle server errors
server.on('error', (err) => {
  logger.error('Server error:', err);
  process.exit(1);
});

module.exports = app;
```

---

### ÉTAPE 3 : Logger Winston Sécurisé

```javascript
// src/utils/logger.js
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Custom format to remove sensitive data
const sanitizeFormat = winston.format((info) => {
  // Remove password from logs
  if (info.body && info.body.password) {
    info.body.password = '[REDACTED]';
  }
  
  // Remove tokens
  if (info.authorization) {
    info.authorization = '[REDACTED]';
  }
  
  return info;
})();

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    sanitizeFormat,
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'footballhub-api',
    environment: process.env.NODE_ENV,
  },
  transports: [
    // Error logs
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true,
    }),
    
    // Combined logs
    new DailyRotateFile({
      filename: path.join(logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true,
    }),
    
    // Security logs (failed login, rate limits, etc.)
    new DailyRotateFile({
      filename: path.join(logsDir, 'security-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'warn',
      maxSize: '20m',
      maxFiles: '30d',
      zippedArchive: true,
    }),
  ],
});

// Console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
      )
    ),
  }));
}

module.exports = logger;
```

---

### ÉTAPE 4 : Middleware Auth Renforcé

```javascript
// src/middleware/auth.js - VERSION SÉCURISÉE
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

// Token blacklist (Redis recommandé en production)
const tokenBlacklist = new Set();

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      logger.warn(`Auth failed: No token from ${req.ip}`);
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Check blacklist
    if (tokenBlacklist.has(token)) {
      logger.warn(`Auth failed: Blacklisted token from ${req.ip}`);
      return res.status(401).json({
        success: false,
        message: 'Token revoked',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check token expiration
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      logger.warn(`Auth failed: Expired token from ${req.ip}`);
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }

    // Get user
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      logger.warn(`Auth failed: User not found ${decoded.id} from ${req.ip}`);
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.isActive) {
      logger.warn(`Auth failed: Inactive user ${user._id} from ${req.ip}`);
      return res.status(403).json({
        success: false,
        message: 'Account disabled',
      });
    }

    // Check if password changed after token issued
    if (user.passwordChangedAt) {
      const changedTimestamp = Math.floor(user.passwordChangedAt.getTime() / 1000);
      if (decoded.iat < changedTimestamp) {
        logger.warn(`Auth failed: Password changed after token issued for ${user._id}`);
        return res.status(401).json({
          success: false,
          message: 'Password changed, please login again',
        });
      }
    }

    req.user = user;
    req.userId = user._id;
    req.token = token;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.warn(`Auth failed: Token expired from ${req.ip}`);
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      logger.warn(`Auth failed: Invalid token from ${req.ip}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    logger.error('Auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};

// Logout (blacklist token)
const logout = (req, res) => {
  const token = req.token;
  if (token) {
    tokenBlacklist.add(token);
    
    // Auto-remove from blacklist after expiration
    const decoded = jwt.decode(token);
    const expiresIn = (decoded.exp * 1000) - Date.now();
    setTimeout(() => {
      tokenBlacklist.delete(token);
    }, expiresIn);
  }
  
  res.json({ success: true, message: 'Logged out' });
};

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (req.user.role !== 'admin') {
    logger.warn(`Authorization failed: User ${req.user._id} tried to access admin route`);
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }

  next();
};

const requireStaff = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (!['admin', 'staff'].includes(req.user.role)) {
    logger.warn(`Authorization failed: User ${req.user._id} tried to access staff route`);
    return res.status(403).json({
      success: false,
      message: 'Staff access required',
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  logout,
  requireAdmin,
  requireStaff,
};
```

Suite dans le prochain fichier avec les routes sécurisées et frontend ! 🔒
