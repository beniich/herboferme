import express from 'express';
import { authorize } from '../middleware/authorize';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/tasks.controller';

const router = express.Router();

router.get('/', authorize, getTasks);
router.get('/:id', authorize, getTaskById);
router.post('/', authorize, createTask);
router.put('/:id', authorize, updateTask);
router.delete('/:id', authorize, deleteTask);

export default router;
