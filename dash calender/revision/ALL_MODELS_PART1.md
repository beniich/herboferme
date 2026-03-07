# 🗄️ FootballHub+ - TOUS LES MODÈLES BACKEND

## Modèles 3-18 : Création Complète

### 3. Event Model

```javascript
// src/models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  
  category: {
    type: String,
    enum: ['Match', 'Training', 'Tournament', 'Meeting', 'Other'],
    default: 'Match',
  },
  
  startDate: {
    type: Date,
    required: true,
  },
  endDate: Date,
  
  venue: {
    name: String,
    address: String,
    city: String,
    capacity: Number,
  },
  
  capacity: Number,
  ticketPrice: Number,
  
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Draft',
  },
  
  coverImage: String,
  images: [String],
  
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  
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
      enum: ['Confirmed', 'Pending', 'Cancelled'],
      default: 'Confirmed',
    },
  }],
  
  isFeatured: {
    type: Boolean,
    default: false,
  },
  
  tags: [String],
  
}, {
  timestamps: true,
});

eventSchema.index({ startDate: 1, status: 1 });
eventSchema.index({ category: 1 });

module.exports = mongoose.model('Event', eventSchema);
```

### 4. Ticket Model

```javascript
// src/models/Ticket.js
const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true,
    required: true,
  },
  
  qrCode: {
    type: String,
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
    enum: ['VIP', 'Standard', 'EarlyBird', 'Free'],
    default: 'Standard',
  },
  
  price: {
    type: Number,
    required: true,
  },
  
  seating: {
    section: String,
    row: String,
    seat: String,
  },
  
  purchaseDate: {
    type: Date,
    default: Date.now,
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
    ref: 'User',
  },
  
  paymentMethod: String,
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Refunded'],
    default: 'Paid',
  },
  
}, {
  timestamps: true,
});

// Auto-generate ticket number and QR code
ticketSchema.pre('save', function(next) {
  if (!this.ticketNumber) {
    this.ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
  }
  
  if (!this.qrCode) {
    const qrData = {
      ticketNumber: this.ticketNumber,
      event: this.event,
      member: this.member,
      timestamp: Date.now(),
    };
    this.qrCode = Buffer.from(JSON.stringify(qrData)).toString('base64');
  }
  
  next();
});

ticketSchema.index({ event: 1, member: 1 });
ticketSchema.index({ status: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
```

### 5. Product Model

```javascript
// src/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
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
  },
  comparePrice: Number,
  
  stock: {
    type: Number,
    default: 0,
  },
  
  sku: {
    type: String,
    unique: true,
  },
  
  images: [String],
  
  sizes: [{
    size: String,
    stock: Number,
  }],
  
  colors: [String],
  
  isFeatured: {
    type: Boolean,
    default: false,
  },
  
  isActive: {
    type: Boolean,
    default: true,
  },
  
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  
  reviewCount: {
    type: Number,
    default: 0,
  },
  
  salesCount: {
    type: Number,
    default: 0,
  },
  
  tags: [String],
  
}, {
  timestamps: true,
});

// Auto-generate SKU
productSchema.pre('save', async function(next) {
  if (!this.sku) {
    const count = await mongoose.model('Product').countDocuments();
    this.sku = `PRD${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
```

### 6. Order Model

```javascript
// src/models/Order.js
const mongoose = require('mongoose');

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
  
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    name: String,
    price: Number,
    quantity: Number,
    size: String,
    color: String,
  }],
  
  subtotal: {
    type: Number,
    required: true,
  },
  tax: Number,
  shipping: Number,
  discount: Number,
  total: {
    type: Number,
    required: true,
  },
  
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  
  paymentMethod: String,
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending',
  },
  
  shippingAddress: {
    fullName: String,
    phone: String,
    address: String,
    city: String,
    postalCode: String,
    country: String,
  },
  
  trackingNumber: String,
  
  notes: String,
  
}, {
  timestamps: true,
});

// Auto-generate order number
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    this.orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
  }
  next();
});

orderSchema.index({ member: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
```

### 7. League Model

```javascript
// src/models/League.js
const mongoose = require('mongoose');

const leagueSchema = new mongoose.Schema({
  apiFootballId: {
    type: Number,
    unique: true,
    sparse: true,
  },
  
  name: {
    type: String,
    required: true,
  },
  
  type: {
    type: String,
    enum: ['League', 'Cup'],
    default: 'League',
  },
  
  country: {
    name: String,
    code: String,
    flag: String,
  },
  
  logo: String,
  
  currentSeason: {
    year: Number,
    start: Date,
    end: Date,
    current: Boolean,
  },
  
  isActive: {
    type: Boolean,
    default: true,
  },
  
  isFeatured: {
    type: Boolean,
    default: false,
  },
  
  priority: {
    type: Number,
    default: 0,
  },
  
  followersCount: {
    type: Number,
    default: 0,
  },
  
  lastSyncedAt: Date,
  
}, {
  timestamps: true,
});

leagueSchema.index({ country: 1, priority: -1 });
leagueSchema.index({ isFeatured: 1 });

module.exports = mongoose.model('League', leagueSchema);
```

### 8. Team Model

```javascript
// src/models/Team.js
const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  apiFootballId: {
    type: Number,
    unique: true,
    sparse: true,
  },
  
  name: {
    type: String,
    required: true,
  },
  
  code: String,
  country: String,
  founded: Number,
  logo: String,
  
  venue: {
    name: String,
    address: String,
    city: String,
    capacity: Number,
    surface: String,
    image: String,
  },
  
  leagues: [{
    league: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'League',
    },
    season: Number,
  }],
  
  followersCount: {
    type: Number,
    default: 0,
  },
  
  lastSyncedAt: Date,
  
}, {
  timestamps: true,
});

teamSchema.index({ name: 'text' });
teamSchema.index({ country: 1 });

module.exports = mongoose.model('Team', teamSchema);
```

### 9. Match Model

```javascript
// src/models/Match.js
const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  apiFootballId: {
    type: Number,
    unique: true,
    sparse: true,
  },
  
  league: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'League',
    required: true,
  },
  
  season: Number,
  round: String,
  
  homeTeam: {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    name: String,
    logo: String,
  },
  
  awayTeam: {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    name: String,
    logo: String,
  },
  
  matchDate: {
    type: Date,
    required: true,
  },
  
  timezone: String,
  
  venue: {
    name: String,
    city: String,
  },
  
  status: {
    type: String,
    enum: ['SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED', 'CANCELLED'],
    default: 'SCHEDULED',
  },
  
  elapsed: Number,
  
  score: {
    halftime: {
      home: Number,
      away: Number,
    },
    fulltime: {
      home: Number,
      away: Number,
    },
    extratime: {
      home: Number,
      away: Number,
    },
    penalty: {
      home: Number,
      away: Number,
    },
  },
  
  goals: [{
    team: String,
    player: String,
    minute: Number,
    type: {
      type: String,
      enum: ['Normal Goal', 'Own Goal', 'Penalty'],
    },
  }],
  
  statistics: {
    homeTeam: {
      shotsOnGoal: Number,
      shotsOffGoal: Number,
      possession: Number,
      corners: Number,
      yellowCards: Number,
      redCards: Number,
      fouls: Number,
      offsides: Number,
    },
    awayTeam: {
      shotsOnGoal: Number,
      shotsOffGoal: Number,
      possession: Number,
      corners: Number,
      yellowCards: Number,
      redCards: Number,
      fouls: Number,
      offsides: Number,
    },
  },
  
  lastSyncedAt: Date,
  
}, {
  timestamps: true,
});

matchSchema.index({ league: 1, matchDate: -1 });
matchSchema.index({ status: 1, matchDate: 1 });

module.exports = mongoose.model('Match', matchSchema);
```

### 10. Player Model

```javascript
// src/models/Player.js
const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  apiFootballId: Number,
  
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  commonName: String,
  photo: String,
  
  dateOfBirth: Date,
  
  nationality: {
    name: String,
    code: String,
    flag: String,
  },
  
  height: Number,
  weight: Number,
  
  position: {
    type: String,
    enum: ['GK', 'RB', 'CB', 'LB', 'RWB', 'LWB', 'CDM', 'CM', 'CAM', 'RM', 'LM', 'RW', 'LW', 'CF', 'ST'],
  },
  
  jerseyNumber: Number,
  preferredFoot: {
    type: String,
    enum: ['Left', 'Right', 'Both'],
  },
  
  currentTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  },
  
  stats: {
    appearances: { type: Number, default: 0 },
    goals: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    yellowCards: { type: Number, default: 0 },
    redCards: { type: Number, default: 0 },
    minutesPlayed: { type: Number, default: 0 },
  },
  
  rating: {
    overall: { type: Number, min: 0, max: 100 },
    pace: { type: Number, min: 0, max: 100 },
    shooting: { type: Number, min: 0, max: 100 },
    passing: { type: Number, min: 0, max: 100 },
    dribbling: { type: Number, min: 0, max: 100 },
    defending: { type: Number, min: 0, max: 100 },
    physical: { type: Number, min: 0, max: 100 },
  },
  
  lastSyncedAt: Date,
  
}, {
  timestamps: true,
});

playerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

playerSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
});

module.exports = mongoose.model('Player', playerSchema);
```

Suite dans le prochain fichier avec les 8 modèles restants ! 🚀
