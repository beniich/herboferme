import express from 'express';
// Assumes an authentication middleware exists at '../middleware/authorize' or similar
// Let's use the one that is standard in the project. The guide says '../middleware/auth'
// I will use `authorize` as the user's project uses `import { authorize } from '../middleware/authorize';` based on previous files, but we'll import it as auth just in case.
// Looking at the previous context, `authorize.test.ts` existed in `../middleware/authorize`. So we should use that.
import { authenticate } from '../middleware/authenticate.js';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getUpcomingTasks,
  getCultureCalendar,
  getEventStats,
} from '../controllers/calendar.controller.js';

const router = express.Router();

// Tous les événements (avec filtres)
router.get('/events', authenticate, getEvents);
router.get('/events/:id', authenticate, getEventById);
router.post('/events', authenticate, createEvent);
router.put('/events/:id', authenticate, updateEvent);
router.delete('/events/:id', authenticate, deleteEvent);
router.get('/upcoming-tasks', authenticate, getUpcomingTasks);
router.get('/culture-calendar', authenticate, getCultureCalendar);
router.get('/stats', authenticate, getEventStats);

export default router;
