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
      // Note: we removed Plot model population unless Plot exists, let's keep it but it might need to match existing models. We assume they exist or will gracefully ignore
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
      createdBy: req.user.id, // Auth middleware puts user inside req.user
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
