# 🔥 FootballHub+ Backend Full Stack - Modèles & Routes

## 📋 Table des Matières
1. [Modèles Mongoose](#modèles-mongoose)
2. [Routes API](#routes-api)
3. [Controllers](#controllers)
4. [Configuration Server](#configuration-server)
5. [Integration Frontend](#integration-frontend)

---

## 🗄️ Modèles Mongoose

### 1. Member Model

```javascript
// server/src/models/Member.js

const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  // Informations personnelles
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
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  phone: {
    type: String,
    trim: true,
  },
  dateOfBirth: {
    type: Date,
  },
  
  // Adresse
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'Morocco',
    },
  },
  
  // Membership
  membershipNumber: {
    type: String,
    unique: true,
    required: true,
  },
  membershipType: {
    type: String,
    enum: ['Basic', 'Premium', 'VIP'],
    default: 'Basic',
  },
  membershipStatus: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended'],
    default: 'Active',
  },
  joinDate: {
    type: Date,
    default: Date.now,
  },
  expiryDate: {
    type: Date,
  },
  
  // Photo
  avatar: {
    type: String,
    default: null,
  },
  
  // Références
  tickets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
  }],
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  }],
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual pour le nom complet
memberSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Index pour recherche rapide
memberSchema.index({ email: 1, membershipNumber: 1 });
memberSchema.index({ membershipStatus: 1, membershipType: 1 });

// Middleware pour générer le numéro de membre
memberSchema.pre('save', async function(next) {
  if (!this.membershipNumber) {
    const count = await this.constructor.countDocuments();
    this.membershipNumber = `MEM${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Member', memberSchema);
```

### 2. Event Model

```javascript
// server/src/models/Event.js

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  // Informations de base
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    enum: ['Match', 'Tournament', 'Training', 'Meeting', 'Social'],
    required: true,
  },
  
  // Date et lieu
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
  },
  venue: {
    type: String,
    required: [true, 'Venue is required'],
  },
  address: {
    street: String,
    city: {
      type: String,
      required: true,
    },
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'Morocco',
    },
  },
  
  // Médias
  coverImage: {
    type: String,
    default: null,
  },
  images: [{
    type: String,
  }],
  
  // Capacité et billets
  maxCapacity: {
    type: Number,
    default: 0,
  },
  ticketsAvailable: {
    type: Number,
    default: 0,
  },
  ticketPrice: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: 'MAD',
  },
  
  // Status
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Draft',
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  
  // Organisateur
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
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
    status: {
      type: String,
      enum: ['Registered', 'Attended', 'NoShow'],
      default: 'Registered',
    },
  }],
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual pour le nombre de participants
eventSchema.virtual('attendeeCount').get(function() {
  return this.attendees.length;
});

// Virtual pour vérifier si l'événement est complet
eventSchema.virtual('isFull').get(function() {
  return this.maxCapacity > 0 && this.attendees.length >= this.maxCapacity;
});

// Index
eventSchema.index({ startDate: 1, status: 1 });
eventSchema.index({ category: 1, isPublic: 1 });
eventSchema.index({ 'address.city': 1 });

module.exports = mongoose.model('Event', eventSchema);
```

### 3. Ticket Model

```javascript
// server/src/models/Ticket.js

const mongoose = require('mongoose');
const crypto = require('crypto');

const ticketSchema = new mongoose.Schema({
  // Numéro de ticket
  ticketNumber: {
    type: String,
    unique: true,
    required: true,
  },
  
  // Code QR
  qrCode: {
    type: String,
    unique: true,
    required: true,
  },
  
  // Références
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
  
  // Type de ticket
  ticketType: {
    type: String,
    enum: ['VIP', 'Standard', 'Early Bird', 'Free'],
    default: 'Standard',
  },
  
  // Pricing
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  currency: {
    type: String,
    default: 'MAD',
  },
  
  // Seating (optionnel)
  seating: {
    section: String,
    row: String,
    seat: String,
  },
  
  // Status
  status: {
    type: String,
    enum: ['Valid', 'Used', 'Cancelled', 'Expired'],
    default: 'Valid',
  },
  
  // Validation
  isValidated: {
    type: Boolean,
    default: false,
  },
  validatedAt: {
    type: Date,
  },
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
  },
  
  // Paiement
  isPaid: {
    type: Boolean,
    default: false,
  },
  paidAt: {
    type: Date,
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'Mobile', 'Transfer'],
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Génération automatique du numéro de ticket
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

// Index
ticketSchema.index({ ticketNumber: 1 });
ticketSchema.index({ qrCode: 1 });
ticketSchema.index({ event: 1, member: 1 });
ticketSchema.index({ status: 1, isValidated: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
```

### 4. Product Model

```javascript
// server/src/models/Product.js

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // Informations de base
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  
  // Catégorie
  category: {
    type: String,
    enum: ['Jersey', 'Training', 'Accessories', 'Memorabilia', 'Equipment'],
    required: true,
  },
  
  // Prix
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0,
  },
  comparePrice: {
    type: Number,
    min: 0,
  },
  currency: {
    type: String,
    default: 'MAD',
  },
  
  // Images
  images: [{
    type: String,
  }],
  mainImage: {
    type: String,
  },
  
  // Stock
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
  
  // Variantes (tailles, couleurs)
  variants: [{
    name: String,
    value: String,
    sku: String,
    stock: Number,
    priceAdjustment: Number,
  }],
  
  // Status
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  
  // Metadata
  tags: [{
    type: String,
  }],
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      default: 'cm',
    },
  },
  
  // Stats
  salesCount: {
    type: Number,
    default: 0,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual pour calculer le discount
productSchema.virtual('discount').get(function() {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }
  return 0;
});

// Index
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ name: 'text', description: 'text' });

// Génération auto du SKU
productSchema.pre('save', async function(next) {
  if (!this.sku) {
    const count = await this.constructor.countDocuments();
    this.sku = `PRD${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
```

### 5. Order Model

```javascript
// server/src/models/Order.js

const mongoose = require('mongoose');
const crypto = require('crypto');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productSnapshot: {
    name: String,
    price: Number,
    image: String,
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
  variant: {
    name: String,
    value: String,
  },
});

const orderSchema = new mongoose.Schema({
  // Numéro de commande
  orderNumber: {
    type: String,
    unique: true,
    required: true,
  },
  
  // Client
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true,
  },
  
  // Articles
  items: [orderItemSchema],
  
  // Pricing
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
  discount: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'MAD',
  },
  
  // Adresse de livraison
  shippingAddress: {
    firstName: String,
    lastName: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  
  // Livraison
  shippingMethod: {
    type: String,
    enum: ['Standard', 'Express', 'PickUp'],
    default: 'Standard',
  },
  trackingNumber: {
    type: String,
  },
  estimatedDelivery: {
    type: Date,
  },
  
  // Status
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'],
    default: 'Pending',
  },
  
  // Paiement
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending',
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'Mobile', 'Transfer'],
  },
  paidAt: {
    type: Date,
  },
  
  // Notes
  customerNote: {
    type: String,
  },
  internalNote: {
    type: String,
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Génération auto du numéro de commande
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  next();
});

// Index
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ member: 1, status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
```

---

## 🛣️ Routes API

### 1. Members Routes

```javascript
// server/src/routes/members.js

const express = require('express');
const router = express.Router();
const Member = require('../models/Member');

// GET /api/members - Get all members
router.get('/', async (req, res) => {
  try {
    const { 
      status, 
      type, 
      search, 
      page = 1, 
      limit = 10 
    } = req.query;

    const query = {};
    
    if (status) query.membershipStatus = status;
    if (type) query.membershipType = type;
    if (search) {
      query.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { membershipNumber: new RegExp(search, 'i') },
      ];
    }

    const members = await Member.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Member.countDocuments(query);

    res.json({
      members,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/members/:id - Get member by ID
router.get('/:id', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id)
      .populate('tickets')
      .populate('orders');

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/members - Create new member
router.post('/', async (req, res) => {
  try {
    const member = new Member(req.body);
    const newMember = await member.save();
    res.status(201).json(newMember);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH /api/members/:id - Update member
router.patch('/:id', async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json(member);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/members/:id - Delete member
router.delete('/:id', async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/members/stats - Get membership statistics
router.get('/api/stats', async (req, res) => {
  try {
    const stats = await Member.aggregate([
      {
        $group: {
          _id: '$membershipType',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalMembers = await Member.countDocuments();
    const activeMembers = await Member.countDocuments({ membershipStatus: 'Active' });

    res.json({
      totalMembers,
      activeMembers,
      byType: stats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

### 2. Events Routes

```javascript
// server/src/routes/events.js

const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// GET /api/events - Get all events
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      status, 
      search, 
      featured,
      upcoming,
      page = 1, 
      limit = 10 
    } = req.query;

    const query = {};
    
    if (category) query.category = category;
    if (status) query.status = status;
    if (featured) query.isFeatured = featured === 'true';
    if (upcoming) {
      query.startDate = { $gte: new Date() };
      query.status = { $in: ['Published', 'Ongoing'] };
    }
    
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { venue: new RegExp(search, 'i') },
      ];
    }

    const events = await Event.find(query)
      .populate('organizer', 'firstName lastName email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ startDate: 1 });

    const count = await Event.countDocuments(query);

    res.json({
      events,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/events/:id - Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'firstName lastName email avatar')
      .populate('attendees.member', 'firstName lastName email avatar');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/events - Create new event
router.post('/', async (req, res) => {
  try {
    const event = new Event(req.body);
    const newEvent = await event.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH /api/events/:id - Update event
router.patch('/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/events/:id - Delete event
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/events/:id/register - Register for event
router.post('/:id/register', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.isFull) {
      return res.status(400).json({ message: 'Event is full' });
    }

    const { memberId } = req.body;
    
    const alreadyRegistered = event.attendees.find(
      (a) => a.member.toString() === memberId
    );

    if (alreadyRegistered) {
      return res.status(400).json({ message: 'Already registered' });
    }

    event.attendees.push({
      member: memberId,
      registeredAt: new Date(),
      status: 'Registered',
    });

    await event.save();
    res.json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
```

---

## 🎯 SUITE DANS LE PROCHAIN FICHIER

Cette structure pose les fondations solides ! Je vais créer les autres routes (Tickets, Products, Orders) et les contrôleurs dans les prochains fichiers.
