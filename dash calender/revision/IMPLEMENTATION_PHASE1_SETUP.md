# 🚀 FootballHub+ - Implémentation Complète - PHASE 1 : SETUP

## 📋 Prérequis (Installation Immédiate)

### 1. Installer Node.js (si pas déjà installé)

```bash
# Vérifier si installé
node --version
npm --version

# Si pas installé :
# macOS
brew install node

# Windows
# Télécharger depuis https://nodejs.org/

# Linux (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Installer MongoDB

**Option A : Docker (Recommandé - Plus Simple)**
```bash
# Installer Docker Desktop depuis https://www.docker.com/products/docker-desktop

# Démarrer MongoDB
docker run -d \
  --name footballhub-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=footballhub2024 \
  -v mongodb_data:/data/db \
  mongo:7

# Vérifier que ça tourne
docker ps
```

**Option B : Installation Locale**
```bash
# macOS
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0

# Ubuntu/Debian
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod

# Windows
# Télécharger depuis https://www.mongodb.com/try/download/community
```

### 3. Installer Git

```bash
# Vérifier
git --version

# Si pas installé
# macOS
brew install git

# Ubuntu/Debian
sudo apt-get install git

# Windows
# Télécharger depuis https://git-scm.com/
```

---

## 🏗️ ÉTAPE 1 : Création du Projet Backend (30 min)

### 1.1 Créer la Structure

```bash
# Créer le dossier principal
mkdir footballhub
cd footballhub

# Créer le backend
mkdir server
cd server

# Initialiser npm
npm init -y

# Nom du projet : footballhub-backend
# Version : 1.0.0
# Description : Backend API for FootballHub+ SaaS Platform
```

### 1.2 Installer TOUTES les Dépendances

```bash
# Core dependencies
npm install express mongoose cors dotenv morgan

# Authentication
npm install bcryptjs jsonwebtoken

# Utilities
npm install axios cheerio

# WebSocket & Jobs
npm install ws node-cron

# Firebase (Notifications)
npm install firebase-admin

# Redis (optional - pour cache)
npm install redis

# Development
npm install --save-dev nodemon

# Validation
npm install joi

# File upload
npm install multer

# Date utilities
npm install date-fns
```

### 1.3 Créer la Structure de Fichiers

```bash
# Créer tous les dossiers
mkdir -p src/{models,routes,services,middleware,config,jobs,seeds,utils}
mkdir -p uploads logs
mkdir -p config

# Créer fichiers de base
touch src/index.js
touch .env.example
touch .env
touch .gitignore
touch ecosystem.config.js
touch README.md
```

### 1.4 Configuration package.json

```json
{
  "name": "footballhub-backend",
  "version": "1.0.0",
  "description": "Backend API for FootballHub+ SaaS Platform",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "seed": "node src/seeds/index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["football", "ticketing", "ecommerce", "saas"],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "morgan": "^1.10.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "axios": "^1.6.2",
    "cheerio": "^1.0.0-rc.12",
    "ws": "^8.14.2",
    "node-cron": "^3.0.3",
    "firebase-admin": "^12.0.0",
    "joi": "^17.11.0",
    "multer": "^1.4.5-lts.1",
    "date-fns": "^3.0.6"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

### 1.5 Fichier .env

```bash
# .env
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://admin:footballhub2024@localhost:27017/footballhub?authSource=admin

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_min_32_chars

# API Football (RapidAPI)
RAPIDAPI_KEY=your_rapidapi_key_here

# CORS
CORS_ORIGIN=http://localhost:3000

# Initial Sync
INITIAL_SYNC=false

# Firebase (optional for now)
# FIREBASE_PROJECT_ID=
# FIREBASE_CLIENT_EMAIL=
# FIREBASE_PRIVATE_KEY=

# Redis (optional)
# REDIS_URL=redis://localhost:6379
```

### 1.6 Fichier .gitignore

```bash
# .gitignore
node_modules/
.env
.env.local
.env.production
logs/
uploads/
*.log
.DS_Store
config/firebase-service-account.json
dist/
build/
```

### 1.7 Fichier ecosystem.config.js (PM2)

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'footballhub-api',
      script: './src/index.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      max_memory_restart: '1G',
      autorestart: true,
      watch: false,
    },
  ],
};
```

---

## 📝 ÉTAPE 2 : Créer TOUS les Modèles (1 heure)

Je vais créer tous les fichiers modèles maintenant :

### 2.1 User Model

```javascript
// src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  avatar: String,
  phone: String,
  
  country: String,
  city: String,
  
  role: {
    type: String,
    enum: ['user', 'admin', 'staff'],
    default: 'user',
  },
  
  // Push Notifications
  pushToken: String,
  notificationSettings: {
    matchStart: { type: Boolean, default: true },
    goals: { type: Boolean, default: true },
    matchResult: { type: Boolean, default: true },
    news: { type: Boolean, default: false },
  },
  
  // Favorites
  favoriteLeagues: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'League',
  }],
  favoriteTeams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  }],
  favoritePlayers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
  }],
  
  // Fantasy
  fantasyTeams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FantasyTeam',
  }],
  
  // Social
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  
  isActive: {
    type: Boolean,
    default: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  
  lastLogin: Date,
  
}, {
  timestamps: true,
});

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', userSchema);
```

### 2.2 Member Model (Club Members)

```javascript
// src/models/Member.js
const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: String,
  photo: String,
  
  membershipNumber: {
    type: String,
    unique: true,
  },
  
  role: {
    type: String,
    enum: ['Player', 'Staff', 'Fan', 'Admin'],
    default: 'Fan',
  },
  
  tier: {
    type: String,
    enum: ['VIP', 'Elite', 'Standard'],
    default: 'Standard',
  },
  
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended'],
    default: 'Active',
  },
  
  joinDate: {
    type: Date,
    default: Date.now,
  },
  
  dateOfBirth: Date,
  address: String,
  city: String,
  country: String,
  
  tickets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
  }],
  
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  }],
  
  totalSpent: {
    type: Number,
    default: 0,
  },
  
  loyaltyPoints: {
    type: Number,
    default: 0,
  },
  
}, {
  timestamps: true,
});

// Auto-generate membership number
memberSchema.pre('save', async function(next) {
  if (!this.membershipNumber) {
    const count = await mongoose.model('Member').countDocuments();
    this.membershipNumber = `MEM${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Member', memberSchema);
```

Je continue avec les autres modèles dans le prochain message. Voulez-vous que je continue avec TOUS les modèles restants ?

Liste des modèles à créer :
1. ✅ User
2. ✅ Member
3. Event
4. Ticket
5. Product
6. Order
7. League
8. Team
9. Match
10. Player
11. MatchLineup
12. NewsArticle
13. Standing
14. Prediction
15. Comment
16. Video
17. FantasyTeam
18. Odds

Je continue ? 🚀
