import express from 'express';
import { authorize } from '../middleware/authorize';
import {
  getAttendance,
  checkIn,
  checkOut,
  getAttendanceStats,
} from '../controllers/attendance.controller';

const router = express.Router();

router.get('/', authorize, getAttendance);
router.post('/check-in', authorize, checkIn);
router.post('/check-out', authorize, checkOut);
router.get('/stats', authorize, getAttendanceStats);

export default router;
