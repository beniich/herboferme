# 🌾 AgroMaître - Module Calendrier Agricole (Backend Complet)

## 📋 PARTIE 1 : MODÈLES DE DONNÉES

### 1. Modèle Événement Agricole

```typescript
// backend/models/AgriEvent.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IAgriEvent extends Document {
  type: 'culture_cycle' | 'worker_task' | 'admin_meeting' | 'delivery' | 'maintenance';
  title: string;
  description?: string;
  
  // Dates
  startDate: Date;
  endDate?: Date;
  allDay: boolean;
  
  // Culture spécifique
  culture?: {
    name: string; // Blé, Maïs, Tomate, etc.
    variety?: string;
    surface: number; // en hectares
    plotId?: mongoose.Types.ObjectId;
  };
  
  // Tâches
  task?: {
    assignedTo: mongoose.Types.ObjectId[]; // Workers
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    equipmentNeeded: string[];
    estimatedDuration: number; // en heures
  };
  
  // Météo (optionnel - intégration API météo)
  weatherConditions?: {
    temperature: number;
    rainfall: number;
    windSpeed: number;
    favorable: boolean;
  };
  
  // Récurrence
  recurrence?: {
    pattern: 'daily' | 'weekly' | 'monthly' | 'seasonal';
    interval: number;
    endDate?: Date;
  };
  
  // Ressources
  resources?: {
    waterUsage?: number; // en m³
    fertilizerUsage?: number; // en kg
    seedsUsage?: number; // en kg
    cost?: number; // en MAD
  };
  
  // Notifications
  notifications: {
    email: boolean;
    sms: boolean;
    app: boolean;
    daysBeforeAlert: number[];
  };
  
  // Méta
  domain: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  color: string; // Pour le calendrier
  tags: string[];
  attachments?: string[]; // URLs
  notes?: string;
}

const agriEventSchema = new Schema<IAgriEvent>(
  {
    type: {
      type: String,
      enum: ['culture_cycle', 'worker_task', 'admin_meeting', 'delivery', 'maintenance'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    
    startDate: {
      type: Date,
      required: true,
    },
    endDate: Date,
    allDay: {
      type: Boolean,
      default: false,
    },
    
    culture: {
      name: String,
      variety: String,
      surface: Number,
      plotId: {
        type: Schema.Types.ObjectId,
        ref: 'Plot',
      },
    },
    
    task: {
      assignedTo: [{
        type: Schema.Types.ObjectId,
        ref: 'Worker',
      }],
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'cancelled'],
        default: 'pending',
      },
      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
      },
      equipmentNeeded: [String],
      estimatedDuration: Number,
    },
    
    weatherConditions: {
      temperature: Number,
      rainfall: Number,
      windSpeed: Number,
      favorable: Boolean,
    },
    
    recurrence: {
      pattern: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'seasonal'],
      },
      interval: Number,
      endDate: Date,
    },
    
    resources: {
      waterUsage: Number,
      fertilizerUsage: Number,
      seedsUsage: Number,
      cost: Number,
    },
    
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: false,
      },
      app: {
        type: Boolean,
        default: true,
      },
      daysBeforeAlert: {
        type: [Number],
        default: [1, 3, 7],
      },
    },
    
    domain: {
      type: Schema.Types.ObjectId,
      ref: 'Domain',
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    color: {
      type: String,
      default: '#10b981', // green-500
    },
    tags: [String],
    attachments: [String],
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
agriEventSchema.index({ domain: 1, startDate: 1 });
agriEventSchema.index({ type: 1, startDate: 1 });
agriEventSchema.index({ 'task.assignedTo': 1 });

export default mongoose.model<IAgriEvent>('AgriEvent', agriEventSchema);
```

---

## 📋 PARTIE 2 : ROUTES API

```typescript
// backend/routes/calendar.routes.ts
import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getUpcomingTasks,
  getCultureCalendar,
  getEventStats,
} from '../controllers/calendar.controller';

const router = express.Router();

// Tous les événements (avec filtres)
router.get('/events', authenticate, getEvents);

// Événement par ID
router.get('/events/:id', authenticate, getEventById);

// Créer événement
router.post('/events', authenticate, createEvent);

// Modifier événement
router.put('/events/:id', authenticate, updateEvent);

// Supprimer événement
router.delete('/events/:id', authenticate, deleteEvent);

// Tâches à venir
router.get('/upcoming-tasks', authenticate, getUpcomingTasks);

// Calendrier des cultures
router.get('/culture-calendar', authenticate, getCultureCalendar);

// Statistiques
router.get('/stats', authenticate, getEventStats);

export default router;
```

---

## 📋 PARTIE 3 : CONTRÔLEUR

```typescript
// backend/controllers/calendar.controller.ts
import { Request, Response } from 'express';
import AgriEvent from '../models/AgriEvent';
import moment from 'moment';

/**
 * Get all events with filters
 */
export const getEvents = async (req: any, res: Response) => {
  try {
    const {
      startDate,
      endDate,
      type,
      status,
      assignedTo,
      culture,
    } = req.query;

    // Build query
    const query: any = {
      domain: req.user.domain,
    };

    // Date range filter
    if (startDate && endDate) {
      query.startDate = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    // Type filter
    if (type) {
      query.type = type;
    }

    // Status filter
    if (status) {
      query['task.status'] = status;
    }

    // Assigned to filter
    if (assignedTo) {
      query['task.assignedTo'] = assignedTo;
    }

    // Culture filter
    if (culture) {
      query['culture.name'] = culture;
    }

    const events = await AgriEvent.find(query)
      .populate('task.assignedTo', 'firstName lastName')
      .populate('culture.plotId', 'name surface')
      .sort({ startDate: 1 });

    res.json({
      success: true,
      events,
      count: events.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get event by ID
 */
export const getEventById = async (req: any, res: Response) => {
  try {
    const event = await AgriEvent.findOne({
      _id: req.params.id,
      domain: req.user.domain,
    })
      .populate('task.assignedTo', 'firstName lastName email phone')
      .populate('culture.plotId')
      .populate('createdBy', 'firstName lastName');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.json({
      success: true,
      event,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Create new event
 */
export const createEvent = async (req: any, res: Response) => {
  try {
    const eventData = {
      ...req.body,
      domain: req.user.domain,
      createdBy: req.user.id,
    };

    const event = await AgriEvent.create(eventData);

    // TODO: Send notifications if enabled

    res.status(201).json({
      success: true,
      event,
      message: 'Event created successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update event
 */
export const updateEvent = async (req: any, res: Response) => {
  try {
    const event = await AgriEvent.findOneAndUpdate(
      {
        _id: req.params.id,
        domain: req.user.domain,
      },
      req.body,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.json({
      success: true,
      event,
      message: 'Event updated successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete event
 */
export const deleteEvent = async (req: any, res: Response) => {
  try {
    const event = await AgriEvent.findOneAndDelete({
      _id: req.params.id,
      domain: req.user.domain,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get upcoming tasks
 */
export const getUpcomingTasks = async (req: any, res: Response) => {
  try {
    const { days = 7 } = req.query;

    const tasks = await AgriEvent.find({
      domain: req.user.domain,
      type: 'worker_task',
      startDate: {
        $gte: new Date(),
        $lte: moment().add(parseInt(days as string), 'days').toDate(),
      },
      'task.status': { $ne: 'completed' },
    })
      .populate('task.assignedTo', 'firstName lastName')
      .sort({ startDate: 1 })
      .limit(20);

    res.json({
      success: true,
      tasks,
      count: tasks.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get culture calendar (cycles)
 */
export const getCultureCalendar = async (req: any, res: Response) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const cultures = await AgriEvent.find({
      domain: req.user.domain,
      type: 'culture_cycle',
      startDate: {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`),
      },
    }).sort({ 'culture.name': 1, startDate: 1 });

    // Group by culture
    const grouped = cultures.reduce((acc: any, event) => {
      const cultureName = event.culture?.name || 'Unknown';
      if (!acc[cultureName]) {
        acc[cultureName] = [];
      }
      acc[cultureName].push(event);
      return acc;
    }, {});

    res.json({
      success: true,
      cultures: grouped,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get event statistics
 */
export const getEventStats = async (req: any, res: Response) => {
  try {
    const stats = await AgriEvent.aggregate([
      {
        $match: {
          domain: req.user.domain,
        },
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalCost: { $sum: '$resources.cost' },
        },
      },
    ]);

    const taskStats = await AgriEvent.aggregate([
      {
        $match: {
          domain: req.user.domain,
          type: 'worker_task',
        },
      },
      {
        $group: {
          _id: '$task.status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      stats: {
        byType: stats,
        taskStatus: taskStats,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
```

Suite dans le prochain fichier avec le frontend moderne ! 🚀
