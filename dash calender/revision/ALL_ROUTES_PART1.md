# 🛣️ FootballHub+ - TOUTES LES ROUTES API - PARTIE 1

## Route 1 : Authentication

```javascript
// src/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, country } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      country,
    });

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id)
      .populate('favoriteLeagues', 'name logo')
      .populate('favoriteTeams', 'name logo');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// PUT /api/auth/profile
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByIdAndUpdate(
      decoded.id,
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone,
        country: req.body.country,
        city: req.body.city,
        avatar: req.body.avatar,
      },
      { new: true, runValidators: true }
    );

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/push-token
router.post('/push-token', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await User.findByIdAndUpdate(decoded.id, {
      pushToken: req.body.token,
    });

    res.json({ success: true, message: 'Push token saved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

## Route 2 : Members

```javascript
// src/routes/members.js
const express = require('express');
const router = express.Router();
const Member = require('../models/Member');

// GET /api/members
router.get('/', async (req, res) => {
  try {
    const { status, role, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (role) query.role = role;
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

// GET /api/members/stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await Member.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          totalSpent: { $sum: '$totalSpent' },
        },
      },
    ]);

    const totalMembers = await Member.countDocuments();
    const activeMembers = await Member.countDocuments({ status: 'Active' });

    res.json({
      stats,
      totalMembers,
      activeMembers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/members/:id
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

// POST /api/members
router.post('/', async (req, res) => {
  try {
    const member = await Member.create(req.body);
    res.status(201).json(member);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH /api/members/:id
router.patch('/:id', async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json(member);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/members/:id
router.delete('/:id', async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json({ message: 'Member deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

## Route 3 : Events

```javascript
// src/routes/events.js
const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// GET /api/events
router.get('/', async (req, res) => {
  try {
    const {
      category,
      status,
      featured,
      upcoming,
      search,
      page = 1,
      limit = 20,
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
      ];
    }

    const events = await Event.find(query)
      .populate('organizer', 'firstName lastName')
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

// GET /api/events/:id
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'firstName lastName email')
      .populate('attendees.member', 'firstName lastName email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/events
router.post('/', async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH /api/events/:id
router.patch('/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/events/:id
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/events/:id/register
router.post('/:id/register', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check capacity
    if (event.capacity && event.attendees.length >= event.capacity) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Check if already registered
    const alreadyRegistered = event.attendees.some(
      (a) => a.member.toString() === req.body.memberId
    );

    if (alreadyRegistered) {
      return res.status(400).json({ message: 'Already registered' });
    }

    // Add attendee
    event.attendees.push({
      member: req.body.memberId,
      status: 'Confirmed',
    });

    await event.save();

    res.json({ message: 'Registration successful', event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

## Route 4 : Tickets

```javascript
// src/routes/tickets.js
const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const Member = require('../models/Member');

// GET /api/tickets
router.get('/', async (req, res) => {
  try {
    const { memberId, eventId, status, type, page = 1, limit = 20 } = req.query;

    const query = {};
    if (memberId) query.member = memberId;
    if (eventId) query.event = eventId;
    if (status) query.status = status;
    if (type) query.ticketType = type;

    const tickets = await Ticket.find(query)
      .populate('event', 'title startDate venue category')
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

// GET /api/tickets/:id
router.get('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('event')
      .populate('member')
      .populate('validatedBy', 'firstName lastName');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/tickets/qr/:qrCode
router.get('/qr/:qrCode', async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ qrCode: req.params.qrCode })
      .populate('event')
      .populate('member');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/tickets
router.post('/', async (req, res) => {
  try {
    const { eventId, memberId, ticketType, price, seating } = req.body;

    // Check event capacity
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const ticketCount = await Ticket.countDocuments({ event: eventId });
    if (event.capacity && ticketCount >= event.capacity) {
      return res.status(400).json({ message: 'Event sold out' });
    }

    // Create ticket
    const ticket = await Ticket.create({
      event: eventId,
      member: memberId,
      ticketType,
      price,
      seating,
    });

    // Update member
    await Member.findByIdAndUpdate(memberId, {
      $push: { tickets: ticket._id },
      $inc: { totalSpent: price },
    });

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('event')
      .populate('member');

    res.status(201).json(populatedTicket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/tickets/:id/validate
router.post('/:id/validate', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('event');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.status !== 'Valid') {
      return res.status(400).json({ message: `Ticket is ${ticket.status}` });
    }

    if (ticket.isValidated) {
      return res.status(400).json({
        message: 'Ticket already validated',
        validatedAt: ticket.validatedAt,
      });
    }

    // Check event timing
    const now = new Date();
    const eventStart = new Date(ticket.event.startDate);
    const hoursBefore = (eventStart - now) / (1000 * 60 * 60);

    if (hoursBefore > 2) {
      return res.status(400).json({
        message: 'Too early to validate. Event starts in ' + Math.round(hoursBefore) + ' hours',
      });
    }

    // Validate ticket
    ticket.status = 'Used';
    ticket.isValidated = true;
    ticket.validatedAt = new Date();
    ticket.validatedBy = req.body.validatorId;

    await ticket.save();

    res.json({
      success: true,
      message: 'Ticket validated successfully',
      ticket,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/tickets/validate-qr
router.post('/validate-qr', async (req, res) => {
  try {
    const { qrCode, validatorId } = req.body;

    // Decode QR
    const qrData = JSON.parse(Buffer.from(qrCode, 'base64').toString('utf-8'));

    const ticket = await Ticket.findOne({ ticketNumber: qrData.ticketNumber })
      .populate('event')
      .populate('member');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    if (ticket.status !== 'Valid') {
      return res.status(400).json({
        success: false,
        message: `Ticket is ${ticket.status}`,
      });
    }

    if (ticket.isValidated) {
      return res.status(400).json({
        success: false,
        message: 'Ticket already used',
        validatedAt: ticket.validatedAt,
      });
    }

    // Validate
    ticket.status = 'Used';
    ticket.isValidated = true;
    ticket.validatedAt = new Date();
    ticket.validatedBy = validatorId;
    await ticket.save();

    res.json({
      success: true,
      message: 'Ticket validated successfully',
      ticket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// DELETE /api/tickets/:id
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

    res.json({ message: 'Ticket cancelled', ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

Suite dans le prochain fichier avec Products, Orders, Leagues, Matches, News ! 🚀
