# 🎫 FootballHub+ Backend - Tickets, Shop & Integration

## 📋 Suite des Routes API

### 3. Tickets Routes

```javascript
// server/src/routes/tickets.js

const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const Member = require('../models/Member');

// GET /api/tickets - Get all tickets
router.get('/', async (req, res) => {
  try {
    const { 
      memberId, 
      eventId, 
      status, 
      type,
      page = 1, 
      limit = 10 
    } = req.query;

    const query = {};
    
    if (memberId) query.member = memberId;
    if (eventId) query.event = eventId;
    if (status) query.status = status;
    if (type) query.ticketType = type;

    const tickets = await Ticket.find(query)
      .populate('event', 'title startDate venue coverImage')
      .populate('member', 'firstName lastName email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Ticket.countDocuments(query);

    res.json({
      tickets,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/tickets/:id - Get ticket by ID
router.get('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('event')
      .populate('member', 'firstName lastName email phone avatar')
      .populate('validatedBy', 'firstName lastName');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/tickets/qr/:qrCode - Get ticket by QR code
router.get('/qr/:qrCode', async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ qrCode: req.params.qrCode })
      .populate('event')
      .populate('member', 'firstName lastName email phone avatar');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/tickets - Create new ticket
router.post('/', async (req, res) => {
  try {
    const { eventId, memberId, ticketType, price, seating } = req.body;

    // Vérifier que l'événement existe
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Vérifier que le membre existe
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Vérifier la capacité
    const ticketCount = await Ticket.countDocuments({ 
      event: eventId, 
      status: { $in: ['Valid', 'Used'] } 
    });

    if (event.maxCapacity > 0 && ticketCount >= event.maxCapacity) {
      return res.status(400).json({ message: 'Event is full' });
    }

    const ticket = new Ticket({
      event: eventId,
      member: memberId,
      ticketType,
      price: price || event.ticketPrice || 0,
      currency: event.currency,
      seating,
    });

    const newTicket = await ticket.save();

    // Mettre à jour les références
    await Member.findByIdAndUpdate(memberId, {
      $push: { tickets: newTicket._id },
    });

    res.status(201).json(newTicket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/tickets/:id/validate - Validate ticket
router.post('/:id/validate', async (req, res) => {
  try {
    const { validatorId } = req.body;

    const ticket = await Ticket.findById(req.params.id)
      .populate('event')
      .populate('member', 'firstName lastName email avatar');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Vérifier le statut
    if (ticket.status !== 'Valid') {
      return res.status(400).json({ 
        message: 'Ticket is not valid',
        status: ticket.status 
      });
    }

    if (ticket.isValidated) {
      return res.status(400).json({ 
        message: 'Ticket already used',
        validatedAt: ticket.validatedAt 
      });
    }

    // Vérifier la date de l'événement
    const now = new Date();
    const eventStart = new Date(ticket.event.startDate);
    const eventEnd = ticket.event.endDate 
      ? new Date(ticket.event.endDate) 
      : new Date(eventStart.getTime() + 6 * 60 * 60 * 1000); // +6h

    if (now < eventStart || now > eventEnd) {
      return res.status(400).json({ 
        message: 'Ticket not valid for current time',
        eventStart,
        eventEnd 
      });
    }

    // Valider le ticket
    ticket.isValidated = true;
    ticket.validatedAt = now;
    ticket.validatedBy = validatorId;
    ticket.status = 'Used';

    await ticket.save();

    res.json({
      success: true,
      message: 'Ticket validated successfully',
      ticket,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/tickets/validate-qr - Validate ticket by QR code
router.post('/validate-qr', async (req, res) => {
  try {
    const { qrCode, validatorId } = req.body;

    const ticket = await Ticket.findOne({ qrCode })
      .populate('event')
      .populate('member', 'firstName lastName email avatar');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Utiliser la même logique de validation
    if (ticket.status !== 'Valid') {
      return res.status(400).json({ 
        message: 'Ticket is not valid',
        status: ticket.status 
      });
    }

    if (ticket.isValidated) {
      return res.status(400).json({ 
        message: 'Ticket already used',
        validatedAt: ticket.validatedAt 
      });
    }

    const now = new Date();
    const eventStart = new Date(ticket.event.startDate);
    const eventEnd = ticket.event.endDate 
      ? new Date(ticket.event.endDate) 
      : new Date(eventStart.getTime() + 6 * 60 * 60 * 1000);

    if (now < eventStart || now > eventEnd) {
      return res.status(400).json({ 
        message: 'Ticket not valid for current time' 
      });
    }

    ticket.isValidated = true;
    ticket.validatedAt = now;
    ticket.validatedBy = validatorId;
    ticket.status = 'Used';

    await ticket.save();

    res.json({
      success: true,
      message: 'Ticket validated successfully',
      ticket,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH /api/tickets/:id - Update ticket
router.patch('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/tickets/:id - Cancel ticket
router.delete('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status: 'Cancelled' },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json({ message: 'Ticket cancelled successfully', ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

### 4. Products Routes

```javascript
// server/src/routes/products.js

const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products - Get all products
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      search, 
      featured,
      minPrice,
      maxPrice,
      inStock,
      page = 1, 
      limit = 12 
    } = req.query;

    const query = { isActive: true };
    
    if (category) query.category = category;
    if (featured) query.isFeatured = featured === 'true';
    if (inStock) query.stock = { $gt: 0 };
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ isFeatured: -1, createdAt: -1 });

    const count = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/products/:id - Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Incrémenter le compteur de vues
    product.viewCount += 1;
    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/products - Create new product
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH /api/products/:id - Update product
router.patch('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/products/:id - Delete product (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/products/:id/stock - Update stock
router.patch('/:id/stock', async (req, res) => {
  try {
    const { quantity, operation = 'set' } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (operation === 'set') {
      product.stock = quantity;
    } else if (operation === 'add') {
      product.stock += quantity;
    } else if (operation === 'subtract') {
      product.stock = Math.max(0, product.stock - quantity);
    }

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
```

### 5. Orders Routes

```javascript
// server/src/routes/orders.js

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Member = require('../models/Member');

// GET /api/orders - Get all orders
router.get('/', async (req, res) => {
  try {
    const { 
      memberId, 
      status, 
      paymentStatus,
      page = 1, 
      limit = 10 
    } = req.query;

    const query = {};
    
    if (memberId) query.member = memberId;
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const orders = await Order.find(query)
      .populate('member', 'firstName lastName email phone')
      .populate('items.product', 'name mainImage')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/:id - Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('member')
      .populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/orders - Create new order
router.post('/', async (req, res) => {
  try {
    const { memberId, items, shippingAddress, shippingMethod } = req.body;

    // Vérifier le membre
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Calculer les totaux et vérifier le stock
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({ 
          message: `Product ${item.productId} not found` 
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}` 
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        productSnapshot: {
          name: product.name,
          price: product.price,
          image: product.mainImage || product.images[0],
        },
        quantity: item.quantity,
        price: product.price,
        variant: item.variant,
      });

      // Décrémenter le stock
      product.stock -= item.quantity;
      product.salesCount += item.quantity;
      await product.save();
    }

    // Calculer les frais
    const tax = subtotal * 0.1; // 10% TVA
    const shipping = shippingMethod === 'Express' ? 50 : 
                    shippingMethod === 'Standard' ? 25 : 0;
    const total = subtotal + tax + shipping;

    // Créer la commande
    const order = new Order({
      member: memberId,
      items: orderItems,
      subtotal,
      tax,
      shipping,
      total,
      shippingAddress,
      shippingMethod,
    });

    const newOrder = await order.save();

    // Mettre à jour les références du membre
    await Member.findByIdAndUpdate(memberId, {
      $push: { orders: newOrder._id },
    });

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH /api/orders/:id/status - Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH /api/orders/:id/payment - Update payment status
router.patch('/:id/payment', async (req, res) => {
  try {
    const { paymentStatus, paymentMethod } = req.body;

    const updateData = { paymentStatus };
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (paymentStatus === 'Completed') updateData.paidAt = new Date();

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/orders/:id - Cancel order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'Pending' && order.status !== 'Confirmed') {
      return res.status(400).json({ 
        message: 'Cannot cancel order in current status' 
      });
    }

    // Restaurer le stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { 
          stock: item.quantity,
          salesCount: -item.quantity 
        },
      });
    }

    order.status = 'Cancelled';
    await order.save();

    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

---

## 🔧 Configuration Serveur

### Mise à jour de server/src/index.js

```javascript
// server/src/index.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/footballhub', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// ============================================================================
// ROUTES
// ============================================================================

// Import routes
const memberRoutes = require('./routes/members');
const eventRoutes = require('./routes/events');
const ticketRoutes = require('./routes/tickets');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

// Register routes
app.use('/api/members', memberRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'FootballHub+ API is running',
    timestamp: new Date().toISOString() 
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to FootballHub+ API',
    version: '1.0.0',
    endpoints: {
      members: '/api/members',
      events: '/api/events',
      tickets: '/api/tickets',
      products: '/api/products',
      orders: '/api/orders',
    }
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.path 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ============================================================================
// START SERVER
// ============================================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});

module.exports = app;
```

### Fichier .env

```env
# server/.env

# Application
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/footballhub

# JWT (pour plus tard)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Upload (pour plus tard)
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

---

## 🚀 Scripts de Démarrage

### package.json (server)

```json
{
  "name": "footballhub-server",
  "version": "1.0.0",
  "description": "FootballHub+ Backend API",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "seed": "node src/seeds/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

---

## 🌱 Script de Seed

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
    console.log('Connected to MongoDB');

    // Clear existing data
    await Member.deleteMany({});
    await Event.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Seed Members
    const members = await Member.create([
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+212600000001',
        membershipType: 'Premium',
        membershipStatus: 'Active',
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '+212600000002',
        membershipType: 'VIP',
        membershipStatus: 'Active',
      },
    ]);
    console.log(`✅ Created ${members.length} members`);

    // Seed Events
    const events = await Event.create([
      {
        title: 'FC Lions vs. Tigers',
        description: 'Premier League Match',
        category: 'Match',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
        venue: 'Main Stadium',
        address: {
          city: 'Casablanca',
          country: 'Morocco',
        },
        ticketPrice: 450,
        maxCapacity: 5000,
        status: 'Published',
        organizer: members[0]._id,
      },
      {
        title: 'U-18 Tournament Finals',
        description: 'Youth Championship',
        category: 'Tournament',
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // +14 days
        venue: 'Training Ground A',
        address: {
          city: 'Rabat',
          country: 'Morocco',
        },
        ticketPrice: 0,
        maxCapacity: 1000,
        status: 'Published',
        organizer: members[1]._id,
      },
    ]);
    console.log(`✅ Created ${events.length} events`);

    // Seed Products
    const products = await Product.create([
      {
        name: '23/24 Home Jersey',
        description: 'Official home jersey for the season',
        category: 'Jersey',
        price: 850,
        stock: 50,
        isFeatured: true,
      },
      {
        name: 'Pro Training Top',
        description: 'Professional training gear',
        category: 'Training',
        price: 550,
        stock: 30,
      },
      {
        name: 'Club Scarf',
        description: 'Official supporter scarf',
        category: 'Accessories',
        price: 200,
        stock: 100,
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

## ✅ Instructions de Démarrage

### 1. Installation

```bash
cd server
npm install
```

### 2. Configuration

```bash
# Créer le fichier .env
cp .env.example .env

# Éditer .env avec vos valeurs
```

### 3. Seed la base de données

```bash
npm run seed
```

### 4. Démarrer le serveur

```bash
# Développement (avec hot reload)
npm run dev

# Production
npm start
```

### 5. Tester l'API

```bash
# Health check
curl http://localhost:5000/api/health

# Get members
curl http://localhost:5000/api/members

# Get events
curl http://localhost:5000/api/events

# Get products
curl http://localhost:5000/api/products
```

---

**Voilà ! Le backend est complet et prêt à être connecté au frontend ! 🚀**
