# 🛣️ FootballHub+ - TOUTES LES ROUTES API - PARTIE 2

## Route 5 : Products (E-commerce)

```javascript
// src/routes/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products - Get all products
router.get('/', async (req, res) => {
  try {
    const {
      category,
      featured,
      active,
      search,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
      sort = '-createdAt',
    } = req.query;

    const query = {};
    if (category) query.category = category;
    if (featured) query.isFeatured = featured === 'true';
    if (active !== undefined) query.isActive = active === 'true';
    if (search) {
      query.$text = { $search: search };
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const products = await Product.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

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

// GET /api/products/featured - Get featured products
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true })
      .limit(10)
      .sort('-salesCount');

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/products/categories - Get product categories with counts
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json(categories);
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

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/products - Create new product
router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
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

    res.json({ message: 'Product deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

## Route 6 : Orders (E-commerce)

```javascript
// src/routes/orders.js
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
      limit = 20,
    } = req.query;

    const query = {};
    if (memberId) query.member = memberId;
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('member', 'firstName lastName email')
      .populate('items.product', 'name images');

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

// GET /api/orders/stats - Get order statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
        },
      },
    ]);

    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    res.json({
      stats,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
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
    const { memberId, items, shippingAddress, paymentMethod } = req.body;

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          message: `Product ${item.productId} not found`,
        });
      }

      // Check stock
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`,
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      });

      // Update product stock and sales count
      product.stock -= item.quantity;
      product.salesCount += item.quantity;
      await product.save();
    }

    const tax = subtotal * 0.2; // 20% tax
    const shipping = subtotal > 500 ? 0 : 50; // Free shipping over 500
    const total = subtotal + tax + shipping;

    const order = await Order.create({
      member: memberId,
      items: orderItems,
      subtotal,
      tax,
      shipping,
      total,
      shippingAddress,
      paymentMethod,
      status: 'Pending',
      paymentStatus: 'Pending',
    });

    // Update member
    await Member.findByIdAndUpdate(memberId, {
      $push: { orders: order._id },
      $inc: { totalSpent: total },
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH /api/orders/:id - Update order
router.patch('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
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
      { new: true }
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

    if (order.status !== 'Pending') {
      return res.status(400).json({
        message: 'Cannot cancel order that is not pending',
      });
    }

    order.status = 'Cancelled';
    await order.save();

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, salesCount: -item.quantity },
      });
    }

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

## Route 7 : Leagues (Football Data)

```javascript
// src/routes/leagues.js
const express = require('express');
const router = express.Router();
const League = require('../models/League');

// GET /api/leagues - Get all leagues
router.get('/', async (req, res) => {
  try {
    const {
      country,
      featured,
      type,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const query = { isActive: true };
    if (country) query['country.name'] = country;
    if (featured) query.isFeatured = featured === 'true';
    if (type) query.type = type;
    if (search) {
      query.name = new RegExp(search, 'i');
    }

    const leagues = await League.find(query)
      .sort({ priority: -1, followersCount: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await League.countDocuments(query);

    res.json({
      leagues,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/leagues/featured - Get featured leagues
router.get('/featured', async (req, res) => {
  try {
    const leagues = await League.find({
      isFeatured: true,
      isActive: true,
    })
      .sort({ priority: -1 })
      .limit(10);

    res.json(leagues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/leagues/:id - Get league by ID
router.get('/:id', async (req, res) => {
  try {
    const league = await League.findById(req.params.id);

    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }

    res.json(league);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/leagues - Create new league
router.post('/', async (req, res) => {
  try {
    const league = await League.create(req.body);
    res.status(201).json(league);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/leagues/sync - Sync leagues from API-Football
router.post('/sync', async (req, res) => {
  try {
    const footballApi = require('../services/footballApi');
    await footballApi.syncLeagues();

    res.json({ message: 'Leagues sync started' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/leagues/:id/follow - Follow/Unfollow league
router.post('/:id/follow', async (req, res) => {
  try {
    const league = await League.findByIdAndUpdate(
      req.params.id,
      { $inc: { followersCount: 1 } },
      { new: true }
    );

    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }

    res.json({ message: 'League followed', league });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/leagues/:id - Update league
router.patch('/:id', async (req, res) => {
  try {
    const league = await League.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }

    res.json(league);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/leagues/:id - Delete league
router.delete('/:id', async (req, res) => {
  try {
    const league = await League.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }

    res.json({ message: 'League deactivated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

## Route 8 : Matches (Football Data)

```javascript
// src/routes/matches.js
const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const MatchLineup = require('../models/MatchLineup');

// GET /api/matches - Get all matches
router.get('/', async (req, res) => {
  try {
    const {
      league,
      team,
      status,
      date,
      live,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};
    if (league) query.league = league;
    if (team) {
      query.$or = [{ 'homeTeam.team': team }, { 'awayTeam.team': team }];
    }
    if (status) query.status = status;
    if (live) query.status = 'LIVE';
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.matchDate = { $gte: startDate, $lte: endDate };
    }

    const matches = await Match.find(query)
      .sort({ matchDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('league', 'name logo');

    const count = await Match.countDocuments(query);

    res.json({
      matches,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/matches/live - Get live matches
router.get('/live', async (req, res) => {
  try {
    const matches = await Match.find({ status: 'LIVE' })
      .sort({ elapsed: -1 })
      .populate('league', 'name logo');

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/matches/upcoming - Get upcoming matches
router.get('/upcoming', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const matches = await Match.find({
      status: 'SCHEDULED',
      matchDate: { $gte: new Date() },
    })
      .sort({ matchDate: 1 })
      .limit(parseInt(limit))
      .populate('league', 'name logo');

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/matches/:id - Get match by ID
router.get('/:id', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('league')
      .populate('homeTeam.team')
      .populate('awayTeam.team');

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    res.json(match);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/matches/:id/lineups - Get match lineups
router.get('/:id/lineups', async (req, res) => {
  try {
    const lineups = await MatchLineup.find({ match: req.params.id })
      .populate('team')
      .populate('startingEleven.player')
      .populate('substitutes.player');

    res.json(lineups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/matches - Create new match
router.post('/', async (req, res) => {
  try {
    const match = await Match.create(req.body);
    res.status(201).json(match);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/matches/sync/:leagueId/:season - Sync matches
router.post('/sync/:leagueId/:season', async (req, res) => {
  try {
    const footballApi = require('../services/footballApi');
    await footballApi.syncFixturesByLeague(
      req.params.leagueId,
      req.params.season
    );

    res.json({ message: 'Matches sync started' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/matches/:id - Update match
router.patch('/:id', async (req, res) => {
  try {
    const match = await Match.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    res.json(match);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/matches/:id - Delete match
router.delete('/:id', async (req, res) => {
  try {
    const match = await Match.findByIdAndDelete(req.params.id);

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    res.json({ message: 'Match deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

---

## ✅ 4 Routes Supplémentaires Créées !

5. ✅ **Products Routes** - E-commerce complet
6. ✅ **Orders Routes** - Gestion commandes
7. ✅ **Leagues Routes** - Football leagues + sync
8. ✅ **Matches Routes** - Matchs + lineups + live

**Prochaines routes** : News, Standings, Favorites, Admin

Je continue avec les dernières routes ! 🚀
