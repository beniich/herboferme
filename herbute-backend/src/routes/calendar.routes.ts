import express from 'express';
// Assumes an authentication middleware exists at '../middleware/authorize' or similar
// Let's use the one that is standard in the project. The guide says '../middleware/auth'
// I will use `authorize` as the user's project uses `import { authorize } from '../middleware/authorize';` based on previous files, but we'll import it as auth just in case.
// Looking at the previous context, `authorize.test.ts` existed in `../middleware/authorize`. So we should use that.
import { authorize } from '../middleware/authorize';
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
router.get('/events', authorize, getEvents);

// Événement par ID
router.get('/events/:id', authorize, getEventById);

// Créer événement
router.post('/events', authorize, createEvent);

// Modifier événement
router.put('/events/:id', authorize, updateEvent);

// Supprimer événement
router.delete('/events/:id', authorize, deleteEvent);

// Tâches à venir
router.get('/upcoming-tasks', authorize, getUpcomingTasks);

// Calendrier des cultures
router.get('/culture-calendar', authorize, getCultureCalendar);

// Statistiques
router.get('/stats', authorize, getEventStats);

export default router;
