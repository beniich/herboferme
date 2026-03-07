import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  getAttendance,
  checkIn,
  checkOut,
  getAttendanceStats,
} from '../controllers/attendance.controller.js';

const router = express.Router();

router.get('/', authenticate, getAttendance);
router.post('/check-in', authenticate, checkIn);
router.post('/check-out', authenticate, checkOut);
router.get('/stats', authenticate, getAttendanceStats);

export default router;
