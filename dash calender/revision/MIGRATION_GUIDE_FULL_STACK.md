# 🚀 Guide de Migration Full Stack - FootballHub+

## 📋 Plan d'Activation Complète

Ce guide vous accompagne pour **activer le Full Stack** de FootballHub+ en connectant tous les composants.

---

## 🎯 État Actuel vs État Cible

### ✅ Ce qui Existe Déjà
- Frontend React complet avec toutes les pages
- Services frontend avec mode Mock/Simulation
- Backend Node.js/Express configuré
- Structure des routes backend
- Design system premium unifié

### 🎯 Ce qu'on Va Activer
- ✅ Connexion Backend ↔ MongoDB
- ✅ Migration Mock Data → API réelle
- ✅ Validation de tickets fonctionnelle
- ✅ Shop e-commerce actif
- ✅ Gestion membres en temps réel
- ✅ Dashboard analytics live

---

## 📦 Phase 1 : Setup Backend Complet

### 1.1 Installation des Dépendances

```bash
cd server
npm install express mongoose cors dotenv morgan
npm install -D nodemon
```

### 1.2 Créer les Modèles Mongoose

Créez les fichiers suivants dans `server/src/models/` :

#### `server/src/models/Member.js`

```javascript
const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: String,
  avatar: String,
  
  // Membership
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
  
  // Stats
  joinDate: {
    type: Date,
    default: Date.now,
  },
  totalSpent: {
    type: Number,
    default: 0,
  },
  
  // Relations
  tickets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
  }],
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});

// Virtual pour nom complet
memberSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Auto-génération du numéro de membre
memberSchema.pre('save', async function(next) {
  if (!this.membershipNumber) {
    const count = await this.constructor.countDocuments();
    this.membershipNumber = `MEM${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Member', memberSchema);
```

#### `server/src/models/Event.js`

```javascript
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: String,
  category: {
    type: String,
    enum: ['Match', 'Training', 'Tournament', 'Meeting', 'Social'],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: Date,
  venue: {
    type: String,
    required: true,
  },
  address: {
    city: String,
    country: String,
  },
  coverImage: String,
  images: [String],
  
  // Capacité
  capacity: {
    type: Number,
    default: 0,
  },
  ticketPrice: {
    type: Number,
    default: 0,
  },
  
  // Status
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Draft',
  },
  
  // Participants
  attendees: [{
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Event', eventSchema);
```

#### `server/src/models/Ticket.js`

```javascript
const mongoose = require('mongoose');
const crypto = require('crypto');

const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true,
    required: true,
  },
  qrCode: {
    type: String,
    unique: true,
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true,
  },
  ticketType: {
    type: String,
    enum: ['VIP', 'Standard', 'Early Bird', 'Free'],
    default: 'Standard',
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  seating: {
    section: String,
    row: String,
    seat: String,
  },
  status: {
    type: String,
    enum: ['Valid', 'Used', 'Cancelled', 'Expired'],
    default: 'Valid',
  },
  isValidated: {
    type: Boolean,
    default: false,
  },
  validatedAt: Date,
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
  },
}, {
  timestamps: true,
});

// Auto-génération
ticketSchema.pre('save', async function(next) {
  if (!this.ticketNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    this.ticketNumber = `TKT-${timestamp}-${random}`;
  }
  
  if (!this.qrCode) {
    const qrData = {
      ticket: this.ticketNumber,
      event: this.event,
      member: this.member,
      timestamp: Date.now(),
    };
    this.qrCode = Buffer.from(JSON.stringify(qrData)).toString('base64');
  }
  
  next();
});

module.exports = mongoose.model('Ticket', ticketSchema);
```

#### `server/src/models/Product.js`

```javascript
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: String,
  category: {
    type: String,
    enum: ['Jersey', 'Training', 'Accessories', 'Memorabilia', 'Equipment'],
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  comparePrice: Number,
  images: [String],
  mainImage: String,
  sku: {
    type: String,
    unique: true,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  salesCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);
```

#### `server/src/models/Order.js`

```javascript
const mongoose = require('mongoose');
const crypto = require('crypto');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true,
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true,
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
  },
  tax: {
    type: Number,
    default: 0,
  },
  shipping: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending',
  },
  shippingAddress: {
    street: String,
    city: String,
    zipCode: String,
    country: String,
  },
}, {
  timestamps: true,
});

orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
```

### 1.3 Créer les Routes

Les routes sont déjà créées dans les documents précédents. Copiez-les dans :
- `server/src/routes/members.js`
- `server/src/routes/events.js`
- `server/src/routes/tickets.js`
- `server/src/routes/products.js`
- `server/src/routes/orders.js`

### 1.4 Mettre à Jour server/src/index.js

```javascript
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/footballhub', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Import Routes
const memberRoutes = require('./routes/members');
const eventRoutes = require('./routes/events');
const ticketRoutes = require('./routes/tickets');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

// Register Routes
app.use('/api/members', memberRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'FootballHub+ API is running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
  });
});

// Root
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to FootballHub+ API',
    version: '1.0.0',
  });
});

// Error Handling
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});

module.exports = app;
```

### 1.5 Créer le Fichier .env

```bash
# server/.env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/footballhub
CORS_ORIGIN=http://localhost:3000
```

### 1.6 Seed Script

```javascript
// server/src/seeds/index.js

require('dotenv').config();
const mongoose = require('mongoose');
const Member = require('../models/Member');
const Event = require('../models/Event');
const Product = require('../models/Product');

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to MongoDB');

    // Clear
    await Member.deleteMany({});
    await Event.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Members
    const members = await Member.create([
      {
        firstName: 'Karim',
        lastName: 'Benzema',
        email: 'karim@footballhub.com',
        phone: '+212600000001',
        role: 'Player',
        tier: 'VIP',
        status: 'Active',
      },
      {
        firstName: 'Achraf',
        lastName: 'Hakimi',
        email: 'achraf@footballhub.com',
        phone: '+212600000002',
        role: 'Player',
        tier: 'Elite',
        status: 'Active',
      },
      {
        firstName: 'Ahmed',
        lastName: 'Mansouri',
        email: 'ahmed@footballhub.com',
        phone: '+212600000003',
        role: 'Fan',
        tier: 'Standard',
        status: 'Active',
      },
    ]);
    console.log(`✅ Created ${members.length} members`);

    // Events
    const events = await Event.create([
      {
        title: 'Raja vs Wydad - Derby de Casablanca',
        description: 'Le match le plus attendu de la saison',
        category: 'Match',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        venue: 'Stade Mohammed V',
        address: { city: 'Casablanca', country: 'Morocco' },
        capacity: 50000,
        ticketPrice: 450,
        status: 'Published',
        coverImage: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800',
      },
      {
        title: 'Entraînement Ouvert au Public',
        description: 'Venez voir vos joueurs préférés à l\'entraînement',
        category: 'Training',
        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        venue: 'Centre d\'Entraînement',
        address: { city: 'Rabat', country: 'Morocco' },
        capacity: 500,
        ticketPrice: 0,
        status: 'Published',
        coverImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
      },
    ]);
    console.log(`✅ Created ${events.length} events`);

    // Products
    const products = await Product.create([
      {
        name: 'Maillot Domicile 2024',
        description: 'Maillot officiel de l\'équipe - Saison 2024',
        category: 'Jersey',
        price: 850,
        comparePrice: 1000,
        stock: 50,
        isFeatured: true,
        rating: 4.8,
        images: ['https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=500'],
        mainImage: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=500',
      },
      {
        name: 'Survêtement d\'Entraînement',
        description: 'Équipement pro pour l\'entraînement',
        category: 'Training',
        price: 550,
        stock: 30,
        rating: 4.5,
        images: ['https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500'],
        mainImage: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500',
      },
      {
        name: 'Écharpe Officielle',
        description: 'Supportez votre équipe avec style',
        category: 'Accessories',
        price: 200,
        stock: 100,
        rating: 4.3,
        images: ['https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=500'],
        mainImage: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=500',
      },
      {
        name: 'Ballon Dédicacé',
        description: 'Ballon signé par toute l\'équipe',
        category: 'Memorabilia',
        price: 1500,
        comparePrice: 2000,
        stock: 5,
        isFeatured: true,
        rating: 5.0,
        images: ['https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=500'],
        mainImage: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=500',
      },
    ]);
    console.log(`✅ Created ${products.length} products`);

    console.log('🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seedDatabase();
```

---

## 📦 Phase 2 : Migration Frontend

### 2.1 Mettre à Jour src/services/api.js

```javascript
// src/services/api.js

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Intercepteur pour les requêtes
api.interceptors.request.use(
  (config) => {
    // Ajouter le token si disponible
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Rediriger vers login si non authentifié
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 2.2 Mettre à Jour src/services/members.js

```javascript
// src/services/members.js

import api from './api';

export const memberService = {
  // GET all members
  async getAll(filters = {}) {
    try {
      const response = await api.get('/members', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching members:', error);
      throw error;
    }
  },

  // GET member by ID
  async getById(id) {
    try {
      const response = await api.get(`/members/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching member:', error);
      throw error;
    }
  },

  // CREATE new member
  async create(memberData) {
    try {
      const response = await api.post('/members', memberData);
      return response.data;
    } catch (error) {
      console.error('Error creating member:', error);
      throw error;
    }
  },

  // UPDATE member
  async update(id, memberData) {
    try {
      const response = await api.patch(`/members/${id}`, memberData);
      return response.data;
    } catch (error) {
      console.error('Error updating member:', error);
      throw error;
    }
  },

  // DELETE member
  async delete(id) {
    try {
      const response = await api.delete(`/members/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting member:', error);
      throw error;
    }
  },

  // GET stats
  async getStats() {
    try {
      const response = await api.get('/members/api/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },
};
```

### 2.3 Mettre à Jour les Autres Services

Suivez le même pattern pour :
- `src/services/events.js`
- `src/services/tickets.js`
- `src/services/shop.js`

---

## 🚀 Phase 3 : Lancement

### 3.1 Démarrer MongoDB

```bash
# Sur macOS/Linux
brew services start mongodb-community

# Sur Windows
net start MongoDB

# Vérifier que MongoDB tourne
mongosh
# > show dbs
```

### 3.2 Démarrer le Backend

```bash
cd server

# Seed la base de données
npm run seed

# Démarrer le serveur
npm run dev
```

### 3.3 Démarrer le Frontend

```bash
# Dans un autre terminal
cd ..
npm run dev
```

### 3.4 Tester

```bash
# Test API
curl http://localhost:5000/api/health

# Test Members
curl http://localhost:5000/api/members

# Test Events
curl http://localhost:5000/api/events

# Test Products
curl http://localhost:5000/api/products
```

---

## ✅ Checklist de Migration

- [ ] MongoDB installé et démarré
- [ ] Modèles créés dans `server/src/models/`
- [ ] Routes créées dans `server/src/routes/`
- [ ] `server/src/index.js` mis à jour
- [ ] Fichier `.env` créé
- [ ] Dépendances backend installées
- [ ] Base de données seedée
- [ ] Backend démarré (port 5000)
- [ ] Services frontend mis à jour
- [ ] Frontend démarré (port 3000)
- [ ] Tests API réussis
- [ ] Navigation dans l'app fonctionnelle

---

**Votre FootballHub+ est maintenant Full Stack ! 🎉**
