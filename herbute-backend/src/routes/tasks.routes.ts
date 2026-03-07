import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/tasks.controller.js';

const router = express.Router();

router.get('/', authenticate, getTasks);
router.get('/:id', authenticate, getTaskById);
router.post('/', authenticate, createTask);
router.put('/:id', authenticate, updateTask);
router.delete('/:id', authenticate, deleteTask);

export default router;
